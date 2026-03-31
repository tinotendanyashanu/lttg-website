'use client';

import { useState, useTransition } from 'react';
import { createAdminQuotation, type QuotationLineItem } from '@/lib/actions/admin-quotations';

interface Client {
  _id: string;
  fullName: string;
  email: string;
}

interface Props {
  clients: Client[];
}

const EMPTY_LINE_ITEM: QuotationLineItem = { description: '', quantity: 1, unitPrice: 0, total: 0 };

export default function CreateQuotationModal({ clients }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([{ ...EMPTY_LINE_ITEM }]);

  const total = lineItems.reduce((s, i) => s + i.total, 0);

  function updateLineItem(index: number, field: keyof QuotationLineItem, value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value } as QuotationLineItem;
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
    setStatus('sent');
    setDescription('');
    setMessage('');
    setNotes('');
    setCurrency('USD');
    setValidUntil('');
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
        const result = await createAdminQuotation({
          clientId,
          status,
          description: description || undefined,
          lineItems,
          currency,
          message: message || undefined,
          notes: notes || undefined,
          validUntil: validUntil || undefined,
        });
        if (result.success) {
          setSuccess(
            `Quotation ${result.quotationNumber} created.${status === 'sent' ? ' Email sent to client.' : ' Saved as draft.'}`,
          );
          setTimeout(handleClose, 2000);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create quotation.');
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
        New Quotation
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-md p-0 sm:p-4 md:p-8">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-b-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl my-0 sm:my-8 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-[18px]">request_quote</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Quotation</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
              >
                <span className="material-icons-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 md:px-10 md:py-8 space-y-8 md:space-y-10">
              {/* Client + Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Client *
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
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
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="sent">Send now (email client)</option>
                    <option value="draft">Save as draft</option>
                  </select>
                </div>
              </div>

              {/* Currency + Valid Until */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZAR">ZAR</option>
                    <option value="PLN">PLN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Valid Until (optional)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this quotation…"
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              {/* Message to client */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Personal Message to Client (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a personalised message that will appear in the quotation email…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Line Items *
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span className="material-icons-outlined text-[14px]">add</span> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right px-2">Total</div>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center px-4 py-3 bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                          <div className="col-span-6">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Service / item description"
                              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5 text-sm text-center text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="col-span-2 font-mono">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5 text-sm text-right text-gray-900 dark:text-white focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div className="col-span-2 text-right text-sm font-bold text-gray-900 dark:text-white tabular-nums px-2">
                            {item.total.toFixed(2)}
                          </div>
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="absolute -right-2 -top-2 md:opacity-0 md:group-hover:opacity-100 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
                            >
                              <span className="material-icons-outlined text-[14px]">close</span>
                            </button>
                          )}
                        </div>

                        {/* Mobile layout */}
                        <div className="md:hidden space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                placeholder="Service description"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2 text-sm"
                              />
                            </div>
                            {lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(index)}
                                className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                              >
                                <span className="material-icons-outlined text-[20px]">delete</span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2 text-sm text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2 text-sm text-right"
                              />
                            </div>
                            <div className="text-right flex flex-col justify-end pb-2">
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total</label>
                              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                {item.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-5 py-4 bg-gray-900 dark:bg-black rounded-2xl text-white shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Amount</span>
                    <span className="text-xl font-black tabular-nums">
                      <span className="text-xs font-medium text-gray-500 mr-2">{currency}</span>
                      {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Terms, conditions, or any additional notes…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                />
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {status === 'draft'
                  ? 'Draft: Quotation saved but NOT emailed to client.'
                  : 'Quotation will be emailed to the client. They can accept or reject it from their portal, and accepting will auto-generate an invoice.'}
              </p>

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
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors shadow-sm"
                >
                  {isPending ? (
                    <>
                      <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                      Creating…
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-[16px]">send</span>
                      {status === 'sent' ? 'Send Quotation' : 'Save Draft'}
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
