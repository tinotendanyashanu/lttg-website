import React from 'react';
import Link from 'next/link';

interface AdminActiveCasesProps {
  cases: {
    pendingStatusLeads: Array<{
      id: string;
      name: string;
      createdAt: Date;
    }>;
    pendingCommissions: Array<{
      id: string;
      amount: number;
      accountName: string;
      leadName: string;
      createdAt: Date;
    }>;
  };
}

export default function AdminActiveCases({ cases }: AdminActiveCasesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Leads Needing Action */}
      <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            New Leads Awaiting Contact
          </h2>
          <Link href="/portal/case-management" className="text-brand-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        
        {cases.pendingStatusLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No new leads pending contact.
          </div>
        ) : (
          <div className="space-y-4">
            {cases.pendingStatusLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">{lead.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded">New</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commissions Needing Payment */}
      <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Pending Commissions
          </h2>
          <Link href="/portal/admin/manage-commissions" className="text-brand-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        {cases.pendingCommissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No commissions pending payment.
          </div>
        ) : (
          <div className="space-y-4">
            {cases.pendingCommissions.map((comm) => (
              <div key={comm.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">{comm.accountName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">For: {comm.leadName}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">${comm.amount.toLocaleString()}</div>
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mt-0.5 block">Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
