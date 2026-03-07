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

export default function PersonalPerformance({ metrics, isIntern }: PersonalPerformanceProps) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
          <span className="material-icons-outlined text-lg">public</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">{isIntern ? 'Total Leads' : 'Assigned Leads'}</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {metrics.totalLeads}
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 border-b-4 border-b-green-500">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
          <span className="material-icons-outlined text-lg">check_circle</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Closed Leads</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {metrics.closedLeads}
        </div>
      </div>

      {isIntern && (
        <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 border-b-4 border-b-red-500">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="material-icons-outlined text-lg">cancel</span>
            <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Rejected Leads</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {metrics.rejectedLeads}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
          <span className="material-icons-outlined text-lg">trending_up</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Conversion Rate</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-brand-primary">
          {metrics.conversionRate}%
        </div>
      </div>
    </div>
  );
}
