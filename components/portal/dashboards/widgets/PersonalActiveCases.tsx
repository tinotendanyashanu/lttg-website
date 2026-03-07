import React from 'react';
import Link from 'next/link';

interface PersonalActiveCasesProps {
  cases: Array<{
    id: string;
    name: string;
    status: string;
    updatedAt: Date;
  }>;
}

export default function PersonalActiveCases({ cases }: PersonalActiveCasesProps) {
  return (
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary/50 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
          </span>
          Active Cases Requiring Attention
        </h2>
        <Link href="/portal/case-management" className="text-brand-primary text-sm font-medium hover:underline">
          View All
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
            <span className="material-icons-outlined text-gray-400 text-3xl">task_alt</span>
          </div>
          <h3 className="text-gray-900 dark:text-white font-medium mb-1">You're all caught up!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            No active cases currently require your immediate attention.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {cases.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#27272a] hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  c.status === 'new' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                }`}>
                  <span className="material-icons-outlined text-sm">{c.status === 'new' ? 'fiber_new' : 'phone_in_talk'}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-brand-primary transition-colors">{c.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Last updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                c.status === 'new' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {c.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
