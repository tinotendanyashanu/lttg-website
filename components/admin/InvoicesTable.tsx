'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  issued:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  sent:      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/40',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  overdue:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'draft',     label: 'Draft' },
  { value: 'issued',    label: 'Issued' },
  { value: 'sent',      label: 'Sent' },
  { value: 'overdue',   label: 'Overdue' },
  { value: 'paid',      label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

export interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  status: string;
  issuedAt?: string;
  dueAt?: string;
  clientId: string;
}

export interface AccountInfo {
  fullName?: string;
  email: string;
}

interface InvoicesTableProps {
  invoices: InvoiceRow[];
  accountMap: Record<string, AccountInfo>;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function InvoicesTable({ invoices, accountMap }: InvoicesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts: Record<string, number> = { all: invoices.length };
  for (const inv of invoices) {
    counts[inv.status] = (counts[inv.status] || 0) + 1;
  }

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const client = accountMap[String(inv.clientId)];
    return (
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      client?.fullName?.toLowerCase().includes(q) ||
      client?.email?.toLowerCase().includes(q)
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
              placeholder="Search invoice # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 shrink-0 tabular-nums">
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Issued</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                  {search || statusFilter !== 'all'
                    ? 'No invoices match your filters.'
                    : 'No invoices yet. Click "New Invoice" to create one.'}
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const client = accountMap[String(inv.clientId)];
                return (
                  <tr
                    key={inv._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white text-xs">
                        {client?.fullName || 'Unknown'}
                      </div>
                      <div className="text-[11px] text-gray-400">{client?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white tabular-nums text-xs">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: inv.currency || 'USD',
                      }).format(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${
                          STATUS_STYLES[inv.status] ?? STATUS_STYLES['draft']
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {inv.issuedAt
                        ? new Date(inv.issuedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {inv.dueAt ? (
                        <span
                          className={
                            inv.status === 'overdue'
                              ? 'text-red-500 dark:text-red-400 font-semibold'
                              : ''
                          }
                        >
                          {new Date(inv.dueAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/invoices/${inv._id}`}
                        className="text-xs font-semibold text-brand-primary hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
