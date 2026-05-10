'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { approveEmployeeInvoice, rejectEmployeeInvoice } from '@/lib/actions/portal-admin-invoices';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  issued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Awaiting Approval',
  issued: 'Approved & Issued',
  sent: 'Sent',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

interface Props {
  initialInvoices: any[];
  accountMap: Record<string, any>;
}

export default function AdminInvoiceApprovalClient({ initialInvoices, accountMap }: Props) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filterStatus, setFilterStatus] = useState('pending_approval');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'all') return invoices;
    return invoices.filter((inv) => inv.status === filterStatus);
  }, [invoices, filterStatus]);

  const pendingCount = invoices.filter((inv) => inv.status === 'pending_approval').length;

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    setIsProcessing(true);
    try {
      const res = await approveEmployeeInvoice(selectedInvoice._id, approvalNote);
      if (res.success) {
        setInvoices((prev) =>
          prev.map((inv) => inv._id === selectedInvoice._id ? { ...inv, status: 'issued', approvalStatus: 'approved' } : inv)
        );
        setSelectedInvoice(null);
        setApprovalNote('');
        setActionType(null);
        router.refresh();
      } else {
        alert(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !rejectReason.trim()) { alert('Rejection reason is required.'); return; }
    setIsProcessing(true);
    try {
      const res = await rejectEmployeeInvoice(selectedInvoice._id, rejectReason);
      if (res.success) {
        setInvoices((prev) =>
          prev.map((inv) => inv._id === selectedInvoice._id ? { ...inv, status: 'rejected', approvalStatus: 'rejected', approvalNotes: rejectReason } : inv)
        );
        setSelectedInvoice(null);
        setRejectReason('');
        setActionType(null);
        router.refresh();
      } else {
        alert(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending count banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">{pendingCount}</span>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {pendingCount} invoice{pendingCount !== 1 ? 's' : ''} awaiting your approval.
          </p>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending_approval', 'issued', 'rejected', 'draft'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterStatus === s
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABEL[s] || s}
            {s === 'pending_approval' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice table */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-icons-outlined text-5xl text-gray-300 dark:text-gray-700 block mb-3">receipt_long</span>
            <p className="font-bold text-gray-900 dark:text-white">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Invoice #</th>
                  <th className="px-5 py-3 font-semibold">Submitted By</th>
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredInvoices.map((inv) => {
                  const employee = accountMap[inv.createdByEmployeeId] || {};
                  const client = accountMap[inv.clientId] || {};
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                        {inv.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{inv.description}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{employee.fullName || '—'}</p>
                        <p className="text-xs text-gray-400">{employee.email || ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{client.fullName || '—'}</p>
                        <p className="text-xs text-gray-400">{client.email || ''}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                        {inv.currency} {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {inv.submittedForApprovalAt
                          ? new Date(inv.submittedForApprovalAt).toLocaleDateString()
                          : new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[inv.status] || STATUS_STYLES.draft}`}>
                          {STATUS_LABEL[inv.status] || inv.status}
                        </span>
                        {inv.approvalNotes && inv.status === 'rejected' && (
                          <p className="text-[10px] text-rose-500 mt-1 max-w-[160px] truncate">{inv.approvalNotes}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {inv.status === 'pending_approval' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedInvoice(inv); setActionType('approve'); setApprovalNote(''); }}
                              className="px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelectedInvoice(inv); setActionType('reject'); setRejectReason(''); }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {inv.status === 'issued' && (
                          <span className="text-xs text-gray-400">
                            Approved {inv.approvedAt ? new Date(inv.approvedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action modal */}
      {selectedInvoice && actionType && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {actionType === 'approve' ? 'Approve Invoice' : 'Reject Invoice'}
              </h3>
              <button onClick={() => { setSelectedInvoice(null); setActionType(null); }} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="material-icons-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</p>
              <p className="text-sm text-gray-500">{selectedInvoice.currency} {Number(selectedInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              {selectedInvoice.description && <p className="text-xs text-gray-400">{selectedInvoice.description}</p>}
            </div>

            {/* Line items preview */}
            {selectedInvoice.lineItems?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</p>
                <div className="space-y-1">
                  {selectedInvoice.lineItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.description} × {item.quantity}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{Number(item.total || item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actionType === 'approve' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Approval Note (optional)</label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                  placeholder="Note for the employee…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>
            )}

            {actionType === 'reject' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this invoice is rejected…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setSelectedInvoice(null); setActionType(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              {actionType === 'approve' ? (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Approving…' : 'Approve & Issue'}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Rejecting…' : 'Reject Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
