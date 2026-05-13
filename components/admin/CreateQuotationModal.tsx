'use client';

import { useState, useTransition } from 'react';
import ClientCombobox from '@/components/ClientCombobox';
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
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Recipient type
  const [recipientType, setRecipientType] = useState<'client' | 'prospect'>('client');

  // Client fields
  const [clientId, setClientId] = useState('');

  // Prospect fields
  const [prospectName, setProspectName] = useState('');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectPhone, setProspectPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'whatsapp' | 'both'>('email');

  // Shared fields
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
    setWhatsappLink(null);
    setRecipientType('client');
    setClientId('');
    setProspectName('');
    setProspectEmail('');
    setProspectPhone('');
    setDeliveryMethod('email');
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
    setWhatsappLink(null);

    if (recipientType === 'client' && !clientId) return setError('Please select a client.');
    if (recipientType === 'prospect') {
      if (!prospectName.trim()) return setError('Prospect name is required.');
      if (!prospectEmail.trim() && !prospectPhone.trim())
        return setError('Provide at least an email or phone number for the prospect.');
      if ((deliveryMethod === 'email' || deliveryMethod === 'both') && !prospectEmail.trim())
        return setError('An email address is required for email delivery.');
      if ((deliveryMethod === 'whatsapp' || deliveryMethod === 'both') && !prospectPhone.trim())
        return setError('A phone number is required for WhatsApp delivery.');
    }
    if (lineItems.length === 0) return setError('Add at least one line item.');
    for (const item of lineItems) {
      if (!item.description.trim()) return setError('All line items must have a description.');
      if (item.quantity <= 0) return setError('Quantity must be greater than 0.');
      if (item.unitPrice < 0) return setError('Unit price cannot be negative.');
    }

    startTransition(async () => {
      try {
        const result = await createAdminQuotation({
          clientId: recipientType === 'client' ? clientId : undefined,
          prospectName: recipientType === 'prospect' ? prospectName : undefined,
          prospectEmail: recipientType === 'prospect' ? prospectEmail || undefined : undefined,
          prospectPhone: recipientType === 'prospect' ? prospectPhone || undefined : undefined,
          deliveryMethod: recipientType === 'prospect' ? deliveryMethod : 'email',
          status,
          description: description || undefined,
          lineItems,
          currency,
          message: message || undefined,
          notes: notes || undefined,
          validUntil: validUntil || undefined,
        });
        if (result.success) {
          const sentLabel =
            status === 'sent'
              ? recipientType === 'prospect'
                ? deliveryMethod === 'both'
                  ? ' Email sent.'
                  : deliveryMethod === 'email'
                    ? ' Email sent.'
                    : ''
                : ' Email sent to client.'
              : '';
          setSuccess(`Quotation ${result.quotationNumber} created.${sentLabel}${status === 'draft' ? ' Saved as draft.' : ''}`);
          if (result.whatsappLink) setWhatsappLink(result.whatsappLink);
          if (!result.whatsappLink) setTimeout(handleClose, 2500);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create quotation.');
      }
    });
  }

  const showDeliveryMethod = recipientType === 'prospect' && status === 'sent';

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

              {/* Recipient type toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Send to
                </label>
                <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRecipientType('client')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      recipientType === 'client'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white dark:bg-[#27272a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('prospect')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      recipientType === 'prospect'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white dark:bg-[#27272a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    New Prospect
                  </button>
                </div>
              </div>

              {/* Recipient fields + Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {recipientType === 'client' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Client *
                    </label>
                    <ClientCombobox
                      clients={clients}
                      value={clientId}
                      onChange={setClientId}
                      placeholder="Select a client..."
                      accentClassName="text-violet-600"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Prospect Name *
                      </label>
                      <input
                        type="text"
                        value={prospectName}
                        onChange={(e) => setProspectName(e.target.value)}
                        placeholder="Full name or company…"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={prospectEmail}
                        onChange={(e) => setProspectEmail(e.target.value)}
                        placeholder="prospect@example.com"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={prospectPhone}
                        onChange={(e) => setProspectPhone(e.target.value)}
                        placeholder="+27 71 234 5678"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    >
                      <option value="sent">Send now</option>
                      <option value="draft">Save as draft</option>
                    </select>
                  </div>

                  {showDeliveryMethod && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Delivery Method
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      >
                        <option value="email">Email only</option>
                        <option value="whatsapp">WhatsApp only</option>
                        <option value="both">Email + WhatsApp</option>
                      </select>
                    </div>
                  )}
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

              {/* Message to recipient */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Personal Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a personalised message that will appear in the quotation…"
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
                  ? 'Draft: Quotation saved but NOT sent.'
                  : recipientType === 'prospect'
                    ? deliveryMethod === 'both'
                      ? 'Quotation will be emailed. A WhatsApp link will open for you to send manually.'
                      : deliveryMethod === 'whatsapp'
                        ? 'A WhatsApp link will open for you to send the quotation manually.'
                        : 'Quotation will be emailed to the prospect.'
                    : 'Quotation will be emailed to the client. Accepting it will auto-generate an invoice.'}
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-[16px]">check_circle</span>
                    {success}
                  </div>
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(handleClose, 1000)}
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold rounded-xl px-4 py-2 text-xs transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Send via WhatsApp
                    </a>
                  )}
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
