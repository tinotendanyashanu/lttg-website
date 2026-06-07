/**
 * Support Center — outbound channel dispatch.
 *
 * Sends a staff reply back out to the channel a ticket arrived on. WhatsApp /
 * Instagram / Messenger go through the Meta Graph API; voice is delivered as an
 * SMS/notification fallback via a generic webhook. Every provider call is gated
 * on its credentials — when they are absent (e.g. local/dev, or a channel not
 * yet provisioned) the dispatcher is a safe no-op that reports `skipped`, so the
 * reply still lands in the ticket and nothing throws.
 *
 * Required env per channel (all optional — absence disables that channel):
 *   META_GRAPH_TOKEN            page/app access token for Graph API sends
 *   META_WHATSAPP_PHONE_ID      WhatsApp Business phone-number id
 *   VOICE_OUTBOUND_WEBHOOK_URL  generic POST endpoint for voice/SMS replies
 *   VOICE_OUTBOUND_WEBHOOK_KEY  bearer token for the voice webhook (optional)
 */

import type { TicketChannel } from '@/lib/support/constants';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

export interface DispatchTarget {
  channel: TicketChannel;
  externalId?: string; // recipient id (wa_id / PSID / IGSID / caller id)
  handle?: string;
}

export interface DispatchResult {
  delivered: boolean;
  skipped?: boolean;
  reason?: string;
}

async function sendMetaMessage(
  recipientId: string,
  text: string,
  channel: TicketChannel,
): Promise<DispatchResult> {
  const token = process.env.META_GRAPH_TOKEN;
  if (!token) return { delivered: false, skipped: true, reason: 'META_GRAPH_TOKEN not configured' };

  try {
    let endpoint: string;
    let body: Record<string, unknown>;

    if (channel === 'whatsapp') {
      const phoneId = process.env.META_WHATSAPP_PHONE_ID;
      if (!phoneId) return { delivered: false, skipped: true, reason: 'META_WHATSAPP_PHONE_ID not configured' };
      endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`;
      body = {
        messaging_product: 'whatsapp',
        to: recipientId,
        type: 'text',
        text: { body: text },
      };
    } else {
      // Messenger + Instagram share the Send API shape.
      endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/me/messages`;
      body = { recipient: { id: recipientId }, message: { text }, messaging_type: 'RESPONSE' };
    }

    const res = await fetch(`${endpoint}?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { delivered: false, reason: `Graph API ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { delivered: true };
  } catch (err) {
    return { delivered: false, reason: (err as Error).message };
  }
}

async function sendVoiceReply(target: DispatchTarget, text: string): Promise<DispatchResult> {
  const webhook = process.env.VOICE_OUTBOUND_WEBHOOK_URL;
  if (!webhook) return { delivered: false, skipped: true, reason: 'VOICE_OUTBOUND_WEBHOOK_URL not configured' };
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.VOICE_OUTBOUND_WEBHOOK_KEY) {
      headers.Authorization = `Bearer ${process.env.VOICE_OUTBOUND_WEBHOOK_KEY}`;
    }
    const res = await fetch(webhook, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to: target.externalId || target.handle, text }),
    });
    return res.ok
      ? { delivered: true }
      : { delivered: false, reason: `Voice webhook ${res.status}` };
  } catch (err) {
    return { delivered: false, reason: (err as Error).message };
  }
}

/**
 * Dispatch a staff reply to the ticket's originating channel. `web`/`email`
 * tickets are handled by the existing portal + email path and are skipped here.
 * Never throws.
 */
export async function dispatchChannelReply(
  target: DispatchTarget,
  text: string,
): Promise<DispatchResult> {
  if (!text?.trim()) return { delivered: false, skipped: true, reason: 'Empty reply' };
  if (target.channel === 'web' || target.channel === 'email') {
    return { delivered: false, skipped: true, reason: 'Handled by portal/email' };
  }
  const recipient = target.externalId;
  if (!recipient && target.channel !== 'voice') {
    return { delivered: false, skipped: true, reason: 'No recipient id on channel contact' };
  }

  switch (target.channel) {
    case 'whatsapp':
    case 'messenger':
    case 'instagram':
      return sendMetaMessage(recipient!, text, target.channel);
    case 'voice':
      return sendVoiceReply(target, text);
    default:
      return { delivered: false, skipped: true, reason: `Unsupported channel ${target.channel}` };
  }
}
