'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import {
  processTicketAI,
  suggestArticlesForTicket,
  recordTicketKnowledgeGap,
  generateTicketReplyDraft,
  buildKbContextForArticles,
} from '@/lib/services/support-ai';
import { evaluateSla } from '@/lib/services/support-sla';
import { getCustomerHealthList } from '@/lib/services/customer-health';
import {
  OPEN_STATUSES,
  categoryLabel,
  type TicketPriority,
} from '@/lib/support/constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendEmail, EmailTemplates } from '@/lib/email';

// ── Auth ────────────────────────────────────────────────────────────────────

/** Support staff = admin or employee (interns excluded from write actions). */
async function requireSupportStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee') throw new Error('Unauthorized');
  return session!.user;
}

function actorName(user: { name?: string | null; email?: string | null }): string {
  return user.name || user.email || 'Support Agent';
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

/**
 * Fire-and-forget: when a ticket transitions to resolved, draft a KB article from
 * the resolution so the knowledge base keeps improving (Phase B, spec §4). Never
 * blocks or throws — the resolve action must always succeed.
 */
function maybeDraftKnowledgeFromTicket(ticket: any, resolutionText?: string) {
  try {
    import('@/lib/services/ticket-to-knowledge')
      .then(({ draftArticleFromResolvedTicket }) =>
        draftArticleFromResolvedTicket({
          ticketId: String(ticket._id),
          ticketRef: ticket.ticketId,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          resolutionText,
        }),
      )
      .catch(() => {});
  } catch {
    /* never blocks */
  }
}

/** Revalidate every surface that renders a ticket (admin + employee + client). */
function revalidateTicketSurfaces(ticketId: string) {
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  revalidatePath(`/portal/employee/support/${ticketId}`);
  revalidatePath('/portal/employee/support');
  revalidatePath(`/portal/client/tickets/${ticketId}`);
}

interface ReplyAttachment {
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// ── AI processing ─────────────────────────────────────────────────────────────

/**
 * Run (or re-run) AI processing for a ticket: classification + KB suggestions +
 * knowledge-gap detection. Safe to call fire-and-forget; never throws on AI
 * failure (status is marked 'failed' instead). Can also be triggered manually
 * from the ticket UI ("Reprocess with AI").
 */
export async function reprocessTicketAI(ticketId: string) {
  // Allow the system path (creation) to call without an interactive session by
  // gating only when a session exists; the create flow calls this server-side.
  const session = await auth();
  if (session?.user && session.user.role !== 'admin' && session.user.role !== 'employee') {
    throw new Error('Unauthorized');
  }

  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  try {
    const [ai, articles] = await Promise.all([
      processTicketAI({ subject: ticket.subject, description: ticket.description }),
      suggestArticlesForTicket(`${ticket.subject}\n${ticket.description}`),
    ]);

    ticket.aiSummary = ai.summary;
    ticket.aiSentiment = ai.sentiment;
    ticket.aiSuggestedCategory = ai.category;
    ticket.aiSuggestedPriority = ai.priority;
    ticket.aiSuggestedTeam = ai.suggestedTeam;
    ticket.aiSuggestedArticles = articles.map((a) => ({
      articleId: a.articleId,
      title: a.title,
      slug: a.slug,
    }));
    ticket.aiProcessedAt = new Date();
    ticket.aiProcessingStatus = 'done';
    ticket.activity = ticket.activity || [];
    ticket.activity.push({
      type: 'ai_processed',
      actorRole: 'ai',
      actor: 'AI Triage',
      detail: `Classified as ${categoryLabel(ai.category)} · ${ai.priority} · ${ai.sentiment}`,
      createdAt: new Date(),
    });
    await ticket.save();

    if (!articles.length) {
      await recordTicketKnowledgeGap({
        ticketId: String(ticket._id),
        subject: ticket.subject,
        description: ticket.description,
      });
    }
  } catch {
    ticket.aiProcessingStatus = 'failed';
    await ticket.save().catch(() => {});
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

/** Generate an editable AI draft reply (never sent automatically). */
export async function generateReplyDraft(ticketId: string) {
  await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const ticket = await SupportTicket.findById(ticketId).lean();
  if (!ticket) throw new Error('Ticket not found');

  const client = await Account.findById((ticket as any).clientId, 'fullName').lean();
  const articleIds = ((ticket as any).aiSuggestedArticles || []).map((a: any) => String(a.articleId));
  const kbContext = await buildKbContextForArticles(articleIds);

  const draft = await generateTicketReplyDraft({
    subject: (ticket as any).subject,
    description: (ticket as any).description,
    clientName: (client as any)?.fullName?.split(' ')[0],
    category: (ticket as any).category,
    priority: (ticket as any).priority,
    history: ((ticket as any).messages || []).map((m: any) => ({
      senderRole: m.senderRole,
      content: m.content,
    })),
    kbContext,
  });

  return { success: true, draft };
}

/**
 * Run the multi-agent AI workup (triage + knowledge + strategist + drafting) and
 * persist the orchestrated result on the ticket so the panel can render it and the
 * agent can apply the draft. Staff-gated; never throws on AI failure.
 */
export async function runMultiAgentWorkup(ticketId: string) {
  await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { runTicketAgentWorkup } = await import('@/lib/services/support-agents');

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const client = ticket.clientId
    ? await Account.findById(ticket.clientId, 'fullName').lean()
    : null;

  const workup = await runTicketAgentWorkup({
    subject: ticket.subject,
    description: ticket.description,
    clientName: (client as any)?.fullName?.split(' ')[0] || ticket.channelContact?.displayName,
    category: ticket.category,
    priority: ticket.priority,
    history: (ticket.messages || []).map((m: any) => ({ senderRole: m.senderRole, content: m.content })),
  });

  ticket.aiAgentWorkup = {
    recommendation: workup.recommendation,
    confidence: workup.confidence,
    canAutoResolve: workup.canAutoResolve,
    draftReply: workup.draftReply,
    steps: workup.steps,
    updatedAt: new Date(),
  } as any;
  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'ai_workup',
    actorRole: 'ai',
    actor: 'AI Agent Team',
    detail: `Multi-agent workup · ${Math.round(workup.confidence * 100)}% confidence${
      workup.canAutoResolve ? ' · auto-resolvable' : ''
    }`,
    createdAt: new Date(),
  });
  await ticket.save();

  revalidateTicketSurfaces(ticketId);
  return {
    success: true,
    workup: {
      recommendation: workup.recommendation,
      confidence: workup.confidence,
      canAutoResolve: workup.canAutoResolve,
      draftReply: workup.draftReply,
      steps: workup.steps,
    },
  };
}

// ── Assignment / escalation / notes ────────────────────────────────────────────

export async function assignTicket(ticketId: string, assigneeId: string, team?: string) {
  const user = await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const assignee = assigneeId ? await Account.findById(assigneeId, 'fullName').lean() : null;
  ticket.assignedTo = (assigneeId || undefined) as any;
  if (team) ticket.assignedTeam = team;
  if (ticket.status === 'new') ticket.status = 'open';
  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'assigned',
    actor: actorName(user),
    actorRole: user.role,
    detail: `Assigned to ${(assignee as any)?.fullName || team || 'team'}`,
    createdAt: new Date(),
  });
  await ticket.save();

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: 'ticket_assigned',
    performedBy: user.id,
    details: { ticketId: ticket.ticketId, assigneeId, team },
    metadata: { ticketId: ticket.ticketId },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

export async function escalateTicket(ticketId: string, reason?: string) {
  const user = await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = 'escalated';
  if (ticket.priority !== 'critical') ticket.priority = 'high';
  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'escalated',
    actor: actorName(user),
    actorRole: user.role,
    detail: reason || 'Escalated for priority handling',
    createdAt: new Date(),
  });
  await ticket.save();

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: 'ticket_escalated',
    performedBy: user.id,
    details: { ticketId: ticket.ticketId, reason },
    metadata: { ticketId: ticket.ticketId },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath('/admin/tickets');
  return { success: true };
}

