'use client';

import { useState, useTransition } from 'react';
import { adminReplyToTicket, adminUpdateTicketStatus } from '@/lib/actions/admin-tickets';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_client', label: 'Waiting on Client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

type TicketStatus = (typeof STATUS_OPTIONS)[number]['value'];

interface Props {
  ticketId: string;
  currentStatus: TicketStatus;
  ticketRef: string;
}

export default function TicketActionPanel({ ticketId, currentStatus, ticketRef }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reply
  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState<TicketStatus | ''>('');

  // Status
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [notifyOnStatus, setNotifyOnStatus] = useState(true);

  function showMsg(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return showMsg('error', 'Reply cannot be empty.');
    startTransition(async () => {
      try {
        await adminReplyToTicket(ticketId, reply.trim(), (replyStatus || undefined) as TicketStatus | undefined);
        setReply('');
        setReplyStatus('');
        showMsg('success', 'Reply sent and client notified by email.');
        router.refresh();
      } catch (err: any) {
        showMsg('error', err?.message || 'Failed to send reply.');
      }
    });
  }

  function handleStatusUpdate() {
    if (selectedStatus === currentStatus) return showMsg('error', 'Status unchanged.');
    startTransition(async () => {
      try {
        await adminUpdateTicketStatus(ticketId, selectedStatus, notifyOnStatus);
        showMsg('success', `Ticket ${ticketRef} status updated to "${selectedStatus}".${notifyOnStatus ? ' Client notified.' : ''}`);
        router.refresh();
      } catch (err: any) {
        showMsg('error', err?.message || 'Failed to update status.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Reply Form */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-icons-outlined text-[16px] text-brand-primary">reply</span>
          Reply to Client
        </h3>
        <form onSubmit={handleReply} className="space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Write your reply to the client…"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
          />
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Also update status (optional)</label>
            <select
              value={replyStatus}
              onChange={(e) => setReplyStatus(e.target.value as TicketStatus | '')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="">Keep current status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending || !reply.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          >
            {isPending ? (
              <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
            ) : (
              <span className="material-icons-outlined text-[16px]">send</span>
            )}
            {isPending ? 'Sending…' : 'Send Reply'}
          </button>
        </form>
      </div>

      {/* Status Update */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Update Status</h3>
        <div className="space-y-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnStatus}
              onChange={(e) => setNotifyOnStatus(e.target.checked)}
              className="w-4 h-4 rounded accent-brand-primary"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Notify client by email</span>
          </label>
          <button
            onClick={handleStatusUpdate}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-100 hover:opacity-80 disabled:opacity-50 text-white dark:text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          >
            <span className="material-icons-outlined text-[16px]">save</span>
            Update Status
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
