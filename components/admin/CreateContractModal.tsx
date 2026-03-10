'use client';

import { useState, useTransition } from 'react';
import { createAdminContract } from '@/lib/actions/admin-contracts';

interface Client {
  _id: string;
  fullName: string;
  email: string;
}

interface Props {
  clients: Client[];
}

const CONTRACT_TYPES = [
  'Service Agreement',
  'Non-Disclosure Agreement',
  'Consulting Agreement',
  'Retainer Agreement',
  'Statement of Work',
  'Master Services Agreement',
  'Other',
];

export default function CreateContractModal({ clients }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Service Agreement');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setClientId('');
    setTitle('');
    setType('Service Agreement');
    setContent('');
    setStatus('sent');
    setStartDate('');
    setEndDate('');
    setValue('');
    setCurrency('USD');
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientId) return setError('Please select a client.');
    if (!title.trim()) return setError('Contract title is required.');

    startTransition(async () => {
      try {
        const result = await createAdminContract({
          clientId,
          title,
          type,
          content: content || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          value: value ? parseFloat(value) : undefined,
          currency,
          notes: notes || undefined,
        });
        if (result.success) {
          setSuccess(
            `Contract ${result.contractNumber} created.${status === 'sent' ? ' Sent to client for signature.' : ' Saved as draft.'}`
          );
          setTimeout(handleClose, 2200);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create contract.');
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity shadow-sm"
      >
        <span className="material-icons-outlined text-[18px]">add</span>
        New Contract
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-[18px]">description</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Contract</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
              >
                <span className="material-icons-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Client + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Client *
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="">Select a client…</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'sent')}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="sent">Send to client (email)</option>
                    <option value="draft">Draft (no email)</option>
                  </select>
                </div>
              </div>

              {/* Title + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Website Development Agreement"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Contract Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contract Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Contract Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Enter the full contract terms, conditions, and scope of work…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-y font-mono leading-relaxed"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>

              {/* Value + Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Contract Value (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZAR">ZAR</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Internal Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Internal notes visible only to the admin team…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />
              </div>

              {/* Status hint */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {status === 'draft'
                  ? 'Draft: Contract saved but NOT sent to client.'
                  : 'Contract will be emailed to the client immediately and made available for signature in their portal.'}
              </p>

              {/* Feedback */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span className="material-icons-outlined text-[16px]">check_circle</span>
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-opacity shadow-sm"
                >
                  {isPending ? (
                    <>
                      <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                      Creating…
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-[16px]">send</span>
                      Create Contract
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