export async function addInternalNote(ticketId: string, note: string) {
  const user = await requireSupportStaff();
  const trimmed = note.trim();
  if (!trimmed) throw new Error('Note cannot be empty');

  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const stamp = `[${new Date().toLocaleString()} · ${actorName(user)}]`;
  ticket.internalNotes = ticket.internalNotes
    ? `${ticket.internalNotes}\n\n${stamp}\n${trimmed}`
    : `${stamp}\n${trimmed}`;
  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'note',
    actor: actorName(user),
    actorRole: user.role,
    detail: 'Added an internal note',
    createdAt: new Date(),
  });
  await ticket.save();

  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

/** Apply an AI suggestion (category / priority / team) to the ticket. */
export async function applyAISuggestion(
  ticketId: string,
  fields: { category?: string; priority?: TicketPriority; team?: string }
) {
  const user = await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const applied: string[] = [];
  if (fields.category) {
    ticket.category = fields.category;
    applied.push(`category → ${categoryLabel(fields.category)}`);
  }
  if (fields.priority) {
    ticket.priority = fields.priority;
    applied.push(`priority → ${fields.priority}`);
  }
  if (fields.team) {
    ticket.assignedTeam = fields.team;
    applied.push(`team → ${fields.team}`);
  }
  if (applied.length) {
    ticket.activity = ticket.activity || [];
    ticket.activity.push({
      type: 'ai_applied',
      actor: actorName(user),
      actorRole: user.role,
      detail: `Applied AI suggestion: ${applied.join(', ')}`,
      createdAt: new Date(),
    });
    await ticket.save();
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

// ── Staff replies & status (admin + employee) ──────────────────────────────────

/**
 * Reply to a client on a ticket as support staff (admin or employee). Unifies
 * what was admin-only: appends the message (with optional attachments), stamps
 * the first-response SLA, refreshes the linked thread, and emails/notifies the
 * client. Reusable from both the admin and employee ticket panels.
 */
export async function replyToTicket(
  ticketId: string,
  content: string,
  attachments: ReplyAttachment[] = [],
  newStatus?:
    | 'new'
    | 'open'
    | 'in_progress'
    | 'waiting_client'
    | 'escalated'
    | 'resolved'
    | 'closed',
) {
  const user = await requireSupportStaff();
  const trimmed = (content || '').trim();
  if (!trimmed && attachments.length === 0) throw new Error('Reply cannot be empty');

  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const now = new Date();
  ticket.messages.push({
    senderRole: 'admin',
    senderName: actorName(user),
    content: trimmed,
    attachments,
    createdAt: now,
  } as any);

  const wasResolved = ticket.status === 'resolved' || ticket.status === 'closed';
  if (newStatus) {
    ticket.status = newStatus as any;
    if (newStatus === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = now;
  }

  // Stamp first response + evaluate SLA the first time the team replies.
  if (!ticket.firstResponseAt) {
    ticket.firstResponseAt = now;
    if (ticket.firstResponseDueAt && now > new Date(ticket.firstResponseDueAt)) {
      ticket.slaFirstResponseBreached = true;
    }
  }

  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'reply',
    actor: actorName(user),
    actorRole: user.role,
    detail: newStatus ? `Replied · status → ${newStatus.replace(/_/g, ' ')}` : 'Replied to client',
    createdAt: now,
  });
  await ticket.save();

  // Keep the linked conversation thread preview fresh.
  if (ticket.threadId) {
    const { MessageThread } = await import('@/models/MessageThread');
    await MessageThread.findByIdAndUpdate(ticket.threadId, {
      $set: { lastMessageAt: now, lastMessagePreview: (trimmed || 'Sent an attachment').slice(0, 140) },
      $inc: { unreadByClient: 1 },
    }).catch(() => {});
  }

  // External channel tickets (WhatsApp/IG/Messenger/voice) have no portal
  // account — push the reply back out to the originating channel instead.
  if (ticket.channel && ticket.channel !== 'web' && ticket.channel !== 'email') {
    try {
      const { dispatchChannelReply } = await import('@/lib/services/channel-dispatch');
      await dispatchChannelReply(
        {
          channel: ticket.channel as any,
          externalId: ticket.channelContact?.externalId,
          handle: ticket.channelContact?.handle,
        },
        trimmed,
      );
    } catch (_) {}
  } else if (ticket.clientId) {
    const client = await Account.findById(ticket.clientId, 'fullName email').lean();
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
            trimmed || '(see attachments)',
            `${getBaseUrl()}/portal/client/tickets/${ticketId}`,
          ),
        });
      } catch (_) {}
    }
  }

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: 'ticket_reply',
    performedBy: user.id,
    details: { ticketId: ticket.ticketId, newStatus, by: user.role },
    metadata: { ticketId: ticket.ticketId },
  });

  // On the reply that resolves the ticket, draft a KB article from the resolution.
  if (newStatus === 'resolved' && !wasResolved) {
    maybeDraftKnowledgeFromTicket(ticket, trimmed);
  }

  revalidateTicketSurfaces(ticketId);
  return { success: true };
}

