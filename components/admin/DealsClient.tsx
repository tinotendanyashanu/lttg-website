'use client';

import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import Link from 'next/link';

interface DealRow {
  id: string;
  clientName: string;
  partnerName: string;
  valueFormatted: string;
  dealStatus: string;
  createdAtString: string;
}

const STATUS_STYLES: Record<string, string> = {
  registered: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  approved:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  closed:     'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  rejected:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
};

const STATUS_TABS = [
  { value: 'all',        label: 'All Deals' },
  { value: 'registered', label: 'Registered' },
  { value: 'approved',   label: 'Approved' },
  { value: 'closed',     label: 'Closed' },
  { value: 'rejected',   label: 'Rejected' },
];

export default function DealsClient({ data }: { data: DealRow[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts: Record<string, number> = { all: data.length };
  for (const d of data) {
    counts[d.dealStatus] = (counts[d.dealStatus] || 0) + 1;
  }

  const filtered = data.filter((item) => {
    if (statusFilter !== 'all' && item.dealStatus !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.clientName?.toLowerCase().includes(q) ||
      item.partnerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
      {/* Tabs + Search */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        {/* Status tabs */}
        <div className="flex overflow-x-auto px-5 pt-4 gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                statusFilter === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {counts[tab.value] != null && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.value
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {counts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search row */}
        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search client or partner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 shrink-0 tabular-nums">
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Partner</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                  {search || statusFilter !== 'all' ? 'No deals match your filters.' : 'No deals registered yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {item.clientName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                    {item.partnerName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white tabular-nums text-sm">
                    {item.valueFormatted}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${
                        STATUS_STYLES[item.dealStatus] ?? STATUS_STYLES['registered']
                      }`}
                    >
                      {item.dealStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {item.createdAtString}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/deals/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
