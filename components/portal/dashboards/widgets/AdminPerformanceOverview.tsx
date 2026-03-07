import React from 'react';

interface AdminPerformanceOverviewProps {
  metrics: {
    totalLeads: number;
    totalClosedLeads: number;
    totalRevenue: number;
    totalPendingCommission: number;
    totalPaidCommission: number;
  } | null;
}

export default function AdminPerformanceOverview({ metrics }: AdminPerformanceOverviewProps) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
          <span className="material-icons-outlined text-lg">public</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Total Leads</span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {metrics.totalLeads.toLocaleString()}
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-green-200 dark:border-green-900/30">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-2">
          <span className="material-icons-outlined text-lg">check_circle</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Total Closed</span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {metrics.totalClosedLeads.toLocaleString()}
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
          <span className="material-icons-outlined text-lg">account_balance</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Total Revenue</span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-brand-primary">
          ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-orange-200 dark:border-orange-900/30">
        <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400 mb-2">
          <span className="material-icons-outlined text-lg">pending_actions</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Pending Comm.</span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          ${metrics.totalPendingCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] p-4 md:p-6 rounded-2xl shadow-soft dark:shadow-none border border-blue-200 dark:border-blue-900/30 lg:col-span-1 col-span-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-2">
          <span className="material-icons-outlined text-lg">payments</span>
          <span className="font-medium text-xs md:text-sm uppercase tracking-wider">Paid Comm.</span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          ${metrics.totalPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}