/** Update a ticket's status as support staff (admin or employee). */
export async function updateTicketStatusAsStaff(
  ticketId: string,
  newStatus:
    | 'new'
    | 'open'
    | 'in_progress'
    | 'waiting_client'
    | 'escalated'
    | 'resolved'
    | 'closed',
  notifyClient = true,
) {
  const user = await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const previousStatus = ticket.status;
  const wasResolvedBefore = previousStatus === 'resolved' || previousStatus === 'closed';
  const now = new Date();
  ticket.status = newStatus as any;
  if (newStatus === 'resolved' || newStatus === 'closed') {
    if (!ticket.resolvedAt) ticket.resolvedAt = now;
    const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt) : now;
    if (ticket.resolutionDueAt && resolvedTime > new Date(ticket.resolutionDueAt)) {
      ticket.slaResolutionBreached = true;
    }
  }
  ticket.activity = ticket.activity || [];
  ticket.activity.push({
    type: 'status_change',
    actor: actorName(user),
    actorRole: user.role,
    detail: `Status → ${newStatus.replace(/_/g, ' ')}`,
    createdAt: now,
  });
  await ticket.save();

  const client = await Account.findById(ticket.clientId, 'fullName email').lean();
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
          `${getBaseUrl()}/portal/client/tickets/${ticketId}`,
        ),
      });
    } catch (_) {}
  }

  await AuditLog.create({
    entityType: 'ticket',
    entityId: ticketId,
    action: `ticket_status_${newStatus}`,
    performedBy: user.id,
    details: { ticketId: ticket.ticketId, newStatus, previousStatus, by: user.role },
    metadata: { ticketId: ticket.ticketId },
  });

  // First transition into resolved → draft a KB article from the resolution.
  if ((newStatus === 'resolved' || newStatus === 'closed') && !wasResolvedBefore) {
    const lastMsg = ticket.messages?.[ticket.messages.length - 1];
    maybeDraftKnowledgeFromTicket(ticket, lastMsg?.content);
  }

  revalidateTicketSurfaces(ticketId);
  return { success: true };
}

