import React from 'react';
import Link from 'next/link';

interface InternCommissionSnapshotProps {
  title?: string;
  metrics: {
    totalPending: number;
    totalApproved: number;
    totalPaid: number;
    lifetimeEarnings: number;
    latestCreatedDate: Date | null;
    latestPaidDate: Date | null;
  } | null;
}

export default function InternCommissionSnapshot({ metrics, title = "Commission Snapshot" }: InternCommissionSnapshotProps) {
  if (!metrics) return null;

  return (
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">account_balance_wallet</span>
          {title}
        </h2>
        <Link href="/portal/earnings" className="text-brand-primary text-sm font-semibold hover:underline">
          View all
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 border border-orange-100 dark:border-orange-900/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
          <p className="text-xs font-medium text-orange-800 dark:text-orange-400 mb-1">Total Pending (14-day hold)</p>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${(metrics.totalPending || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 border border-blue-100 dark:border-blue-900/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Approved Balance</p>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${(metrics.totalApproved || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 p-3 border border-green-100 dark:border-green-900/30 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <p className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Lifetime Earnings</p>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${(metrics.lifetimeEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
