/**
 * WhatsApp Business webhook.
 *
 * GET  — Meta verification handshake (hub.challenge).
 * POST — Inbound messages → normalize → ingestChannelMessage → SupportTicket.
 *
 * Signature verified with WHATSAPP_APP_SECRET (or META_APP_SECRET as fallback).
 * Always returns 200 to Meta so deliveries are not retried into a loop.
 *
 * Register this URL in Meta Business Manager:
 *   https://yourdomain.com/api/webhooks/whatsapp
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ingestChannelMessage } from '@/lib/services/support-intake';

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;
  if (!secret) return true; // not configured → allow (dev only — set secret in prod)
  if (!signature) return false;
  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ── GET: Meta verification handshake ──────────────────────────────────────────
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN;
  if (mode === 'subscribe' && token && token === verifyToken) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ── POST: inbound message ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  let body: any;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Normalize WhatsApp Cloud API payload into InboundMessage objects.
  const normalized: { externalId: string; displayName?: string; text: string }[] = [];
  for (const entry of body?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const contactName = value?.contacts?.[0]?.profile?.name;
      for (const msg of value?.messages || []) {
        const text =
          msg?.text?.body ||
          msg?.button?.text ||
          msg?.[msg?.type]?.caption ||
          '';
        if (!msg?.from || !text) continue;
        normalized.push({ externalId: msg.from, displayName: contactName, text });
      }
    }
  }

  const results: { ticketRef: string; created: boolean }[] = [];
  for (const msg of normalized) {
    try {
      const r = await ingestChannelMessage({
        channel: 'whatsapp',
        externalId: msg.externalId,
        handle: msg.externalId,
        displayName: msg.displayName,
        text: msg.text,
      });
      results.push({ ticketRef: r.ticketRef, created: r.created });
    } catch (err) {
      console.error('WhatsApp ingest error:', (err as Error).message);
    }
  }

  return NextResponse.json({ success: true, ingested: results.length, results });
}
