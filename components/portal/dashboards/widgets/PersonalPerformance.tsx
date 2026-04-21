import React from 'react';

interface PersonalPerformanceProps {
  metrics: {
    totalLeads: number;
    closedLeads: number;
    rejectedLeads: number;
    conversionRate: number;
  } | null;
  isIntern: boolean;
}

interface PerformanceCard {
  label: string;
  value: string | number;
  icon: string;
  iconClass: string;
  bgClass: string;
}

export default function PersonalPerformance({ metrics, isIntern }: PersonalPerformanceProps) {
  if (!metrics) return null;

  const cards: PerformanceCard[] = [
    {
      label: isIntern ? 'Total Leads' : 'Assigned Leads',
      value: metrics.totalLeads,
      icon: 'public',
      iconClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Closed Leads',
      value: metrics.closedLeads,
      icon: 'check_circle',
      iconClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  if (isIntern) {
    cards.push({
      label: 'Rejected Leads',
      value: metrics.rejectedLeads,
      icon: 'cancel',
      iconClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
    });
  }

  cards.push({
    label: 'Conversion Rate',
    value: `${metrics.conversionRate}%`,
    icon: 'trending_up',
    iconClass: 'text-brand-primary',
    bgClass: 'bg-brand-primary/10',
  });

  return (
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
        </div>
      ))}
    </div>
  );
}
