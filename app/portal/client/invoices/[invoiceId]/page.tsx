import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import DownloadPDFButton from '@/components/portal/DownloadPDFButton';

const COMPANY = {
  name: 'LeoTheTechGuy',
  email: 'contact@leothetechguy.com',
  address: 'Warsaw, Poland',
  website: 'leothetechguy.com',
  logo: 'https://leothetechguy.com/logo_transparent.png',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft:          { bg: 'bg-gray-100 dark:bg-gray-800',          text: 'text-gray-500 dark:text-gray-400',       label: 'Draft' },
  issued:         { bg: 'bg-blue-50 dark:bg-blue-900/20',        text: 'text-blue-700 dark:text-blue-400',       label: 'Issued' },
  sent:           { bg: 'bg-sky-50 dark:bg-sky-900/20',          text: 'text-sky-700 dark:text-sky-400',         label: 'Sent' },
  paid:           { bg: 'bg-emerald-50 dark:bg-emerald-900/20',  text: 'text-emerald-700 dark:text-emerald-400', label: 'Paid' },
  partially_paid: { bg: 'bg-amber-50 dark:bg-amber-900/20',      text: 'text-amber-700 dark:text-amber-400',     label: 'Partially Paid' },
  overdue:        { bg: 'bg-red-50 dark:bg-red-900/20',          text: 'text-red-700 dark:text-red-400',         label: 'Overdue' },
  cancelled:      { bg: 'bg-gray-50 dark:bg-gray-900/20',        text: 'text-gray-400 dark:text-gray-500',       label: 'Cancelled' },
};