// ── Employee support inbox ──────────────────────────────────────────────────

export interface SupportInboxRow {
  _id: string;
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  category?: string;
  channel?: string;
  clientName?: string;
  assignedTeam?: string;
  updatedAt: string;
  messageCount: number;
  unanswered: boolean;
  slaOverall: string;
}

export interface SupportInboxData {
  tickets: SupportInboxRow[];
  counts: { active: number; unanswered: number; breached: number };
}

/**
 * Ticket list for the employee support inbox. Active tickets first, sorted by SLA
 * urgency, then the rest by recency. Staff-gated (admin + employee).
 */
export async function getSupportInboxTickets(): Promise<SupportInboxData> {
  await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const tickets = await SupportTicket.find({})
    .sort({ updatedAt: -1 })
    .limit(400)
    .lean();

  const clientIds = [...new Set(tickets.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName').lean();
  const nameMap = new Map<string, string>();
  for (const a of accounts as any[]) nameMap.set(String(a._id), a.fullName);

  const SEVERITY: Record<string, number> = { breached: 3, due_soon: 2, ok: 1, met: 0 };
  let active = 0;
  let unanswered = 0;
  let breached = 0;

  const rows: SupportInboxRow[] = (tickets as any[]).map((t) => {
    const sla = evaluateSla(t);
    const isActive = OPEN_STATUSES.includes(t.status);
    const lastMsg = t.messages?.[t.messages.length - 1];
    const isUnanswered = isActive && (!lastMsg || lastMsg.senderRole === 'client');
    if (isActive) active += 1;
    if (isUnanswered) unanswered += 1;
    if (sla.overall === 'breached') breached += 1;
    return {
      _id: String(t._id),
      ticketId: t.ticketId,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      category: t.category,
      channel: t.channel,
      clientName: nameMap.get(String(t.clientId)) || t.channelContact?.displayName || t.channelContact?.handle,
      assignedTeam: t.assignedTeam,
      updatedAt: new Date(t.updatedAt).toISOString(),
      messageCount: t.messages?.length || 0,
      unanswered: isUnanswered,
      slaOverall: sla.overall,
    };
  });

  rows.sort((a, b) => {
    const aActive = OPEN_STATUSES.includes(a.status as any) ? 1 : 0;
    const bActive = OPEN_STATUSES.includes(b.status as any) ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    const sev = SEVERITY[b.slaOverall] - SEVERITY[a.slaOverall];
    if (sev !== 0) return sev;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return { tickets: rows, counts: { active, unanswered, breached } };
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SupportAnalytics {
  total: number;
  open: number;
  resolved: number;
  resolutionRate: number;
  avgFirstResponseMins: number | null;
  avgResolutionHours: number | null;
  slaFirstResponseBreaches: number;
  slaResolutionBreaches: number;
  byCategory: { category: string; label: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
}

export async function getSupportAnalytics(): Promise<SupportAnalytics> {
  await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const tickets = await SupportTicket.find(
    {},
    'status priority category aiSentiment createdAt firstResponseAt resolvedAt slaFirstResponseBreached slaResolutionBreached'
  )
    .limit(5000)
    .lean();

  const total = tickets.length;
  const open = tickets.filter((t: any) => OPEN_STATUSES.includes(t.status)).length;
  const resolved = tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length;

  const frDurations: number[] = [];
  const resDurations: number[] = [];
  const byCategory = new Map<string, number>();
  const byPriority = new Map<string, number>();
  const byStatus = new Map<string, number>();
  const sentiment = { positive: 0, neutral: 0, negative: 0 };
  let slaFirstResponseBreaches = 0;
  let slaResolutionBreaches = 0;

  for (const t of tickets as any[]) {
    byCategory.set(t.category || 'general_inquiry', (byCategory.get(t.category || 'general_inquiry') || 0) + 1);
    byPriority.set(t.priority || 'medium', (byPriority.get(t.priority || 'medium') || 0) + 1);
    byStatus.set(t.status || 'new', (byStatus.get(t.status || 'new') || 0) + 1);
    if (t.aiSentiment && sentiment[t.aiSentiment as keyof typeof sentiment] !== undefined) {
      sentiment[t.aiSentiment as keyof typeof sentiment] += 1;
    }
    if (t.firstResponseAt && t.createdAt) {
      frDurations.push(new Date(t.firstResponseAt).getTime() - new Date(t.createdAt).getTime());
    }
    if (t.resolvedAt && t.createdAt) {
      resDurations.push(new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime());
    }
    if (t.slaFirstResponseBreached) slaFirstResponseBreaches += 1;
    if (t.slaResolutionBreached) slaResolutionBreaches += 1;
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const avgFr = avg(frDurations);
  const avgRes = avg(resDurations);

  return {
    total,
    open,
    resolved,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    avgFirstResponseMins: avgFr !== null ? Math.round(avgFr / 60000) : null,
    avgResolutionHours: avgRes !== null ? Math.round(avgRes / 3600000) : null,
    slaFirstResponseBreaches,
    slaResolutionBreaches,
    byCategory: [...byCategory.entries()]
      .map(([category, count]) => ({ category, label: categoryLabel(category), count }))
      .sort((a, b) => b.count - a.count),
    byPriority: [...byPriority.entries()].map(([priority, count]) => ({ priority, count })),
    byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
    sentiment,
  };
}

// ── SLA Monitor ─────────────────────────────────────────────────────────────

export interface SlaMonitorRow {
  _id: string;
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  clientName?: string;
  createdAt: string;
  firstResponseState: string;
  resolutionState: string;
  firstResponseDueInMs: number | null;
  resolutionDueInMs: number | null;
  overall: string;
}

export async function getSlaMonitorTickets(): Promise<SlaMonitorRow[]> {
  await requireSupportStaff();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const tickets = await SupportTicket.find({ status: { $in: OPEN_STATUSES } })
    .sort({ resolutionDueAt: 1 })
    .limit(500)
    .lean();

  const clientIds = [...new Set(tickets.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName').lean();
  const nameMap = new Map<string, string>();
  for (const a of accounts as any[]) nameMap.set(String(a._id), a.fullName);

  const SEVERITY: Record<string, number> = { breached: 3, due_soon: 2, ok: 1, met: 0 };

  return (tickets as any[])
    .map((t) => {
      const sla = evaluateSla(t);
      return {
        _id: String(t._id),
        ticketId: t.ticketId,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        clientName: nameMap.get(String(t.clientId)),
        createdAt: new Date(t.createdAt).toISOString(),
        firstResponseState: sla.firstResponseState,
        resolutionState: sla.resolutionState,
        firstResponseDueInMs: sla.firstResponseDueInMs,
        resolutionDueInMs: sla.resolutionDueInMs,
        overall: sla.overall,
      };
    })
    .sort((a, b) => SEVERITY[b.overall] - SEVERITY[a.overall]);
}

// ── Customer Health (re-export for pages) ─────────────────────────────────────

export async function getCustomerHealth() {
  await requireSupportStaff();
  return getCustomerHealthList();
}

// ── Executive AI summary ──────────────────────────────────────────────────────

export async function getSupportExecutiveSummary(): Promise<{ summary: string }> {
  await requireSupportStaff();
  const analytics = await getSupportAnalytics();

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return { summary: 'AI summary unavailable — GOOGLE_AI_API_KEY is not configured.' };
  }

  const topCategories = analytics.byCategory.slice(0, 3).map((c) => `${c.label} (${c.count})`).join(', ');
  const facts = [
    `Total tickets: ${analytics.total}`,
    `Open: ${analytics.open}`,
    `Resolution rate: ${analytics.resolutionRate}%`,
    `Avg first response: ${analytics.avgFirstResponseMins ?? 'n/a'} min`,
    `Avg resolution: ${analytics.avgResolutionHours ?? 'n/a'} h`,
    `SLA first-response breaches: ${analytics.slaFirstResponseBreaches}`,
    `SLA resolution breaches: ${analytics.slaResolutionBreaches}`,
    `Top categories: ${topCategories || 'n/a'}`,
    `Sentiment — positive ${analytics.sentiment.positive}, neutral ${analytics.sentiment.neutral}, negative ${analytics.sentiment.negative}`,
  ].join('\n');

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: process.env.GEMINI_SUPPORT_MODEL || process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash',
      systemInstruction:
        'You are a support operations analyst for LeoTheTechGuy. Write a crisp executive summary (3-5 sentences) of the support metrics provided. Call out the dominant issue category, any SLA risk, sentiment trend, and one clear recommendation. No bullet points, no markdown, plain prose.',
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
    });
    const result = await model.generateContent(`Support metrics:\n${facts}`);
    return { summary: result.response.text().trim() || 'No summary generated.' };
  } catch {
    return {
      summary: `Support is handling ${analytics.total} tickets (${analytics.open} open) with a ${analytics.resolutionRate}% resolution rate. Most common categories: ${topCategories || 'n/a'}.`,
    };
  }
}

/**
 * Build and email the executive support digest to all admins on demand.
 * Admin-only (digests can contain cross-client risk data). Reuses the same
 * delivery path as the scheduled cron route.
 */
export async function sendSupportDigestNow(windowDays = 7) {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');

  const { deliverSupportDigest } = await import('@/lib/services/support-digest');
  const { recipients, sent } = await deliverSupportDigest(windowDays);
  return { success: true, recipients, sent };
}

/** Active employees + admins for the assignment picker. */
export async function getAssignableStaff() {
  await requireSupportStaff();
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const staff = await Account.find(
    { roles: { $in: ['admin', 'employee'] }, isActive: { $ne: false } },
    'fullName email roles'
  )
    .limit(200)
    .lean();
  return JSON.parse(JSON.stringify(staff));
}
