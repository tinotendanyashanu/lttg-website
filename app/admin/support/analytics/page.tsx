import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getSupportAnalytics } from '@/lib/actions/support-center';
import { STATUS_LABELS, PRIORITY_LABELS, type TicketStatus, type TicketPriority } from '@/lib/support/constants';

export const metadata = { title: 'Support Analytics | Support' };
export const dynamic = 'force-dynamic';

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-gray-700 dark:text-gray-200">{count}</span>
    </div>
  );
}

export default async function SupportAnalyticsPage() {
  const a = await getSupportAnalytics();
  const catMax = Math.max(1, ...a.byCategory.map((c) => c.count));
  const statusMax = Math.max(1, ...a.byStatus.map((s) => s.count));
  const sentimentTotal = a.sentiment.positive + a.sentiment.neutral + a.sentiment.negative || 1;

  const stats = [
    { label: 'Total Tickets', value: a.total, color: 'text-gray-900 dark:text-white' },
    { label: 'Open', value: a.open, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Resolution Rate', value: `${a.resolutionRate}%`, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg First Response', value: a.avgFirstResponseMins !== null ? `${a.avgFirstResponseMins}m` : '—', color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Avg Resolution', value: a.avgResolutionHours !== null ? `${a.avgResolutionHours}h` : '—', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'SLA Breaches', value: a.slaFirstResponseBreaches + a.slaResolutionBreaches, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="insights"
        title="Support Analytics"
        description="Volume, resolution performance, category mix and customer sentiment."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Tickets by Category</h3>
          <div className="space-y-2.5">
            {a.byCategory.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              a.byCategory.map((c) => <BarRow key={c.category} label={c.label} count={c.count} max={catMax} color="bg-brand-primary" />)
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Tickets by Status</h3>
          <div className="space-y-2.5">
            {a.byStatus.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              a.byStatus.map((s) => (
                <BarRow key={s.status} label={STATUS_LABELS[s.status as TicketStatus] || s.status} count={s.count} max={statusMax} color="bg-blue-500" />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Priority Mix</h3>
          <div className="space-y-2.5">
            {a.byPriority.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              a.byPriority.map((p) => (
                <BarRow
                  key={p.priority}
                  label={PRIORITY_LABELS[p.priority as TicketPriority] || p.priority}
                  count={p.count}
                  max={Math.max(1, ...a.byPriority.map((x) => x.count))}
                  color="bg-violet-500"
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">AI Sentiment</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            <div className="bg-emerald-500" style={{ width: `${(a.sentiment.positive / sentimentTotal) * 100}%` }} />
            <div className="bg-gray-300 dark:bg-gray-600" style={{ width: `${(a.sentiment.neutral / sentimentTotal) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(a.sentiment.negative / sentimentTotal) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Positive', value: a.sentiment.positive, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Neutral', value: a.sentiment.neutral, color: 'text-gray-500' },
              { label: 'Negative', value: a.sentiment.negative, color: 'text-red-600 dark:text-red-400' },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
