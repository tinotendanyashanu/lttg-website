/**
 * Executive Intelligence Service (Phase D, spec §9).
 *
 * Aggregates every business slice (revenue, leads, projects, support, AI/knowledge)
 * into a single typed report and optionally generates a Gemini-written executive
 * narrative. Follows the same build+narrate pattern as support-digest.ts.
 *
 * Safe to call fire-and-forget or from cron — never throws, always degrades
 * gracefully when models or API keys are absent.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';

const EXEC_MODEL =
  process.env.GEMINI_EXEC_MODEL ||
  process.env.GEMINI_PRIMARY_MODEL ||
  'gemini-2.5-flash';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RevenueSlice {
  collectedInWindow: number;   // sum of amountPaid on invoices saved in window
  outstanding: number;         // sum of remainingBalance on open/partially-paid invoices
  invoicesPaid: number;
  invoicesOverdue: number;
  currency: string;            // always USD (usdAmount used where available)
}

export interface LeadsSlice {
  newInWindow: number;
  qualified: number;
  converted: number;
  conversionRate: number;       // 0-100 percentage
  bySource: { source: string; count: number }[];
  chatSessions: number;
  chatConverted: number;
}

export interface ProjectsSlice {
  active: number;
  completedInWindow: number;
  onHold: number;
  milestonesDone: number;
  milestonesTotal: number;
}

export interface KnowledgeSlice {
  publishedArticles: number;
  draftArticles: number;           // includes ai-drafted pending review
  aiDraftedPending: number;
  retrievalTotal: number;
  retrievalHighConf: number;
  retrievalEscalated: number;
  successRate: number;             // 0-100 percentage
}

export interface ExecSummary {
  generatedAt: string;
  windowDays: number;
  narrative: string;
  revenue: RevenueSlice;
  leads: LeadsSlice;
  projects: ProjectsSlice;
  support: {
    openTickets: number;
    resolvedInWindow: number;
    slaBreaches: number;
    atRiskCustomers: number;
  };
  knowledge: KnowledgeSlice;
}

// ── Narrative ─────────────────────────────────────────────────────────────────

async function buildNarrative(d: Omit<ExecSummary, 'narrative'>): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const heuristic =
    `In the last ${d.windowDays} days: ${d.revenue.invoicesPaid} invoices paid (USD ${d.revenue.collectedInWindow.toFixed(0)} collected), ` +
    `${d.leads.newInWindow} new leads (${d.leads.conversionRate}% conversion), ` +
    `${d.projects.active} active projects, ${d.support.openTickets} open support tickets, ` +
    `${d.support.slaBreaches} SLA breaches, AI knowledge success rate ${d.knowledge.successRate}%.`;

  if (!apiKey) return heuristic;

  const facts = [
    `Window: last ${d.windowDays} days`,
    `Revenue collected (USD): ${d.revenue.collectedInWindow.toFixed(2)}`,
    `Outstanding invoices (USD): ${d.revenue.outstanding.toFixed(2)}`,
    `Invoices paid: ${d.revenue.invoicesPaid}, overdue: ${d.revenue.invoicesOverdue}`,
    `New leads: ${d.leads.newInWindow}, qualified: ${d.leads.qualified}, converted: ${d.leads.converted} (${d.leads.conversionRate}% rate)`,
    `Lead sources: ${d.leads.bySource.map((s) => `${s.source} ${s.count}`).join(', ') || 'n/a'}`,
    `Chat sessions: ${d.leads.chatSessions}, chat converted: ${d.leads.chatConverted}`,
    `Active projects: ${d.projects.active}, completed in window: ${d.projects.completedInWindow}`,
    `Milestone progress: ${d.projects.milestonesDone}/${d.projects.milestonesTotal} done`,
    `Support tickets open: ${d.support.openTickets}, resolved in window: ${d.support.resolvedInWindow}`,
    `SLA breaches: ${d.support.slaBreaches}, at-risk customers: ${d.support.atRiskCustomers}`,
    `KB articles published: ${d.knowledge.publishedArticles}, AI drafts pending review: ${d.knowledge.aiDraftedPending}`,
    `AI retrieval success rate: ${d.knowledge.successRate}% (${d.knowledge.retrievalEscalated} escalated of ${d.knowledge.retrievalTotal})`,
  ].join('\n');

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: EXEC_MODEL,
      systemInstruction:
        'You are a chief-of-staff analyst for LeoTheTechGuy. Write a crisp, executive weekly summary (4-6 sentences, plain prose, no markdown, no bullet points). ' +
        'Lead with the revenue headline, note lead conversion and pipeline health, call out any SLA risk or at-risk customers, ' +
        'highlight AI/knowledge performance, and close with one concrete priority action for the CEO this week.',
      generationConfig: { temperature: 0.35, maxOutputTokens: 500 },
    });
    const result = await model.generateContent(`Business metrics:\n${facts}`);
    return result.response.text().trim() || heuristic;
  } catch {
    return heuristic;
  }
}

// ── Data aggregation ───────────────────────────────────────────────────────────

export async function buildExecSummary(windowDays = 7): Promise<ExecSummary> {
  await dbConnect();

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const Lead = (await import('@/models/Lead')).default;
  const { ClientCase } = await import('@/models/ClientCase');
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { RetrievalLog } = await import('@/models/RetrievalLog');
  const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
  const { ChatSession } = await import('@/models/ChatSession');

  const [
    invoiceAgg,
    outstandingAgg,
    overdueCount,
    leadDocs,
    caseAgg,
    completedCases,
    milestonesAgg,
    ticketsOpen,
    ticketsResolved,
    slaBreaches,
    atRiskCount,
    retrievalAgg,
    kbPublished,
    kbDraft,
    kbAiDraft,
    chatAgg,
  ] = await Promise.all([
    // Revenue collected in window
    ClientInvoice.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$usdAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
    // Outstanding balance
    ClientInvoice.aggregate([
      { $match: { status: { $in: ['sent', 'partially_paid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$remainingBalance', '$amount'] } } } },
    ]),
    ClientInvoice.countDocuments({ status: 'overdue' }),

    // Leads in window (full docs for source breakdown)
    Lead.find({ createdAt: { $gte: since } }, 'status source').lean(),

    // Active projects
    ClientCase.aggregate([
      { $match: { status: { $in: ['open', 'in_progress'] } } },
      { $count: 'active' },
    ]),
    ClientCase.countDocuments({ status: 'resolved', updatedAt: { $gte: since } }),

    // Milestone completion counts across all cases
    ClientCase.aggregate([
      { $unwind: '$milestones' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$milestones.status', 'done'] }, 1, 0] } },
        },
      },
    ]),

    // Support tickets
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress', 'waiting_on_client'] } }),
    SupportTicket.countDocuments({ status: { $in: ['resolved', 'closed'] }, resolvedAt: { $gte: since } }),
    SupportTicket.countDocuments({ $or: [{ slaFirstResponseBreached: true }, { slaResolutionBreached: true }] }),

    // At-risk customers (health level)
    (async () => {
      try {
        const { getCustomerHealthList } = await import('@/lib/services/customer-health');
        const list = await getCustomerHealthList();
        return list.filter((h: any) => h.level === 'at_risk' || h.level === 'critical').length;
      } catch { return 0; }
    })(),

    // Retrieval analytics
    RetrievalLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          high: { $sum: { $cond: [{ $eq: ['$confidence', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$confidence', 'medium'] }, 1, 0] } },
          escalated: { $sum: { $cond: ['$escalated', 1, 0] } },
        },
      },
    ]),

    KnowledgeArticle.countDocuments({ status: 'published', isPublished: true }),
    KnowledgeArticle.countDocuments({ status: 'draft' }),
    KnowledgeArticle.countDocuments({ status: 'draft', tags: 'ai-drafted' }),

    // Chat conversion
    ChatSession.aggregate([
      { $match: { updatedAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: { $sum: { $cond: ['$converted', 1, 0] } },
        },
      },
    ]),
  ]);

  // Revenue
  const revenueRow = invoiceAgg[0] ?? { total: 0, count: 0 };
  const outstandingRow = outstandingAgg[0] ?? { total: 0 };

  // Leads
  const leadsTotal = leadDocs.length;
  const qualifiedCount = (leadDocs as any[]).filter((l) => l.status === 'qualified' || l.status === 'converted').length;
  const convertedCount = (leadDocs as any[]).filter((l) => l.status === 'converted').length;
  const conversionRate = leadsTotal ? Math.round((convertedCount / leadsTotal) * 100) : 0;
  const sourceMap = new Map<string, number>();
  for (const l of leadDocs as any[]) {
    const src = l.source || 'manual';
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  }
  const bySource = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Projects
  const activeProjects = (caseAgg[0] as any)?.active ?? 0;
  const msRow = milestonesAgg[0] ?? { total: 0, done: 0 };

  // Retrieval
  const retRow = retrievalAgg[0] ?? { total: 0, high: 0, medium: 0, escalated: 0 };
  const successRate = retRow.total
    ? Math.round(((retRow.high + retRow.medium) / retRow.total) * 100)
    : 0;

  // Chat
  const chatRow = chatAgg[0] ?? { total: 0, converted: 0 };

  const base: Omit<ExecSummary, 'narrative'> = {
    generatedAt: new Date().toISOString(),
    windowDays,
    revenue: {
      collectedInWindow: revenueRow.total,
      outstanding: outstandingRow.total,
      invoicesPaid: revenueRow.count,
      invoicesOverdue: overdueCount,
      currency: 'USD',
    },
    leads: {
      newInWindow: leadsTotal,
      qualified: qualifiedCount,
      converted: convertedCount,
      conversionRate,
      bySource,
      chatSessions: chatRow.total,
      chatConverted: chatRow.converted,
    },
    projects: {
      active: activeProjects,
      completedInWindow: completedCases,
      onHold: 0,
      milestonesDone: (msRow as any).done ?? 0,
      milestonesTotal: (msRow as any).total ?? 0,
    },
    support: {
      openTickets: ticketsOpen,
      resolvedInWindow: ticketsResolved,
      slaBreaches,
      atRiskCustomers: atRiskCount,
    },
    knowledge: {
      publishedArticles: kbPublished,
      draftArticles: kbDraft,
      aiDraftedPending: kbAiDraft,
      retrievalTotal: retRow.total,
      retrievalHighConf: retRow.high,
      retrievalEscalated: retRow.escalated,
      successRate,
    },
  };

  const narrative = await buildNarrative(base);
  return { ...base, narrative };
}

/**
 * Build the summary and email it to every active admin.
 * Shared by the cron route and the admin "send now" action.
 */
export async function deliverExecSummary(
  windowDays = 7,
): Promise<{ summary: ExecSummary; recipients: number; sent: number }> {
  const { sendEmail, EmailTemplates } = await import('@/lib/email');
  const { Account } = await import('@/models/Account');
  await dbConnect();

  const summary = await buildExecSummary(windowDays);

  const admins = await Account.find(
    { roles: { $in: ['admin'] }, isActive: { $ne: false } },
    'fullName email',
  )
    .limit(50)
    .lean();

  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const dashboardLink = `${base}/admin/command-center`;

  let sent = 0;
  for (const admin of admins as any[]) {
    if (!admin.email) continue;
    const res = await sendEmail({
      to: admin.email,
      subject: `Weekly Business Summary — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      html: EmailTemplates.executiveWeeklySummary(admin.fullName || 'there', summary, dashboardLink),
    });
    if ((res as any)?.success) sent += 1;
  }

  return { summary, recipients: admins.length, sent };
}
