'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  createEmployeeInvoice,
  submitInvoiceForApproval,
  deleteEmployeeInvoice,
  type EmployeeLineItem,
} from '@/lib/actions/employee-invoices';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  issued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  partially_paid: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Awaiting Approval',
  issued: 'Approved & Issued',
  sent: 'Sent to Client',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const EMPTY_ITEM: EmployeeLineItem = { description: '', quantity: 1, unitPrice: 0, total: 0 };

interface Props {
  initialInvoices: any[];
  clientMap: Record<string, any>;
  clients: any[];
  accountId: string;
  accountName: string;
}

export default function EmployeeInvoicesClient({ initialInvoices, clientMap, clients, accountId, accountName }: Props) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Create form state
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [lineItems, setLineItems] = useState<EmployeeLineItem[]>([{ ...EMPTY_ITEM }]);
  const [submitForApproval, setSubmitForApproval] = useState(false);

  const total = useMemo(
    () => lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    [lineItems]
  );

  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'all') return invoices;
    return invoices.filter((inv) => inv.status === filterStatus);
  }, [invoices, filterStatus]);

  const updateItem = (idx: number, field: keyof EmployeeLineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      item.total = item.quantity * item.unitPrice;
      updated[idx] = item;
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Please select a client.'); return; }
    if (lineItems.some(i => !i.description.trim())) { setError('All line items need a description.'); return; }
    setError('');
    setIsSaving(true);

    try {
      const items = lineItems.map((i) => ({
        ...i,
        total: parseFloat((i.quantity * i.unitPrice).toFixed(2)),
      }));
      const res = await createEmployeeInvoice({
        clientId,
        currency,
        description,
        lineItems: items,
        dueAt: dueAt || undefined,
        notes,
        submitForApproval,
      });

      if (res.success) {
        setShowCreate(false);
        setLineItems([{ ...EMPTY_ITEM }]);
        setClientId(''); setDescription(''); setDueAt(''); setNotes('');
        router.refresh();
      } else {
        setError(res.message || 'Failed to create invoice');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForApproval = async (invoiceId: string) => {
    if (!confirm('Submit this invoice for admin approval?')) return;
    const res = await submitInvoiceForApproval(invoiceId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    const res = await deleteEmployeeInvoice(invoiceId);
    if (res.success) {
      setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceId));
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and track invoices for admin approval before they go to clients.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(''); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <span className="material-icons-outlined text-[20px]">add</span>
          New Invoice
        </button>
      </div>

      {/* Approval flow explainer */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-icons-outlined text-amber-500 mt-0.5">info</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Invoice Approval Workflow</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Invoices you create go through admin review before being issued to clients. Draft → Submit for Approval → Admin Reviews → Issued to Client.
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'pending_approval', 'issued', 'rejected', 'paid'].map((s) => (
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
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-16 text-center">
            <span className="material-icons-outlined text-5xl text-gray-300 dark:text-gray-700 block mb-3">receipt_long</span>
            <p className="font-bold text-gray-900 dark:text-white">No invoices yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create your first invoice to get started.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const client = clientMap[inv.clientId];
            return (
              <div key={inv._id} className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="material-icons-outlined text-blue-600 dark:text-blue-400">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {client?.fullName || client?.email || 'Unknown Client'} · {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                    {inv.approvalNotes && inv.status === 'rejected' && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <span className="material-icons-outlined text-[14px]">error_outline</span>
                        {inv.approvalNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-right">
                    <p className="font-black text-lg text-gray-900 dark:text-white">
                      {inv.currency} {Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {inv.dueAt && (
                      <p className="text-[10px] text-gray-400">Due {new Date(inv.dueAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_STYLES[inv.status] || STATUS_STYLES.draft}`}>
                    {STATUS_LABEL[inv.status] || inv.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {inv.status === 'draft' && (
                      <button
                        onClick={() => handleSubmitForApproval(inv._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        Submit for Approval
                      </button>
                    )}
                    {['draft', 'rejected'].includes(inv.status) && (
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                      >
                        <span className="material-icons-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Invoice</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <span className="material-icons-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="material-icons-outlined text-[16px]">error_outline</span>
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Client *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select client…</option>
                    {clients.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.fullName || c.email}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none"
                  >
                    {['USD', 'GBP', 'EUR', 'ZAR', 'NGN'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of services…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Line Items</label>
                  <button
                    type="button"
                    onClick={() => setLineItems((prev) => [...prev, { ...EMPTY_ITEM }])}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <span className="material-icons-outlined text-[16px]">add</span> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-2 items-center">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-center focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        placeholder="Unit Price"
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-right focus:outline-none"
                      />
                      <div className="text-sm font-bold text-right text-gray-900 dark:text-white pr-1">
                        {(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                        >
                          <span className="material-icons-outlined text-[14px]">remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{currency} {total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Notes for admin review…"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setSubmitForApproval((v) => !v)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${submitForApproval ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${submitForApproval ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submit for approval immediately</span>
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? 'Creating…' : submitForApproval ? 'Create & Submit' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
