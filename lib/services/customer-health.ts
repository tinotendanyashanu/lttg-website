/**
 * Support Center — Customer Health monitor.
 *
 * Computes a 0-100 health score (higher = healthier) per client from existing
 * platform signals — open tickets, ticket sentiment, overdue invoices, delayed
 * cases/projects and engagement recency. Reuses SupportTicket, ClientInvoice,
 * ClientCase and Account. No new tracking tables.
 */

import dbConnect from '@/lib/mongodb';
import { OPEN_STATUSES, healthLevelFromScore, type HealthLevel } from '@/lib/support/constants';

export interface HealthFactor {
  label: string;
  impact: number; // negative = hurts health
  detail: string;
}

export interface ClientHealth {
  clientId: string;
  score: number;
  level: HealthLevel;
  factors: HealthFactor[];
  openTickets: number;
  overdueInvoices: number;
  negativeSentimentTickets: number;
}

const OPEN_INVOICE_STATUSES = ['issued', 'sent', 'overdue', 'partially_paid'];

interface HealthInputs {
  openTickets: number;
  negativeSentimentTickets: number;
  escalatedTickets: number;
  overdueInvoices: number;
  delayedCases: number;
  lastActivityAt: Date | null;
}

/** Pure scoring so it can be unit-tested independent of the DB. */
export function scoreHealth(inputs: HealthInputs): {
  score: number;
  level: HealthLevel;
  factors: HealthFactor[];
} {
  let score = 100;
  const factors: HealthFactor[] = [];

  if (inputs.openTickets > 0) {
    const impact = -Math.min(25, inputs.openTickets * 6);
    score += impact;
    factors.push({
      label: 'Open tickets',
      impact,
      detail: `${inputs.openTickets} unresolved ticket${inputs.openTickets === 1 ? '' : 's'}`,
    });
  }

  if (inputs.negativeSentimentTickets > 0) {
    const impact = -Math.min(20, inputs.negativeSentimentTickets * 10);
    score += impact;
    factors.push({
      label: 'Negative sentiment',
      impact,
      detail: `${inputs.negativeSentimentTickets} ticket${inputs.negativeSentimentTickets === 1 ? '' : 's'} with negative tone`,
    });
  }

  if (inputs.escalatedTickets > 0) {
    const impact = -Math.min(20, inputs.escalatedTickets * 12);
    score += impact;
    factors.push({
      label: 'Escalations',
      impact,
      detail: `${inputs.escalatedTickets} escalated ticket${inputs.escalatedTickets === 1 ? '' : 's'}`,
    });
  }

  if (inputs.overdueInvoices > 0) {
    const impact = -Math.min(20, inputs.overdueInvoices * 10);
    score += impact;
    factors.push({
      label: 'Billing',
      impact,
      detail: `${inputs.overdueInvoices} overdue/unpaid invoice${inputs.overdueInvoices === 1 ? '' : 's'}`,
    });
  }

  if (inputs.delayedCases > 0) {
    const impact = -Math.min(15, inputs.delayedCases * 8);
    score += impact;
    factors.push({
      label: 'Project delays',
      impact,
      detail: `${inputs.delayedCases} case${inputs.delayedCases === 1 ? '' : 's'} awaiting progress`,
    });
  }

  // Engagement recency — long silence is a mild negative signal.
  if (inputs.lastActivityAt) {
    const days = (Date.now() - inputs.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 60) {
      score -= 8;
      factors.push({ label: 'Engagement', impact: -8, detail: 'No activity in 60+ days' });
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, level: healthLevelFromScore(score), factors };
}

/** A case is "delayed" if it's been open and untouched for a while. */
const CASE_DELAY_DAYS = 14;

export async function computeClientHealth(clientId: string): Promise<ClientHealth> {
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { ClientCase } = await import('@/models/ClientCase');

  const delayCutoff = new Date(Date.now() - CASE_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const [openTickets, negativeSentimentTickets, escalatedTickets, overdueInvoices, delayedCases, latestTicket] =
    await Promise.all([
      SupportTicket.countDocuments({ clientId, status: { $in: OPEN_STATUSES } }),
      SupportTicket.countDocuments({ clientId, status: { $in: OPEN_STATUSES }, aiSentiment: 'negative' }),
      SupportTicket.countDocuments({ clientId, status: 'escalated' }),
      ClientInvoice.countDocuments({ clientId, status: { $in: OPEN_INVOICE_STATUSES } }),
      ClientCase.countDocuments({
        clientId,
        status: { $in: ['submitted', 'reviewing', 'investigating', 'in_progress'] },
        updatedAt: { $lt: delayCutoff },
      }),
      SupportTicket.findOne({ clientId }).sort({ updatedAt: -1 }).select('updatedAt').lean(),
    ]);

  const { score, level, factors } = scoreHealth({
    openTickets,
    negativeSentimentTickets,
    escalatedTickets,
    overdueInvoices,
    delayedCases,
    lastActivityAt: (latestTicket as any)?.updatedAt ? new Date((latestTicket as any).updatedAt) : null,
  });

  return {
    clientId,
    score,
    level,
    factors,
    openTickets,
    overdueInvoices,
    negativeSentimentTickets,
  };
}

export interface ClientHealthRow extends ClientHealth {
  fullName?: string;
  email?: string;
  companyName?: string;
}

/**
 * Health rows for every client that has ever raised a ticket — drives the
 * Customer Health page. Sorted worst-first so at-risk clients surface on top.
 */
export async function getCustomerHealthList(): Promise<ClientHealthRow[]> {
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const clientIds = (await SupportTicket.distinct('clientId')).map((id: any) => String(id));
  if (!clientIds.length) return [];

  const [healths, accounts] = await Promise.all([
    Promise.all(clientIds.map((id) => computeClientHealth(id))),
    Account.find({ _id: { $in: clientIds } }, 'fullName email clientProfile').lean(),
  ]);

  const accountMap = new Map<string, any>();
  for (const a of accounts as any[]) accountMap.set(String(a._id), a);

  return healths
    .map((h) => {
      const acc = accountMap.get(h.clientId);
      return {
        ...h,
        fullName: acc?.fullName,
        email: acc?.email,
        companyName: acc?.clientProfile?.companyName,
      };
    })
    .sort((a, b) => a.score - b.score);
}
