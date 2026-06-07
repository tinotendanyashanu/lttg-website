'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  new:            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/40',
  open:           'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  in_progress:    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/40',
  waiting_client: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  escalated:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  resolved:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  closed:         'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:      'text-gray-500',
  medium:   'text-blue-600 dark:text-blue-400',
  high:     'text-orange-500',
  urgent:   'text-red-600 dark:text-red-400 font-bold',
  critical: 'text-red-600 dark:text-red-400 font-bold',
};

const PRIORITY_ORDER: Record<string, number> = { critical: 0, urgent: 0, high: 1, medium: 2, low: 3 };

const STATUS_TABS = [
  { value: 'all',            label: 'All' },
  { value: 'new',            label: 'New' },
  { value: 'open',           label: 'Open' },
  { value: 'in_progress',    label: 'In Progress' },
  { value: 'waiting_client', label: 'Waiting' },
  { value: 'escalated',      label: 'Escalated' },
  { value: 'resolved',       label: 'Resolved' },
  { value: 'closed',         label: 'Closed' },
];

export interface TicketRow {
  _id: string;
  ticketId: string;
  subject: string;
  category?: string;
  status: string;
  priority: string;
  createdAt: string;
  clientId: string;
}

export interface AccountInfo {
  fullName?: string;
  email: string;
}

interface TicketsTableProps {
  tickets: TicketRow[];
  accountMap: Record<string, AccountInfo>;
}

export default function TicketsTable({ tickets, accountMap }: TicketsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts: Record<string, number> = { all: tickets.length };
  for (const t of tickets) {
    counts[t.status] = (counts[t.status] || 0) + 1;
  }

  const filtered = tickets
    .filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const client = accountMap[String(t.clientId)];
      return (
        t.ticketId?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        client?.fullName?.toLowerCase().includes(q) ||
        client?.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
              placeholder="Search tickets, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 shrink-0 tabular-nums">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-3">Ticket ID</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                  {search || statusFilter !== 'all'
                    ? 'No tickets match your filters.'
                    : 'No support tickets yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => {
                const client = accountMap[String(ticket.clientId)];
                return (
                  <tr
                    key={ticket._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400 font-semibold whitespace-nowrap">
                      {ticket.ticketId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white text-xs">
                        {client?.fullName || 'Unknown'}
                      </div>
                      <div className="text-[11px] text-gray-400">{client?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <p className="text-xs text-gray-800 dark:text-gray-200 truncate" title={ticket.subject}>
                        {ticket.subject}
                      </p>
                      {ticket.category && (
                        <p className="text-[11px] text-gray-400 capitalize">{ticket.category}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs capitalize font-medium ${PRIORITY_STYLES[ticket.priority] ?? ''}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${
                          STATUS_STYLES[ticket.status] ?? STATUS_STYLES['open']
                        }`}
                      >
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/tickets/${ticket._id}`}
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
