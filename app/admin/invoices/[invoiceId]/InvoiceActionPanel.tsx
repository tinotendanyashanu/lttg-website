'use client';

import { useState, useTransition } from 'react';
import { updateAdminInvoiceStatus, sendInvoiceReminder, deleteAdminInvoice } from '@/lib/actions/admin-invoices';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

type InvoiceStatus = (typeof STATUS_OPTIONS)[number]['value'];

interface Props {
  invoiceId: string;
  currentStatus: InvoiceStatus;
  invoiceNumber: string;
}

export default function InvoiceActionPanel({ invoiceId, currentStatus, invoiceNumber }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>(currentStatus);
  const [notify, setNotify] = useState(true);

  function showMsg(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleStatusUpdate() {
    if (selectedStatus === currentStatus) return showMsg('error', 'No change — status is already ' + currentStatus + '.');
    startTransition(async () => {
      try {
        await updateAdminInvoiceStatus(invoiceId, selectedStatus, notify);
        showMsg('success', `Invoice ${invoiceNumber} updated to "${selectedStatus}".${notify ? ' Client notified.' : ''}`);
        router.refresh();
      } catch (err: any) {
        showMsg('error', err?.message || 'Failed to update status.');
      }
    });
  }

  function handleReminder() {
    startTransition(async () => {
      try {
        await sendInvoiceReminder(invoiceId);
        showMsg('success', 'Reminder email sent to client.');
      } catch (err: any) {
        showMsg('error', err?.message || 'Failed to send reminder.');
      }
    });
  }

  function handleCancel() {
    if (!confirm(`Cancel invoice ${invoiceNumber}? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteAdminInvoice(invoiceId);
        showMsg('success', `Invoice ${invoiceNumber} has been cancelled.`);
        router.refresh();
      } catch (err: any) {
        showMsg('error', err?.message || 'Failed to cancel invoice.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Status Update */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Update Status</h3>

        <div className="space-y-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-primary"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Notify client by email</span>
          </label>

          <button
            onClick={handleStatusUpdate}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          >
            {isPending ? (
              <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
            ) : (
              <span className="material-icons-outlined text-[16px]">save</span>
            )}
            {isPending ? 'Saving…' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={handleReminder}
            disabled={isPending || currentStatus === 'paid' || currentStatus === 'cancelled'}
            className="w-full inline-flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-icons-outlined text-[16px]">notifications</span>
            Send Payment Reminder
          </button>

          <button
            onClick={handleCancel}
            disabled={isPending || currentStatus === 'paid' || currentStatus === 'cancelled'}
            className="w-full inline-flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-icons-outlined text-[16px]">cancel</span>
            Cancel Invoice
          </button>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div className={`rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40'
        }`}>
          <span className="material-icons-outlined text-[14px]">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </div>
      )}
    </div>
  );
}
