/**
 * Support Center — multi-channel intake.
 *
 * Channel-agnostic ingestion of inbound messages from external channels
 * (WhatsApp / Instagram / Messenger / voice transcripts) into the existing
 * SupportTicket model. A contact's open ticket is reused so a back-and-forth
 * conversation stays on one ticket; otherwise a new ticket is created and AI
 * triage fires fire-and-forget — exactly like the web portal path.
 *
 * External-channel tickets have no first-party Account, so `clientId` is left
 * unset and the sender identity lives in `channelContact`. Every other surface
 * already null-checks the client, so these tickets render safely everywhere.
 */

import dbConnect from '@/lib/mongodb';
import { OPEN_STATUSES, channelLabel, type TicketChannel } from '@/lib/support/constants';
import { computeSlaDueDates } from '@/lib/services/support-sla';

export interface InboundMessage {
  channel: TicketChannel;
  externalId: string; // provider-scoped sender id (wa_id / IGSID / PSID / caller id)
  handle?: string; // phone / @handle
  displayName?: string;
  text: string;
  subject?: string; // optional; falls back to a generated subject
  attachments?: { url: string; name: string; size?: number; mimeType?: string }[];
}

export interface IngestResult {
  ticketId: string; // mongo _id
  ticketRef: string; // human TKT-xxxxx
  created: boolean; // true if a new ticket was opened
}

function firstLine(text: string, max = 80): string {
  const line = (text || '').split('\n').map((l) => l.trim()).find(Boolean) || '';
  return line.slice(0, max) || 'New message';
}

/**
 * Ingest one inbound channel message. Never throws on the AI path; returns the
 * affected ticket so the caller (webhook) can dispatch an acknowledgement.
 */
export async function ingestChannelMessage(input: InboundMessage): Promise<IngestResult> {
  if (!input.externalId) throw new Error('externalId is required');
  if (!input.text && !(input.attachments && input.attachments.length)) {
    throw new Error('Message has no content');
  }

  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const now = new Date();
  const senderName = input.displayName || input.handle || `${channelLabel(input.channel)} contact`;

  // Reuse an existing OPEN ticket from this contact on this channel.
  const existing = await SupportTicket.findOne({
    channel: input.channel,
    'channelContact.externalId': input.externalId,
    status: { $in: OPEN_STATUSES },
  }).sort({ updatedAt: -1 });

  if (existing) {
    existing.messages.push({
      senderRole: 'client',
      senderName,
      content: input.text || '(attachment)',
      attachments: input.attachments || [],
      createdAt: now,
    } as any);
    // A new inbound message re-opens a ticket that was waiting on the client.
    if (existing.status === 'waiting_client') existing.status = 'open';
    existing.activity = existing.activity || [];
    existing.activity.push({
      type: 'reply',
      actor: senderName,
      actorRole: 'client',
      detail: `Inbound ${channelLabel(input.channel)} message`,
      createdAt: now,
    });
    await existing.save();
    return { ticketId: String(existing._id), ticketRef: existing.ticketId, created: false };
  }

  // Otherwise open a new ticket on this channel.
  const count = await SupportTicket.countDocuments();
  const ticketRef = `TKT-${String(count + 1).padStart(5, '0')}`;
  const subject = input.subject?.trim() || firstLine(input.text);
  const sla = computeSlaDueDates('medium');

  const ticket = await SupportTicket.create({
    ticketId: ticketRef,
    channel: input.channel,
    channelContact: {
      externalId: input.externalId,
      handle: input.handle,
      displayName: input.displayName,
    },
    subject,
    description: input.text || '(attachment only)',
    priority: 'medium',
    category: 'general_inquiry',
    status: 'new',
    aiProcessingStatus: 'pending',
    firstResponseDueAt: sla.firstResponseDueAt,
    resolutionDueAt: sla.resolutionDueAt,
    messages: [
      {
        senderRole: 'client',
        senderName,
        content: input.text || '(attachment)',
        attachments: input.attachments || [],
        createdAt: now,
      },
    ],
    activity: [
      {
        type: 'created',
        actor: senderName,
        actorRole: 'client',
        detail: `Ticket created via ${channelLabel(input.channel)}`,
        createdAt: now,
      },
    ],
  });

  // Fire-and-forget AI triage — must never block or fail ingestion.
  try {
    const { reprocessTicketAI } = await import('@/lib/actions/support-center');
    void reprocessTicketAI(String(ticket._id)).catch(() => {});
  } catch (_) {}

  return { ticketId: String(ticket._id), ticketRef, created: true };
}
