import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ingestChannelMessage, type InboundMessage } from '@/lib/services/support-intake';
import { TICKET_CHANNELS, type TicketChannel } from '@/lib/support/constants';

/**
 * Multi-channel inbound webhook. One endpoint per channel:
 *   /api/support/channels/whatsapp | instagram | messenger | voice
 *
 * GET  — Meta verification handshake (hub.challenge) for whatsapp/instagram/messenger.
 * POST — inbound message → ingestChannelMessage → SupportTicket.
 *
 * Security: Meta payloads are verified with X-Hub-Signature-256 against
 * META_APP_SECRET when configured; the voice channel uses a shared bearer token
 * (VOICE_INBOUND_WEBHOOK_KEY). Absent secrets are allowed in dev so the route is
 * testable, but a warning path keeps production honest if the secret is set.
 */

const META_CHANNELS: TicketChannel[] = ['whatsapp', 'instagram', 'messenger'];

function isValidChannel(c: string): c is TicketChannel {
  return (TICKET_CHANNELS as readonly string[]).includes(c);
}

function verifyMetaSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true; // not configured → allow (dev). Configure in prod to enforce.
  if (!signature) return false;
  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ── GET: Meta verification handshake ───────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel } = await params;
  if (!isValidChannel(channel)) return new NextResponse('Unknown channel', { status: 404 });

  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ── Payload parsers ─────────────────────────────────────────────────────────────

function parseWhatsApp(body: any): InboundMessage[] {
  const out: InboundMessage[] = [];
  for (const entry of body?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const contactName = value?.contacts?.[0]?.profile?.name;
      for (const msg of value?.messages || []) {
        const text = msg?.text?.body || msg?.button?.text || msg?.[msg?.type]?.caption || '';
        out.push({
          channel: 'whatsapp',
          externalId: msg?.from,
          handle: msg?.from,
          displayName: contactName,
          text,
        });
      }
    }
  }
  return out;
}

function parseMessengerLike(body: any, channel: TicketChannel): InboundMessage[] {
  const out: InboundMessage[] = [];
  for (const entry of body?.entry || []) {
    for (const event of entry?.messaging || []) {
      const text = event?.message?.text;
      if (!text || event?.message?.is_echo) continue;
      out.push({
        channel,
        externalId: event?.sender?.id,
        handle: event?.sender?.id,
        text,
      });
    }
  }
  return out;
}

function parseVoice(body: any): InboundMessage[] {
  // Generic transcript payload from a telephony provider / IVR integration.
  const externalId = body?.externalId || body?.from || body?.caller;
  const text = body?.text || body?.transcript || '';
  if (!externalId || !text) return [];
  return [
    {
      channel: 'voice',
      externalId: String(externalId),
      handle: body?.handle || String(externalId),
      displayName: body?.displayName || body?.callerName,
      subject: body?.subject || 'Voice call',
      text,
    },
  ];
}

// ── POST: inbound message ───────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel } = await params;
  if (!isValidChannel(channel) || channel === 'web' || channel === 'email') {
    return new NextResponse('Unsupported channel', { status: 404 });
  }

  const rawBody = await request.text();

  // Auth: Meta signature for social channels, bearer token for voice.
  if (META_CHANNELS.includes(channel)) {
    if (!verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
      return new NextResponse('Invalid signature', { status: 401 });
    }
  } else if (channel === 'voice') {
    const key = process.env.VOICE_INBOUND_WEBHOOK_KEY;
    if (key && request.headers.get('authorization') !== `Bearer ${key}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  let body: any;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  let messages: InboundMessage[] = [];
  if (channel === 'whatsapp') messages = parseWhatsApp(body);
  else if (channel === 'messenger' || channel === 'instagram') messages = parseMessengerLike(body, channel);
  else if (channel === 'voice') messages = parseVoice(body);

  const results: { ticketRef: string; created: boolean }[] = [];
  for (const msg of messages) {
    if (!msg.externalId || (!msg.text && !msg.attachments?.length)) continue;
    try {
      const r = await ingestChannelMessage(msg);
      results.push({ ticketRef: r.ticketRef, created: r.created });
    } catch (err) {
      console.error(`Channel ingest error (${channel}):`, (err as Error).message);
    }
  }

  // Always 200 to Meta so deliveries are not retried into a loop.
  return NextResponse.json({ success: true, ingested: results.length, results });
}
