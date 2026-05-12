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
  current: number;
  target: number;
  unit: string;
  icon: string;
  description: string;
}

export default function PersonalPerformance({ metrics, isIntern }: PersonalPerformanceProps) {
  if (!metrics) return null;

  const cards: PerformanceCard[] = [
    {
      label: 'Deals Closed',
      current: metrics.monthlyClosedDeals,
      target: 2,
      unit: 'deals',
      icon: 'check_circle',
      description: 'Converted leads this month'
    },
    {
      label: 'Qualified Leads',
      current: metrics.monthlyQualifiedLeads,
      target: 5,
      unit: 'leads',
      icon: 'stars',
      description: 'Leads moved to qualified'
    },
    {
      label: 'Follow-up Rate',
      current: metrics.followUpRate,
      target: 90,
      unit: '%',
      icon: 'history',
      description: 'Completed due tasks'
    },
    {
      label: 'CRM Compliance',
      current: metrics.crmUpdateCompliance,
      target: 100,
      unit: '%',
      icon: 'update',
      description: 'Updated in last 48h'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">leaderboard</span>
          Monthly Performance
        </h2>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const progress = Math.min((card.current / card.target) * 100, 100);
          const isMet = card.current >= card.target;
          const isEmpty = card.current === 0;
          
          let progressColor = 'bg-brand-primary';
          if (isMet) {
            progressColor = 'bg-emerald-500';
          } else if (progress > 50) {
            progressColor = 'bg-amber-500';
          } else if (progress > 0) {
            progressColor = 'bg-red-500';
          }

          let iconBg = 'bg-gray-50 dark:bg-gray-800/50';
          let iconColor = 'text-gray-600 dark:text-gray-400';
          if (isMet) {
            iconBg = 'bg-emerald-50 dark:bg-emerald-900/20';
            iconColor = 'text-emerald-600 dark:text-emerald-400';
          } else if (progress > 50) {
            iconBg = 'bg-amber-50 dark:bg-amber-900/20';
            iconColor = 'text-amber-600 dark:text-amber-400';
          }

          return (
            <div
              key={card.label}
              className="bg-white/80 dark:bg-[#27272a]/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${iconBg}`}>
                    <span className={`material-icons-outlined text-[20px] ${iconColor}`}>
                      {card.icon}
                    </span>
                  </div>
                  {isMet && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                      Target Hit
                    </span>
                  )}
                </div>
                
                <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {card.current}
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 ml-1">
                    / {card.target}{card.unit === '%' ? '' : ' '}
                  </span>
                </div>
                
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {card.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1" title={card.description}>
                  {card.description}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} ${isEmpty ? 'w-0' : ''}`}
                    style={{ width: isEmpty ? '0%' : `${progress}%` }}
                  />
                </div>
                {isEmpty && (
                  <div className="text-[10px] text-gray-400 mt-1.5 italic text-center">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
