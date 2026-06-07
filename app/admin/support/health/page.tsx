import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getCustomerHealth } from '@/lib/actions/support-center';
import { HEALTH_LABELS, type HealthLevel } from '@/lib/support/constants';

export const metadata = { title: 'Customer Health | Support' };
export const dynamic = 'force-dynamic';

const LEVEL_STYLES: Record<HealthLevel, { chip: string; bar: string; ring: string }> = {
  excellent: {
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
    bar: 'bg-emerald-500',
    ring: 'text-emerald-500',
  },
  good: {
    chip: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
    bar: 'bg-blue-500',
    ring: 'text-blue-500',
  },
  at_risk: {
    chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
    bar: 'bg-amber-500',
    ring: 'text-amber-500',
  },
  critical: {
    chip: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
    bar: 'bg-red-500',
    ring: 'text-red-500',
  },
};

export default async function CustomerHealthPage() {
  const rows = await getCustomerHealth();
  const atRisk = rows.filter((r) => r.level === 'at_risk' || r.level === 'critical');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="favorite"
        title="Customer Health"
        description="Composite health from tickets, sentiment, billing and project signals."
      />

      {atRisk.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 flex items-start gap-3">
          <span className="material-icons-outlined text-red-600 dark:text-red-400">warning</span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              {atRisk.length} customer{atRisk.length === 1 ? '' : 's'} need attention
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              {atRisk.slice(0, 5).map((r) => r.fullName || r.email).filter(Boolean).join(', ')}
              {atRisk.length > 5 ? ` +${atRisk.length - 5} more` : ''}
            </p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft py-20 text-center">
          <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">favorite</span>
          <p className="text-gray-500 dark:text-gray-400">No customers with support history yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((r) => {
            const styles = LEVEL_STYLES[r.level];
            return (
              <div key={r.clientId} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{r.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">{r.companyName || r.email}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${styles.chip}`}>
                    {HEALTH_LABELS[r.level]}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-3xl font-extrabold ${styles.ring}`}>{r.score}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${r.score}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Health score / 100</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {r.factors.length === 0 ? (
                    <span className="text-xs text-gray-400">No negative signals</span>
                  ) : (
                    r.factors.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-md px-2 py-0.5">
                        {f.label}: {f.detail}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
