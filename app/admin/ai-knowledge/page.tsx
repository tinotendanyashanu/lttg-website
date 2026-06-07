import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getAiKnowledgeDashboard } from '@/lib/actions/ai-knowledge';

export const metadata = { title: 'AI & Knowledge | Admin' };
export const dynamic = 'force-dynamic';

const SOURCE_LABELS: Record<string, string> = {
  chatbot: 'Public Chatbot',
  kb_search: 'KB Search',
  ticket_ai: 'Ticket AI',
  employee_assistant: 'Employee Assistant',
};

const CONF_CHIP: Record<string, string> = {
  high: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  low: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

function StatCard({ icon, tone, value, label, hint }: { icon: string; tone: string; value: string | number; label: string; hint?: string }) {
  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
      <div className="flex items-center gap-3">
        <span className={`material-icons-outlined text-2xl ${tone}`}>{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-2">{hint}</p>}
    </div>
  );
}

export default async function AiKnowledgePage() {
  let data;
  try {
    data = await getAiKnowledgeDashboard(30);
  } catch {
    return (
      <div className="space-y-6">
        <AdminPageBanner icon="neurology" title="AI & Knowledge" description="Retrieval analytics and AI performance." />
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-12 text-center text-sm text-gray-500">
          Unable to load AI & Knowledge analytics.
        </div>
      </div>
    );
  }

  const { totals, bySource, topTopics, failedQueries, confidenceTrend, ai, worstArticles } = data;
  const feedbackTotal = ai.feedbackHelpful + ai.feedbackUnhelpful;
  const helpfulPct = feedbackTotal ? Math.round((ai.feedbackHelpful / feedbackTotal) * 100) : 0;
  const trendMax = Math.max(1, ...confidenceTrend.map((d) => d.high + d.medium + d.low));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="neurology"
        title="AI & Knowledge"
        description={`Retrieval analytics, knowledge gaps and AI performance · last ${data.windowDays} days`}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="search" tone="text-brand-primary" value={totals.retrievals} label="Retrievals" />
        <StatCard icon="verified" tone="text-emerald-500" value={`${totals.successRate}%`} label="Retrieval success" hint="High + medium confidence" />
        <StatCard icon="error_outline" tone="text-red-500" value={totals.lowConfidence} label="Low-confidence" hint={`${totals.escalations} escalated`} />
        <StatCard icon="bolt" tone="text-violet-500" value={`${totals.vectorShare}%`} label="Vector-served" hint="Else in-memory fallback" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most searched topics */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-brand-primary">trending_up</span>
            Most Searched Topics
          </h3>
          {topTopics.length === 0 ? (
            <p className="text-sm text-gray-400">No retrievals yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {topTopics.map((t, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{t.query}</span>
                  <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {t.count}{t.lowConfidence > 0 && <span className="text-red-500"> · {t.lowConfidence} weak</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Failed / low-confidence searches */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons-outlined text-[18px] text-red-500">report_problem</span>
              Failed & Weak Searches
            </h3>
            <Link href="/admin/chat/insights" className="text-xs font-semibold text-brand-primary hover:underline">
              {totals.pendingGaps} gaps →
            </Link>
          </div>
          {failedQueries.length === 0 ? (
            <p className="text-sm text-gray-400">No failed searches — knowledge coverage is healthy.</p>
          ) : (
            <ul className="space-y-2">
              {failedQueries.map((q, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{q.query}</p>
                    <p className="text-[11px] text-gray-400">{SOURCE_LABELS[q.source] || q.source}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${CONF_CHIP[q.confidence] || CONF_CHIP.low}`}>
                    {q.confidence}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Confidence trend */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Retrieval Confidence Over Time</h3>
        {confidenceTrend.length === 0 ? (
          <p className="text-sm text-gray-400">Not enough data yet.</p>
        ) : (
          <>
            <div className="flex items-end gap-1.5 h-40">
              {confidenceTrend.map((d) => {
                const total = d.high + d.medium + d.low;
                const h = (n: number) => `${(n / trendMax) * 100}%`;
                return (
                  <div key={d.date} className="flex-1 flex flex-col justify-end gap-px group relative" title={`${d.date}: ${total} (${d.high}H/${d.medium}M/${d.low}L)`}>
                    <div className="bg-red-400/80 rounded-t-sm" style={{ height: h(d.low) }} />
                    <div className="bg-amber-400/80" style={{ height: h(d.medium) }} />
                    <div className="bg-emerald-500/80 rounded-b-sm" style={{ height: h(d.high) }} />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/80" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/80" /> Low</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI performance */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-brand-primary">insights</span>
            AI Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ai.avgTopScore}</p>
              <p className="text-xs text-gray-400">Avg top match score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ai.avgChatConfidence || '—'}</p>
              <p className="text-xs text-gray-400">Avg chatbot confidence</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{helpfulPct}%</p>
              <p className="text-xs text-gray-400">Helpful feedback ({feedbackTotal})</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.failedSearches}</p>
              <p className="text-xs text-gray-400">Zero-result searches</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 space-y-1.5">
            {bySource.map((s) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{SOURCE_LABELS[s.source] || s.source}</span>
                <span className="font-semibold text-gray-500 dark:text-gray-400">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest-rated articles */}
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-amber-500">thumb_down</span>
            Articles Needing Attention
          </h3>
          {worstArticles.length === 0 ? (
            <p className="text-sm text-gray-400">No negative feedback recorded.</p>
          ) : (
            <ul className="space-y-3">
              {worstArticles.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-400">{a.retrievals} retrievals</p>
                  </div>
                  <div className="shrink-0 flex gap-3 text-xs font-bold">
                    <span className="text-emerald-500">{a.helpful}↑</span>
                    <span className="text-red-500">{a.notHelpful}↓</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
