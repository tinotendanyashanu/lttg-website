'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session.user;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

// ── Reply to ticket ────────────────────────────────────────────────────────────

export async function adminReplyToTicket(
  ticketId: string,
  content: string,
  newStatus?: 'new' | 'open' | 'in_progress' | 'waiting_client' | 'escalated' | 'resolved' | 'closed',
) {
  const admin = await checkAdmin();
  await dbConnect();

  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const now = new Date();
  const message = {
    senderRole: 'admin',
    senderName: 'LeoTheTechGuy Team',
    content: content.trim(),
    createdAt: now,
  };

  const set: Record<string, unknown> = {};
  if (newStatus) {
    set.status = newStatus;
    if (newStatus === 'resolved') set.resolvedAt = now;
  }

  // Stamp first response + evaluate SLA the first time the team replies.
  if (!ticket.firstResponseAt) {
    set.firstResponseAt = now;
    if (ticket.firstResponseDueAt && now > new Date(ticket.firstResponseDueAt)) {
      set.slaFirstResponseBreached = true;
    }
  }

  const activityEntry = {
    type: 'reply',
    actor: admin.name || 'Support Agent',
    actorRole: 'admin',
    detail: newStatus ? `Replied · status → ${newStatus.replace(/_/g, ' ')}` : 'Replied to client',
    createdAt: now,
  };

  const updates: Record<string, unknown> = {
    $push: { messages: message, activity: activityEntry },
    ...(Object.keys(set).length ? { $set: set } : {}),
  };

  await SupportTicket.findByIdAndUpdate(ticketId, updates);

  // Keep the linked conversation thread preview fresh.
  if (ticket.threadId) {
    const { MessageThread } = await import('@/models/MessageThread');
    await MessageThread.findByIdAndUpdate(ticket.threadId, {
      $set: { lastMessageAt: now, lastMessagePreview: content.trim().slice(0, 140) },
      $inc: { unreadByClient: 1 },
    }).catch(() => {});
  }

  const client = await Account.findById(ticket.clientId, 'fullName email').lean();
  const portalLink = `${getBaseUrl()}/portal/client/tickets/${ticketId}`;

  if (client) {
    await ClientNotification.create({
      clientId: ticket.clientId,
      type: 'ticket_response',
      title: `New reply on ticket ${ticket.ticketId}`,
      message: `Our team replied to your ticket: "${ticket.subject}". Tap to view.`,
      actionUrl: `/portal/client/tickets/${ticketId}`,
    });

    try {
      await sendEmail({
        to: (client as any).email,
        subject: `Re: ${ticket.subject} [${ticket.ticketId}]`,
        html: EmailTemplates.ticketReply(
          (client as any).fullName,
          ticket.ticketId,
          ticket.subject,
          content.trim(),
          portalLink,
        ),
      });
    } catch (_) {}
  }

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: 'admin_ticket_reply',
    performedBy: admin.id,
    details: { ticketId: ticket.ticketId, newStatus },
    metadata: { ticketId: ticket.ticketId, newStatus },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  revalidatePath(`/portal/client/tickets/${ticketId}`);
  return { success: true };
}

// ── Update ticket status ───────────────────────────────────────────────────────

export async function adminUpdateTicketStatus(
  ticketId: string,
  newStatus: 'new' | 'open' | 'in_progress' | 'waiting_client' | 'escalated' | 'resolved' | 'closed',
  notifyClient = true,
) {
  const admin = await checkAdmin();
  await dbConnect();

  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const now = new Date();
  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'resolved' || newStatus === 'closed') {
    if (!ticket.resolvedAt) updateData.resolvedAt = now;
    const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt) : now;
    if (ticket.resolutionDueAt && resolvedTime > new Date(ticket.resolutionDueAt)) {
      updateData.slaResolutionBreached = true;
    }
  }

  await SupportTicket.findByIdAndUpdate(ticketId, {
    $set: updateData,
    $push: {
      activity: {
        type: 'status_change',
        actor: admin.name || 'Admin',
        actorRole: 'admin',
        detail: `Status → ${newStatus.replace(/_/g, ' ')}`,
        createdAt: now,
      },
    },
  });

  const client = await Account.findById(ticket.clientId, 'fullName email').lean();
  const portalLink = `${getBaseUrl()}/portal/client/tickets/${ticketId}`;

  if (client && notifyClient) {
    await ClientNotification.create({
      clientId: ticket.clientId,
      type: 'ticket_response',
      title: `Ticket ${ticket.ticketId} — ${newStatus.replace(/_/g, ' ')}`,
      message: `Your ticket "${ticket.subject}" status has been updated to ${newStatus.replace(/_/g, ' ')}.`,
      actionUrl: `/portal/client/tickets/${ticketId}`,
    });

    try {
      await sendEmail({
        to: (client as any).email,
        subject: `Ticket Update: ${ticket.subject} [${ticket.ticketId}]`,
        html: EmailTemplates.ticketStatusUpdate(
          (client as any).fullName,
          ticket.ticketId,
          ticket.subject,
          newStatus,
          portalLink,
        ),
      });
    } catch (_) {}
  }

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: `ticket_status_${newStatus}`,
    performedBy: admin.id,
    details: { ticketId: ticket.ticketId, newStatus, previousStatus: ticket.status },
    metadata: { ticketId: ticket.ticketId, newStatus },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  revalidatePath(`/portal/client/tickets/${ticketId}`);
  return { success: true };
}

