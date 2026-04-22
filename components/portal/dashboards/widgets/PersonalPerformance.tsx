import React from 'react';

interface PersonalPerformanceProps {
  metrics: {
    totalLeads: number;
    closedLeads: number;
    rejectedLeads: number;
    conversionRate: number;
    monthlyClosedDeals: number;
    monthlyQualifiedLeads: number;
    followUpRate: number;
    crmUpdateCompliance: number;
    status: 'On Track' | 'Watchlist' | 'At Risk' | 'Contract Review';
    isTopPerformer: boolean;
  } | null;
  isIntern: boolean;
}

interface PerformanceCard {
  label: string;
  value: string | number;
  icon: string;
  iconClass: string;
  bgClass: string;
  target?: string;
}

export default function PersonalPerformance({ metrics, isIntern }: PersonalPerformanceProps) {
  if (!metrics) return null;

  const statusColors = {
    'On Track': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Watchlist': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'At Risk': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Contract Review': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const cards: PerformanceCard[] = [
    {
      label: 'Monthly Closed',
      value: metrics.monthlyClosedDeals,
      icon: 'check_circle',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
      target: 'Target: 2'
    },
    {
      label: 'Monthly Qualified',
      value: metrics.monthlyQualifiedLeads,
      icon: 'stars',
      iconClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      target: 'Target: 5'
    },
    {
      label: 'Follow-up Rate',
      value: `${metrics.followUpRate}%`,
      icon: 'history',
      iconClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      target: 'Target: 90%'
    },
    {
      label: 'CRM Compliance',
      value: `${metrics.crmUpdateCompliance}%`,
      icon: 'update',
      iconClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      target: 'Target: 100%'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[metrics.status]}`}>
            {metrics.status.toUpperCase()}
          </span>
          {metrics.isTopPerformer && (
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
              <span className="material-icons-outlined text-[14px]">military_tech</span>
              TOP PERFORMER (25% COMM)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          April 2026 Performance Period
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#27272a] p-5 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bgClass}`}>
                <span className={`material-icons-outlined text-[20px] ${card.iconClass}`}>
                  {card.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</div>
            {card.target && (
              <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                {card.target}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
