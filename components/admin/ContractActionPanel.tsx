'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminContractStatus, resendContract } from '@/lib/actions/admin-contracts';
import type { ContractStatus } from '@/models/ClientContract';

const ALL_STATUSES: { value: ContractStatus; label: string }[] = [
  { value: 'draft',        label: 'Draft' },
  { value: 'sent',         label: 'Sent to Client' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'signed',       label: 'Signed' },
  { value: 'active',       label: 'Active' },
  { value: 'expired',      label: 'Expired' },
  { value: 'terminated',   label: 'Terminated' },
];

interface Props {
  contractId: string;
  currentStatus: ContractStatus;
  contractNumber: string;
  signingTokenExpiresAt?: string;
  clientEmail?: string;
  notes?: string;
}

export default function ContractActionPanel({
  contractId,
  currentStatus,
  contractNumber,
  signingTokenExpiresAt,
  clientEmail,
  notes,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newStatus, setNewStatus] = useState<ContractStatus>(currentStatus);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tokenExpired = signingTokenExpiresAt
    ? new Date(signingTokenExpiresAt) < new Date()
    : false;

  function handleStatusUpdate() {
    if (newStatus === currentStatus) return;
    setMessage(null);
    startTransition(async () => {
      try {
        await updateAdminContractStatus(contractId, newStatus);
        setMessage({ type: 'success', text: `Status updated to "${newStatus.replace(/_/g, ' ')}".` });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err?.message || 'Failed to update status.' });
      }
    });
  }

  function handleResend() {
    setMessage(null);
    startTransition(async () => {
      try {
        await resendContract(contractId);
        setMessage({
          type: 'success',
          text: clientEmail
            ? `Contract resent to ${clientEmail}. New signing link is valid for 72 hours.`
            : 'Contract resent. New signing link is valid for 72 hours.',
        });
        router.refresh();
      } catch (err: any) {
        setMessage({ type: 'error', text: err?.message || 'Failed to resend contract.' });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Status update */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Update Status
        </h3>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as ContractStatus)}
          disabled={isPending}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={handleStatusUpdate}
          disabled={isPending || newStatus === currentStatus}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity"
        >
          {isPending ? (
            <><span className="material-icons-outlined text-[15px] animate-spin">autorenew</span>Updating…</>
          ) : (
            <><span className="material-icons-outlined text-[15px]">sync</span>Update Status</>
          )}
        </button>
      </div>

      {/* Signing link info + resend */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Client Signing Link
        </h3>

        {signingTokenExpiresAt ? (
          tokenExpired ? (
            <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl px-3 py-2.5">
              <span className="material-icons-outlined text-[15px] mt-0.5 shrink-0">timer_off</span>
              <span>Signing link <strong>expired</strong> on {new Date(signingTokenExpiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-xl px-3 py-2.5">
              <span className="material-icons-outlined text-[15px] mt-0.5 shrink-0">schedule</span>
              <span>Signing link expires {new Date(signingTokenExpiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.</span>
            </div>
          )
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">No active signing link. Resend to generate a new 72-hour link.</p>
        )}

        <button
          onClick={handleResend}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 hover:opacity-90 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity"
        >
          {isPending ? (
            <><span className="material-icons-outlined text-[15px] animate-spin">autorenew</span>Resending…</>
          ) : (
            <><span className="material-icons-outlined text-[15px]">send</span>Resend to Client</>
          )}
        </button>
      </div>

      {/* PDF link */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Document
        </h3>
        <a
          href={`/admin/contracts/${contractId}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          <span className="material-icons-outlined text-[15px]">download</span>
          Download / Print PDF
        </a>
      </div>

      {/* Internal notes */}
      {notes && (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5">
          <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
            Internal Notes
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed whitespace-pre-wrap">
            {notes}
          </p>
        </div>
      )}

      {/* Feedback */}
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400'
          }`}
        >
          <span className="material-icons-outlined text-[15px]">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </div>
      )}
    </div>
  );
}
