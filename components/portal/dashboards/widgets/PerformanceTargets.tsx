import React from 'react';

interface Target {
  label: string;
  current: number;
  target: number;
  unit: string;
  description: string;
}

interface PerformanceTargetsProps {
  metrics: {
    monthlyClosedDeals: number;
    monthlyQualifiedLeads: number;
    followUpRate: number;
    crmUpdateCompliance: number;
  } | null;
}

export default function PerformanceTargets({ metrics }: PerformanceTargetsProps) {
  if (!metrics) return null;

  const targets: Target[] = [
    {
      label: 'Closed Deals',
      current: metrics.monthlyClosedDeals,
      target: 2,
      unit: 'deals',
      description: 'Minimum primary KPI for active status.'
    },
    {
      label: 'Qualified Leads',
      current: metrics.monthlyQualifiedLeads,
      target: 5,
      unit: 'leads',
      description: 'New opportunities added to the pipeline.'
    },
    {
      label: 'Follow-up Rate',
      current: metrics.followUpRate,
      target: 90,
      unit: '%',
      description: 'Completion of scheduled follow-ups.'
    },
    {
      label: 'CRM Compliance',
      current: metrics.crmUpdateCompliance,
      target: 100,
      unit: '%',
      description: 'Leads updated within 24 hours of activity.'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">track_changes</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Targets</h2>
        </div>
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Performance Policy
        </div>
      </div>

      <div className="space-y-6">
        {targets.map((t) => {
          const progress = Math.min((t.current / t.target) * 100, 100);
          const isMet = t.current >= t.target;

          return (
            <div key={t.label} className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {t.label}
                    {isMet && <span className="material-icons text-emerald-500 text-[16px]">check_circle</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.description}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t.current}/{t.target}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1 font-medium">{t.unit}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isMet ? 'bg-emerald-500' : progress > 50 ? 'bg-amber-500' : 'bg-brand-primary'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
        <div className="flex gap-3">
          <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>Top Performer Incentive:</strong> Reach 4+ closed deals, 10+ qualified leads, and 95%+ follow-up rate to unlock <strong>25% commission</strong> for this period.
          </p>
        </div>
      </div>
    </div>
  );
}
