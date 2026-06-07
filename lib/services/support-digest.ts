/**
 * Support Center — executive digest builder.
 *
 * Composes a periodic executive summary of support operations: ticket volume,
 * SLA risk, sentiment, top issue categories and at-risk customers, plus a short
 * Gemini-written narrative. Kept as a plain (un-gated) service so the scheduled
 * cron route can build it without an interactive session; the admin "send now"
 * action layers its own auth on top. Never throws — degrades to heuristics.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { getCustomerHealthList } from '@/lib/services/customer-health';
import { OPEN_STATUSES, categoryLabel } from '@/lib/support/constants';

const SUPPORT_MODEL =
  process.env.GEMINI_SUPPORT_MODEL || process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';

export interface SupportDigest {
  generatedAt: string;
  windowDays: number;
  narrative: string;
  metrics: {
    created: number; // new tickets in window
    resolved: number; // resolved/closed in window
    openNow: number;
    unanswered: number;
    slaFirstResponseBreaches: number;
    slaResolutionBreaches: number;
    negativeSentiment: number;
  };
  topCategories: { label: string; count: number }[];
  atRiskCustomers: { name: string; level: string; score: number; openTickets: number }[];
}

async function buildNarrative(d: Omit<SupportDigest, 'narrative'>): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const heuristic =
    `Over the last ${d.windowDays} days, ${d.metrics.created} tickets were created and ${d.metrics.resolved} resolved. ` +
    `${d.metrics.openNow} remain open (${d.metrics.unanswered} awaiting a reply). ` +
    `SLA breaches: ${d.metrics.slaFirstResponseBreaches} first-response, ${d.metrics.slaResolutionBreaches} resolution.`;
  if (!apiKey) return heuristic;

  const facts = [
    `Window: last ${d.windowDays} days`,
    `Created: ${d.metrics.created}`,
    `Resolved: ${d.metrics.resolved}`,
    `Open now: ${d.metrics.openNow}`,
    `Awaiting reply: ${d.metrics.unanswered}`,
    `SLA first-response breaches: ${d.metrics.slaFirstResponseBreaches}`,
    `SLA resolution breaches: ${d.metrics.slaResolutionBreaches}`,
    `Negative-sentiment tickets: ${d.metrics.negativeSentiment}`,
    `Top categories: ${d.topCategories.map((c) => `${c.label} (${c.count})`).join(', ') || 'n/a'}`,
    `At-risk customers: ${d.atRiskCustomers.length}`,
  ].join('\n');

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: SUPPORT_MODEL,
      systemInstruction:
        'You are a support operations analyst for LeoTheTechGuy. Write a crisp executive digest (3-5 sentences, plain prose, no markdown) of the support metrics provided. Lead with the headline, call out SLA risk and any at-risk customers, note the sentiment/category trend, and end with one concrete recommendation.',
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
    });
    const result = await model.generateContent(`Support metrics:\n${facts}`);
    return result.response.text().trim() || heuristic;
  } catch {
    return heuristic;
  }
}

/** Build the executive digest over the trailing `windowDays` window. */
export async function buildSupportDigest(windowDays = 7): Promise<SupportDigest> {
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const [created, resolved, openTickets, health] = await Promise.all([
    SupportTicket.countDocuments({ createdAt: { $gte: since } }),
    SupportTicket.countDocuments({
      status: { $in: ['resolved', 'closed'] },
      resolvedAt: { $gte: since },
    }),
    SupportTicket.find(
      { status: { $in: OPEN_STATUSES } },
      'category messages slaFirstResponseBreached slaResolutionBreached aiSentiment',
    )
      .limit(2000)
      .lean(),
    getCustomerHealthList().catch(() => []),
  ]);

  let unanswered = 0;
  let slaFirstResponseBreaches = 0;
  let slaResolutionBreaches = 0;
  let negativeSentiment = 0;
  const byCategory = new Map<string, number>();

  for (const t of openTickets as any[]) {
    const last = t.messages?.[t.messages.length - 1];
    if (!last || last.senderRole === 'client') unanswered += 1;
    if (t.slaFirstResponseBreached) slaFirstResponseBreaches += 1;
    if (t.slaResolutionBreached) slaResolutionBreaches += 1;
    if (t.aiSentiment === 'negative') negativeSentiment += 1;
    const cat = t.category || 'general_inquiry';
    byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
  }

  const topCategories = [...byCategory.entries()]
    .map(([category, count]) => ({ label: categoryLabel(category), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const atRiskCustomers = (health as any[])
    .filter((h) => h.level === 'at_risk' || h.level === 'critical')
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)
    .map((h) => ({
      name: h.fullName || 'Unknown client',
      level: h.level,
      score: h.score,
      openTickets: h.openTickets || 0,
    }));

  const base: Omit<SupportDigest, 'narrative'> = {
    generatedAt: new Date().toISOString(),
    windowDays,
    metrics: {
      created,
      resolved,
      openNow: openTickets.length,
      unanswered,
      slaFirstResponseBreaches,
      slaResolutionBreaches,
      negativeSentiment,
    },
    topCategories,
    atRiskCustomers,
  };

  const narrative = await buildNarrative(base);
  return { ...base, narrative };
}

/**
 * Build the digest and email it to every active admin. Shared by the scheduled
 * cron route and the admin "send now" action. Returns delivery counts.
 */
export async function deliverSupportDigest(
  windowDays = 7,
): Promise<{ digest: SupportDigest; recipients: number; sent: number }> {
  const { sendEmail, EmailTemplates } = await import('@/lib/email');
  const { Account } = await import('@/models/Account');
  await dbConnect();

  const digest = await buildSupportDigest(windowDays);

  const admins = await Account.find(
    { roles: { $in: ['admin'] }, isActive: { $ne: false } },
    'fullName email',
  )
    .limit(50)
    .lean();

  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const dashboardLink = `${base}/admin/support/insights`;

  let sent = 0;
  for (const admin of admins as any[]) {
    if (!admin.email) continue;
    const res = await sendEmail({
      to: admin.email,
      subject: `Support Digest — ${digest.metrics.openNow} open, ${
        digest.metrics.slaFirstResponseBreaches + digest.metrics.slaResolutionBreaches
      } SLA breaches`,
      html: EmailTemplates.supportExecutiveDigest(admin.fullName || 'there', digest, dashboardLink),
    });
    if ((res as any)?.success) sent += 1;
  }

  return { digest, recipients: admins.length, sent };
}
