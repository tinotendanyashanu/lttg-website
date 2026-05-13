'use client';

import { useState, useTransition } from 'react';
import ClientCombobox from '@/components/ClientCombobox';
import { createAdminInvoice, type LineItem } from '@/lib/actions/admin-invoices';

interface Client {
  _id: string;
  fullName: string;
  email: string;
}

interface Props {
  clients: Client[];
}

const EMPTY_LINE_ITEM: LineItem = { description: '', quantity: 1, unitPrice: 0, total: 0 };

export default function CreateInvoiceModal({ clients }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'draft' | 'issued' | 'sent'>('issued');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [dueAt, setDueAt] = useState('');
  const [depositPaid, setDepositPaid] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...EMPTY_LINE_ITEM }]);

  const total = lineItems.reduce((s, i) => s + i.total, 0);

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value } as LineItem;
      if (field === 'quantity' || field === 'unitPrice') {
        item.total = Number(item.quantity) * Number(item.unitPrice);
      }
      updated[index] = item;
      return updated;
    });
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { ...EMPTY_LINE_ITEM }]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setClientId('');
    setStatus('issued');
    setDescription('');
    setNotes('');
    setCurrency('USD');
    setIssuedAt(new Date().toISOString().slice(0, 10));
    setDueAt('');
    setDepositPaid('');
    setLineItems([{ ...EMPTY_LINE_ITEM }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientId) return setError('Please select a client.');
    if (lineItems.length === 0) return setError('Add at least one line item.');
    for (const item of lineItems) {
      if (!item.description.trim()) return setError('All line items must have a description.');
      if (item.quantity <= 0) return setError('Quantity must be greater than 0.');
      if (item.unitPrice < 0) return setError('Unit price cannot be negative.');
    }

    startTransition(async () => {
      try {
        const result = await createAdminInvoice({
          clientId,
          status,
          description: description || undefined,
          lineItems,
          currency,
          issuedAt: issuedAt || undefined,
          dueAt: dueAt || undefined,
          notes: notes || undefined,
          depositPaid: depositPaid ? parseFloat(depositPaid) : undefined,
        });
        if (result.success) {
          setSuccess(`Invoice ${result.invoiceNumber} created successfully.${status !== 'draft' ? ' Email sent to client.' : ''}`);
          setTimeout(handleClose, 2000);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create invoice.');
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
        New Invoice
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-[18px]">receipt_long</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Invoice</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors">
                <span className="material-icons-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Client + Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Client *</label>
                  <ClientCombobox clients={clients} value={clientId} onChange={setClientId} placeholder="Select a client..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="draft">Draft (no email)</option>
                    <option value="issued">Issued (send email)</option>
                    <option value="sent">Sent (send email)</option>
                  </select>
                </div>
              </div>

              {/* Dates + Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZAR">ZAR</option>
                    <option value="PLN">PLN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Issue Date</label>
                  <input
                    type="date"
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the invoice…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Line Items *</label>
                  <button type="button" onClick={addLineItem} className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
                    <span className="material-icons-outlined text-[14px]">add</span> Add Item
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 bg-gray-50 dark:bg-gray-800/30 px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-1" />
                  </div>

                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Service / item"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
                        />
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                        {item.total.toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {lineItems.length > 1 && (
                          <button type="button" onClick={() => removeLineItem(index)} className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors p-0.5">
                            <span className="material-icons-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-3 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="col-span-9 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total</div>
                    <div className="col-span-2 text-right text-sm font-extrabold text-gray-900 dark:text-white tabular-nums">
                      {currency} {total.toFixed(2)}
                    </div>
                    <div className="col-span-1" />
                  </div>
                </div>
              </div>

              {/* Deposit Paid (optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Deposit Paid (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Deposit already paid by client. Will be deducted from amount due.</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Payment instructions, bank details, or any notes…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />
              </div>

              {/* Status hint */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {status === 'draft'
                  ? 'Draft: Invoice saved but NOT emailed to client.'
                  : 'Invoice will be emailed to the client immediately upon creation.'}
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
                      Create Invoice
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
