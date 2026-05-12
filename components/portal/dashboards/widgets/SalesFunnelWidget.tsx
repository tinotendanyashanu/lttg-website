import React from 'react';

interface SalesFunnelWidgetProps {
  metrics: {
    totalLeads: number;
    monthlyQualifiedLeads: number;
    monthlyClosedDeals: number;
  } | null;
}

export default function SalesFunnelWidget({ metrics }: SalesFunnelWidgetProps) {
  if (!metrics) return null;

  // For a meaningful funnel, we need to ensure the values are logical (Total >= Qualified >= Closed)
  // Since 'totalLeads' might be all time and 'monthly' is just this month, we'll approximate 
  // or just show them as raw numbers in a visual funnel shape.
  const total = Math.max(metrics.totalLeads, metrics.monthlyQualifiedLeads, 1);
  const qualified = metrics.monthlyQualifiedLeads;
  const closed = metrics.monthlyClosedDeals;

  const funnelSteps = [
    { label: 'Total Leads', value: metrics.totalLeads, color: 'bg-blue-500', width: '100%' },
    { label: 'Qualified (Monthly)', value: qualified, color: 'bg-amber-500', width: `${Math.max((qualified / total) * 100, 15)}%` },
    { label: 'Closed (Monthly)', value: closed, color: 'bg-emerald-500', width: `${Math.max((closed / total) * 100, 5)}%` },
  ];

  return (
    <div className="bg-white/80 dark:bg-[#27272a]/80 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">filter_alt</span>
          Sales Funnel
        </h2>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          Current Period
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full px-4 pb-4">
        {funnelSteps.map((step, index) => (
          <div key={index} className="w-full flex flex-col items-center group">
            <div 
              className={`h-12 rounded-xl flex items-center justify-center transition-all duration-700 ease-in-out ${step.color} shadow-sm group-hover:scale-[1.02]`}
              style={{ width: step.width, minWidth: '40%' }}
            >
              <span className="text-white font-bold text-lg drop-shadow-sm">{step.value}</span>
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest">
              {step.label}
            </div>
            {index < funnelSteps.length - 1 && (
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
