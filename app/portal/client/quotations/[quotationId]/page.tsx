'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClientQuotation } from '@/lib/actions/client-quotations';
import { respondToQuotation } from '@/lib/actions/client-quotations';

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  expired: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
};

export default function ClientQuotationDetailPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const router = useRouter();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    getClientQuotation(quotationId).then((q) => {
      setQuotation(q);
      setLoading(false);
    });
  }, [quotationId]);

  function handleRespond(response: 'accepted' | 'rejected') {
    setError(null);
    setSuccess(null);
    setConfirming(null);
    startTransition(async () => {
      try {
        const result = await respondToQuotation(quotationId, response);
        if (response === 'accepted') {
          setSuccess(
            'Quotation accepted! An invoice has been created and sent to you. Redirecting…',
          );
          setTimeout(() => router.push(`/portal/client/invoices/${result.invoiceId}`), 2500);
        } else {
          setSuccess('Quotation declined. Our team will be in touch if you have questions.');
          setQuotation((prev: any) => ({ ...prev, status: 'rejected' }));
        }
      } catch (err: any) {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-icons-outlined text-gray-300 text-5xl animate-spin">autorenew</span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-32">
        <span className="material-icons-outlined text-gray-300 text-6xl block mb-3">error_outline</span>
        <p className="text-gray-500 dark:text-gray-400">Quotation not found.</p>
        <Link
          href="/portal/client/quotations"
          className="mt-4 inline-block text-sm text-violet-600 dark:text-violet-400 hover:underline"
        >
          Back to Quotations
        </Link>
      </div>
    );
  }

  const isExpired =
    quotation.validUntil && new Date(quotation.validUntil) < new Date() && quotation.status === 'sent';
  const canRespond = quotation.status === 'sent' && !isExpired;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/portal/client/quotations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <span className="material-icons-outlined text-[18px]">arrow_back</span>
        All Quotations
      </Link>

      {/* Card */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="bg-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Quotation</p>
              <p className="text-white text-xl font-black font-mono">{quotation.quotationNumber}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                STATUS_STYLES[quotation.status] || STATUS_STYLES.sent
              }`}
            >
              {quotation.status === 'sent' ? 'Awaiting Response' : quotation.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            {quotation.validUntil && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Valid Until</p>
                <p
                  className={`text-sm font-semibold ${
                    isExpired ? 'text-red-500' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {new Date(quotation.validUntil).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {isExpired && ' (Expired)'}
                </p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Issued</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Message */}
          {quotation.message && (
            <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
                Message
              </p>
              <p className="text-sm text-violet-900 dark:text-violet-200 leading-relaxed">{quotation.message}</p>
            </div>
          )}

          {/* Description */}
          {quotation.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{quotation.description}</p>
            </div>
          )}

          {/* Line Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Services</p>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">
                      Qty
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">
                      Price
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {quotation.lineItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.description}</td>
                      <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 font-mono text-xs">
                        {quotation.currency} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white font-mono text-xs">
                        {quotation.currency} {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 dark:bg-black text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total</span>
                <span className="text-lg font-black tabular-nums">
                  <span className="text-xs font-medium text-gray-500 mr-1">{quotation.currency}</span>
                  {quotation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                Notes
              </p>
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{quotation.notes}</p>
            </div>
          )}

          {/* Accepted / Rejected info */}
          {quotation.status === 'accepted' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex items-start gap-3">
              <span className="material-icons-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                  You accepted this quotation
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                  An invoice was automatically generated. Check your Invoices section.
                </p>
                <Link
                  href="/portal/client/invoices"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span className="material-icons-outlined text-[14px]">receipt_long</span>
                  View Invoices
                </Link>
              </div>
            </div>
          )}

          {quotation.status === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex items-center gap-3">
              <span className="material-icons-outlined text-red-500 text-[20px]">cancel</span>
              <p className="text-sm text-red-700 dark:text-red-400">You declined this quotation.</p>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <span className="material-icons-outlined text-[16px]">check_circle</span>
              {success}
            </div>
          )}

          {/* Actions */}
          {canRespond && !confirming && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setConfirming('accepted')}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="material-icons-outlined text-[18px]">check_circle</span>
                Accept Quotation
              </button>
              <button
                onClick={() => setConfirming('rejected')}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <span className="material-icons-outlined text-[18px]">cancel</span>
                Decline
              </button>
            </div>
          )}

          {/* Confirmation */}
          {confirming === 'accepted' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Accept this quotation for {quotation.currency}{' '}
                {quotation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}?
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500">
                An invoice will be automatically created and you will be redirected to it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('accepted')}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                  ) : (
                    <span className="material-icons-outlined text-[16px]">check</span>
                  )}
                  Yes, Accept
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  disabled={isPending}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {confirming === 'rejected' && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                Decline this quotation?
              </p>
              <p className="text-xs text-red-700 dark:text-red-500">
                Our team will be notified. You can contact us if you have questions or would like a revised offer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('rejected')}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                  ) : (
                    <span className="material-icons-outlined text-[16px]">cancel</span>
                  )}
                  Yes, Decline
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  disabled={isPending}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
