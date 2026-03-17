import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import InvoiceActionPanel from './InvoiceActionPanel';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  draft:           'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  issued:          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  sent:            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/40',
  paid:            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  partially_paid:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  overdue:         'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  cancelled:       'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

async function getInvoiceData(invoiceId: string) {
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoice = await ClientInvoice.findById(invoiceId).lean();
  if (!invoice) return null;

  const client = await Account.findById((invoice as any).clientId, 'fullName email phoneNumber clientProfile').lean();
  return {
    invoice: JSON.parse(JSON.stringify(invoice)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const data = await getInvoiceData(invoiceId);
  if (!data) notFound();

  const { invoice, client } = data;
  const currency = invoice.currency || 'USD';
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">arrow_back</span>
          All Invoices
        </Link>
        <Link
          href={`/admin/invoices/${invoiceId}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">print</span>
          Print / PDF
        </Link>
      </div>

      <AdminPageBanner
        icon="receipt_long"
        title={`Invoice ${invoice.invoiceNumber}`}
        description={`Issued to ${client?.fullName || 'Unknown'} · ${currency} ${fmt(invoice.amount)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main invoice content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Invoice Header Info */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
            {/* Branding band */}
            <div className="bg-gray-900 dark:bg-[#111113] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://leothetechguy.com/logo_transparent.png"
                  alt="LeoTheTechGuy"
                  className="h-7 w-auto brightness-0 invert"
                />
                <div>
                  <p className="text-white font-bold text-sm leading-tight">LeoTheTechGuy</p>
                  <p className="text-gray-500 text-[10px]">contact@leothetechguy.com</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-lg tracking-wider">INVOICE</p>
                <p className="text-gray-400 text-xs font-mono">{invoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm text-gray-400 mt-0.5">{invoice.description || 'No description'}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold capitalize border ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES['draft']}`}>
                  {invoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Client', value: client?.fullName || 'Unknown' },
                  { label: 'Email', value: client?.email || '—' },
                  {
                    label: 'Issue Date',
                    value: invoice.issuedAt
                      ? new Date(invoice.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—',
                  },
                  {
                    label: 'Due Date',
                    value: invoice.dueAt
                      ? new Date(invoice.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {invoice.paidAt && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="material-icons-outlined text-[14px]">check_circle</span>
                    Paid on {new Date(invoice.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Line Items</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {invoice.lineItems?.length > 0 ? (
                  invoice.lineItems.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{item.description}</td>
                      <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">{item.quantity}</td>
                      <td className="px-6 py-3 text-right text-gray-500 dark:text-gray-400 tabular-nums">{fmt(item.unitPrice)}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{fmt(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No line items.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider">
                    Total Amount Due
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-gray-900 dark:text-white text-base tabular-nums">
                    {fmt(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Progress */}
          {(invoice.amountPaid > 0 || invoice.status === 'partially_paid') && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Payment Progress</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{fmt(invoice.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid</p>
                  <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmt(invoice.amountPaid ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                  <p className="text-sm font-bold text-amber-600 tabular-nums">{fmt(invoice.remainingBalance ?? invoice.amount - (invoice.amountPaid ?? 0))}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((invoice.amountPaid ?? 0) / invoice.amount) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoice.paymentHistory?.length > 0 && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Payment History</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Method</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {invoice.paymentHistory.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(p.recordedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-3 text-gray-700 dark:text-gray-200">{p.method}</td>
                      <td className="px-6 py-3 text-right font-semibold text-emerald-600 tabular-nums">{fmt(p.amount)}</td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Client Portal Link */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Client Invoice View</p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-0.5">See the designed invoice + PDF download as the client sees it</p>
            </div>
            <a
              href={`/portal/client/invoices/${invoiceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
            >
              Open Client View
              <span className="material-icons-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <InvoiceActionPanel
            invoiceId={invoiceId}
            currentStatus={invoice.status}
            invoiceNumber={invoice.invoiceNumber}
            currency={currency}
            remainingBalance={invoice.remainingBalance ?? invoice.amount - (invoice.amountPaid ?? 0)}
          />

          {/* Client Info Card */}
          {client && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                  {(client.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.fullName}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </div>
              </div>
              {client.clientProfile?.companyName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Company:</span> {client.clientProfile.companyName}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                <Link
                  href={`/admin/clients`}
                  className="block text-xs font-semibold text-brand-primary hover:underline"
                >
                  View Client Profile
                </Link>
                <Link
                  href={`/admin/invoices?client=${client._id}`}
                  className="block text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:underline"
                >
                  All Invoices for this Client
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
