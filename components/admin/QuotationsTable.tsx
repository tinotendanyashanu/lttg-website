'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { sendAdminQuotation, cancelAdminQuotation } from '@/lib/actions/admin-quotations';

interface Quotation {
  _id: string;
  quotationNumber: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: string;
  sentAt?: string;
  validUntil?: string;
  clientId?: string;
  prospectName?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface Props {
  quotations: Quotation[];
  accountMap: Record<string, { fullName?: string; email: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  expired: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
};

export default function QuotationsTable({ quotations, accountMap }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = filter === 'all' ? quotations : quotations.filter((q) => q.status === filter);

  function handleSend(quotationId: string) {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await sendAdminQuotation(quotationId);
        if (result.whatsappLink) {
          window.open(result.whatsappLink, '_blank', 'noopener,noreferrer');
        }
      } catch (err: any) {
        setActionError(err?.message || 'Failed to send quotation.');
      }
    });
  }

  function handleCancel(quotationId: string, quotationNumber: string) {
    if (!confirm(`Cancel quotation ${quotationNumber}? This cannot be undone.`)) return;
    setActionError(null);
    startTransition(async () => {
      try {
        await cancelAdminQuotation(quotationId);
      } catch (err: any) {
        setActionError(err?.message || 'Failed to cancel quotation.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-400">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === s
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              request_quote
            </span>
            <p className="text-gray-500 dark:text-gray-400">No quotations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Quotation #', 'Client', 'Amount', 'Status', 'Valid Until', 'Sent', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((q) => {
                  const client = q.clientId ? accountMap[q.clientId] : null;
                  const displayName = client?.fullName || q.prospectName || '—';
                  const displayEmail = client?.email || q.prospectEmail || '';
                  const isProspect = !q.clientId;
                  return (
                    <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {q.quotationNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{displayName}</span>
                          {isProspect && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                              prospect
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {displayEmail}
                          {q.prospectPhone && (
                            <span className="ml-2 text-gray-300">· {q.prospectPhone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {q.currency} {q.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase whitespace-nowrap ${
                            STATUS_STYLES[q.status] || STATUS_STYLES.sent
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {q.sentAt ? new Date(q.sentAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {q.status === 'draft' && (
                            <button
                              onClick={() => handleSend(q._id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50"
                            >
                              <span className="material-icons-outlined text-[14px]">send</span>
                              Send
                            </button>
                          )}
                          {q.status === 'accepted' && q.clientId && (
                            <Link
                              href={`/admin/invoices`}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              View Invoice
                            </Link>
                          )}
                          {['draft', 'sent'].includes(q.status) && (
                            <button
                              onClick={() => handleCancel(q._id, q.quotationNumber)}
                              disabled={isPending}
                              className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
