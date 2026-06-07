import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import SendDigestButton from '@/components/admin/SendDigestButton';
import {
  getSupportExecutiveSummary,
  getSupportAnalytics,
  getCustomerHealth,
} from '@/lib/actions/support-center';
import { HEALTH_LABELS, type HealthLevel } from '@/lib/support/constants';

export const metadata = { title: 'Support AI Insights | Support' };
export const dynamic = 'force-dynamic';

const LEVEL_CHIP: Record<HealthLevel, string> = {
  excellent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  good: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  at_risk: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  critical: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

export default async function SupportInsightsPage() {
  const [{ summary }, analytics, health] = await Promise.all([
    getSupportExecutiveSummary(),
    getSupportAnalytics(),
    getCustomerHealth(),
  ]);

  const highRisk = health.filter((h) => h.level === 'at_risk' || h.level === 'critical').slice(0, 8);
  const topIssues = analytics.byCategory.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="auto_awesome"
        title="Support AI Insights"
        description="AI-generated executive summary, top issues and at-risk customers."
      />

      {/* Executive summary */}
      <div className="bg-gradient-to-br from-brand-primary/5 to-transparent dark:from-brand-primary/10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-brand-primary">psychology</span>
            Executive Summary
          </h3>
          <SendDigestButton />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top issues */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Most Common Issues</h3>
          {topIssues.length === 0 ? (
            <p className="text-sm text-gray-400">No tickets yet.</p>
          ) : (
            <ul className="space-y-3">
              {topIssues.map((c) => {
                const pct = analytics.total ? Math.round((c.count / analytics.total) * 100) : 0;
                return (
                  <li key={c.category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{c.label}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {c.count} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* High-risk customers */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">High-Risk Customers</h3>
            <Link href="/admin/support/health" className="text-xs font-semibold text-brand-primary hover:underline">
              View all
            </Link>
          </div>
          {highRisk.length === 0 ? (
            <p className="text-sm text-gray-400">No customers currently at risk.</p>
          ) : (
            <ul className="space-y-3">
              {highRisk.map((h) => (
                <li key={h.clientId} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.fullName || h.email}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {h.openTickets} open · {h.negativeSentimentTickets} negative · {h.overdueInvoices} billing
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${LEVEL_CHIP[h.level]}`}>
                    {HEALTH_LABELS[h.level]} · {h.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* SLA + KB gap callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">SLA Performance</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {analytics.slaFirstResponseBreaches} response · {analytics.slaResolutionBreaches} resolution breaches
            </p>
          </div>
          <Link href="/admin/support/sla" className="inline-flex items-center gap-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full px-4 py-2 text-sm font-semibold">
            <span className="material-icons-outlined text-[16px]">timer</span>
            SLA Monitor
          </Link>
        </div>

        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Knowledge Gaps</p>
            <p className="text-xs text-gray-400 mt-0.5">Tickets with no matching KB article are queued for review.</p>
          </div>
          <Link href="/admin/chat/insights" className="inline-flex items-center gap-1.5 bg-brand-primary text-white rounded-full px-4 py-2 text-sm font-semibold">
            <span className="material-icons-outlined text-[16px]">menu_book</span>
            Review Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