// ── Create ticket on behalf of a client ───────────────────────────────────────

export async function adminCreateTicket(data: {
  clientId: string;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
}) {
  const admin = await checkAdmin();
  await dbConnect();

  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const client = await Account.findOne({ _id: data.clientId, roles: 'client' }).lean();
  if (!client) throw new Error('Client not found');
  const resolvedClientId = (client as any).linkedClientAccountId
    ? (client as any).linkedClientAccountId.toString()
    : data.clientId;

  const count = await SupportTicket.countDocuments();
  const ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;

  const { computeSlaDueDates } = await import('@/lib/services/support-sla');
  const sla = computeSlaDueDates((data.priority || 'medium') as any);

  const ticket = await SupportTicket.create({
    ticketId,
    clientId: resolvedClientId,
    subject: data.subject,
    description: data.description,
    priority: data.priority || 'medium',
    category: data.category || 'general_inquiry',
    status: 'new',
    aiProcessingStatus: 'pending',
    firstResponseDueAt: sla.firstResponseDueAt,
    resolutionDueAt: sla.resolutionDueAt,
    activity: [
      {
        type: 'created',
        actor: admin.name || 'Admin',
        actorRole: 'admin',
        detail: 'Ticket created on behalf of client',
        createdAt: new Date(),
      },
    ],
  });

  // Linked conversation thread + fire-and-forget AI processing.
  try {
    const { MessageThread } = await import('@/models/MessageThread');
    const thread = await MessageThread.create({
      clientId: resolvedClientId,
      subject: `[${ticketId}] ${data.subject}`,
      participants: [resolvedClientId],
      ticketId: ticket._id,
      lastMessagePreview: data.description.slice(0, 140),
    });
    ticket.threadId = thread._id;
    await ticket.save();
  } catch (_) {}

  try {
    const { reprocessTicketAI } = await import('@/lib/actions/support-center');
    void reprocessTicketAI(String(ticket._id)).catch(() => {});
  } catch (_) {}

  await ClientNotification.create({
    clientId: resolvedClientId,
    type: 'ticket_response',
    title: `New Support Ticket: ${ticketId}`,
    message: `A support ticket has been created for you: "${data.subject}". You can view it in your portal.`,
    actionUrl: `/portal/client/tickets/${ticket._id}`,
  });

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticket._id,
    action: 'admin_created_ticket',
    performedBy: admin.id,
    details: { ticketId, clientId: resolvedClientId, subject: data.subject },
    metadata: { ticketId, subject: data.subject },
  });

  revalidatePath('/admin/tickets');
  revalidatePath('/portal/client/tickets');
  return { success: true, ticketId, ticketDocId: ticket._id.toString() };
}

// ── Get all tickets (admin) ────────────────────────────────────────────────────

export async function getAdminTickets() {
  await checkAdmin();
  await dbConnect();

  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const tickets = await SupportTicket.find().sort({ createdAt: -1 }).limit(500).lean();
  const clientIds = [...new Set(tickets.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  return { tickets: JSON.parse(JSON.stringify(tickets)), accountMap };
}

// ── Get single ticket (admin) ─────────────────────────────────────────────────

export async function getAdminTicket(ticketId: string) {
  await checkAdmin();
  await dbConnect();

  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const ticket = await SupportTicket.findById(ticketId).lean();
  if (!ticket) return null;

  const client = await Account.findById((ticket as any).clientId, 'fullName email clientProfile').lean();
  return {
    ticket: JSON.parse(JSON.stringify(ticket)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}
