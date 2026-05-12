import React from 'react';
import { differenceInDays, endOfMonth } from 'date-fns';

interface ActionableInsightsProps {
  metrics: {
    monthlyClosedDeals: number;
    monthlyQualifiedLeads: number;
    followUpRate: number;
    status: 'On Track' | 'Watchlist' | 'At Risk' | 'Contract Review';
  } | null;
}

export default function ActionableInsights({ metrics }: ActionableInsightsProps) {
  if (!metrics) return null;

  const now = new Date();
  const endOfCurrentMonth = endOfMonth(now);
  const daysLeft = differenceInDays(endOfCurrentMonth, now);
  
  // Status Config
  const statusConfig = {
    'On Track': { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'check_circle' },
    'Watchlist': { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: 'warning' },
    'At Risk': { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: 'error' },
    'Contract Review': { color: 'text-red-600', bg: 'bg-red-600/10 border-red-600/20', icon: 'gavel' },
  };

  const currentStatus = statusConfig[metrics.status] || statusConfig['On Track'];

  // Determine Insight
  let insightTitle = '';
  let insightBody = '';

  if (metrics.monthlyClosedDeals < 2) {
    const needed = 2 - metrics.monthlyClosedDeals;
    insightTitle = "Focus on closing deals";
    insightBody = `You need ${needed} more ${needed === 1 ? 'deal' : 'deals'} to hit your monthly target. You have ${daysLeft} days left.`;
  } else if (metrics.monthlyQualifiedLeads < 5) {
    const needed = 5 - metrics.monthlyQualifiedLeads;
    insightTitle = "Qualify more leads";
    insightBody = `You need ${needed} more qualified leads. Reach out to your fresh leads today.`;
  } else if (metrics.followUpRate < 90) {
    insightTitle = "Improve follow-up rate";
    insightBody = `Your follow-up rate is ${metrics.followUpRate}%. Clear out your due tasks to get above 90%.`;
  } else {
    insightTitle = "You're crushing it!";
    insightBody = `You've hit your primary targets. Keep pushing to maximize your commission for the month!`;
  }

  return (
    <div className="bg-white/80 dark:bg-[#27272a]/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${currentStatus.bg}`}>
          <span className={`material-icons-outlined text-[24px] ${currentStatus.color}`}>
            {currentStatus.icon}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">Current Status</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.color}`}>
              {metrics.status}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {daysLeft} days remaining in month
          </div>
        </div>
      </div>

      <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

      <div className="flex-1 flex gap-3">
        <span className="material-icons-outlined text-brand-primary mt-0.5">tips_and_updates</span>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{insightTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{insightBody}</p>
        </div>
      </div>
    </div>
  );
}