async function getInvoiceWithClient(clientId: string, invoiceId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const { Account } = await import('@/models/Account');

    const [inv, account] = await Promise.all([
      ClientInvoice.findOne({ _id: invoiceId, clientId }).lean(),
      Account.findById(clientId, 'fullName email clientProfile').lean(),
    ]);

    return inv
      ? {
          invoice: JSON.parse(JSON.stringify(inv)),
          account: account ? JSON.parse(JSON.stringify(account)) : null,
        }
      : null;
  } catch (_) {
    return null;
  }
}

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { invoiceId } = await params;
  const { payment } = await searchParams;
  const paymentJustCompleted = payment === 'success';
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getInvoiceWithClient(session.user.id, invoiceId);
  if (!data) notFound();

  const { invoice: inv, account } = data;
  const currency = inv.currency || 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);

  const isPending = ['issued', 'sent', 'overdue', 'partially_paid'].includes(inv.status);
  const amountPaid = inv.amountPaid ?? 0;
  const depositPaid = inv.depositPaid ?? 0;
  const remainingBalance = inv.remainingBalance ?? (inv.amount - amountPaid - depositPaid);
  const status = STATUS_STYLES[inv.status] ?? STATUS_STYLES['issued'];

  const issuedLabel = inv.issuedAt
    ? new Date(inv.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const dueLabel = inv.dueAt
    ? new Date(inv.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const paidLabel = inv.paidAt
    ? new Date(inv.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <>
      {/* Print styles — hide everything except #invoice-document */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-document, #invoice-document * { visibility: visible !important; }
          #invoice-document { position: fixed; top: 0; left: 0; width: 100%; }
          @page { margin: 20mm; }
        }
      `}</style>

      <div className="space-y-5 max-w-3xl print:hidden">
        <Link
          href="/portal/client/invoices"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">arrow_back</span>
          Back to Invoices
        </Link>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between max-w-3xl mt-4 mb-5 print:hidden">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
          <p className="text-sm text-gray-400 mt-0.5">{inv.description || 'Invoice'}</p>
        </div>
        <div className="flex items-center gap-3">
          {inv.pdfUrl && (
            <a
              href={inv.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-icons-outlined text-[16px]">download</span>
              Attached PDF
            </a>
          )}
          <Link
            href={`/portal/client/invoices/${inv._id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons-outlined text-[16px]">print</span>
            Print / PDF
          </Link>
          <DownloadPDFButton invoiceNumber={inv.invoiceNumber} />
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div id="invoice-document" className="max-w-3xl">
        <div className="bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* Header band */}
          <div className="bg-gray-900 dark:bg-[#111113] px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={COMPANY.logo} alt={COMPANY.name} className="h-9 w-auto brightness-0 invert" />
              <div>
                <p className="text-white font-bold text-base leading-tight">{COMPANY.name}</p>
                <p className="text-gray-400 text-xs">{COMPANY.website}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-2xl tracking-wide">INVOICE</p>
              <p className="text-gray-400 text-sm font-mono mt-0.5">{inv.invoiceNumber}</p>
            </div>
          </div>

          <div className="px-8 py-7 space-y-7">

            {/* Status + dates row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Date</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{issuedLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                  <p className={`text-sm font-semibold mt-0.5 ${inv.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {dueLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{COMPANY.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{COMPANY.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{COMPANY.address}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{account?.fullName || '—'}</p>
                {account?.clientProfile?.companyName && (
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{account.clientProfile.companyName}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{account?.email || '—'}</p>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">Qty</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">Rate</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {inv.lineItems && inv.lineItems.length > 0 ? (
                    inv.lineItems.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-5 py-3.5 text-gray-700 dark:text-gray-200 font-medium">{item.description}</td>
                        <td className="px-5 py-3.5 text-center text-gray-500 dark:text-gray-400 tabular-nums">{item.quantity ?? 1}</td>
                        <td className="px-5 py-3.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">{fmt(item.unitPrice ?? item.rate ?? 0)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900 dark:text-white tabular-nums">{fmt(item.total ?? item.amount ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-gray-400 text-sm">No line items.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total row */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/30 px-5 py-4 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount Due</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{fmt(inv.amount ?? 0)}</p>
              </div>
            </div>

            {/* Payment Progress (partially paid) */}
            {inv.status === 'partially_paid' && (amountPaid > 0 || depositPaid > 0) && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 print:hidden">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3">Payment Progress</p>
                <div className="grid grid-cols-4 gap-4 mb-3 text-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{fmt(inv.amount)}</p>
                  </div>
                  {depositPaid > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Deposit</p>
                      <p className="text-sm font-bold text-blue-600 tabular-nums">{fmt(depositPaid)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Paid</p>
                    <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmt(amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Remaining</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums">{fmt(remainingBalance)}</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((depositPaid + amountPaid) / inv.amount) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Payment History */}
            {inv.paymentHistory?.length > 0 && (
              <div className="print:hidden">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Payment History</p>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {inv.paymentHistory.map((p: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(p.recordedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">{p.method}</td>
                          <td className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600 tabular-nums">{fmt(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {inv.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{inv.notes}</p>
              </div>
            )}

            {/* Paid badge */}
            {inv.status === 'paid' && paidLabel && (
              <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
                <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400 text-[20px]">check_circle</span>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Payment received on {paidLabel}
                </p>
              </div>
            )}

            {/* Footer line */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-400">Thank you for your business.</p>
              <p className="text-xs text-gray-400 font-mono">{inv.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Payment success banner */}
        {paymentJustCompleted && (
          <div className="mt-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3 print:hidden">
            <span className="material-icons-outlined text-emerald-500 text-[20px]">check_circle</span>
            <div>
              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">Payment received — thank you!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Your invoice will be updated shortly once the payment is confirmed.</p>
            </div>
          </div>
        )}

        {/* Payment required alert — outside document for print hiding */}
        {isPending && !paymentJustCompleted && (
          <div className="mt-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-orange-500 text-[20px]">payment</span>
              <div>
                <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
                  {inv.status === 'partially_paid'
                    ? `Remaining balance: ${fmt(remainingBalance)}`
                    : 'Payment required for this invoice.'}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">Pay securely online or contact our team.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/portal/client/messages"
                className="inline-flex items-center gap-1.5 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <span className="material-icons-outlined text-[14px]">chat</span>
                Contact Team
              </Link>
              <Link
                href={`/portal/client/invoices/${inv._id}/pay`}
                className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                <span className="material-icons-outlined text-[14px]">credit_card</span>
                Pay Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
