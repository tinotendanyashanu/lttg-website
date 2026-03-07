import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  issued: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  paid: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  overdue: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

async function getInvoice(clientId: string, invoiceId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const inv = await ClientInvoice.findOne({ _id: invoiceId, clientId }).lean();
    return inv ? JSON.parse(JSON.stringify(inv)) : null;
  } catch (_) {
    return null;
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const inv = await getInvoice(session.user.id, invoiceId);
  if (!inv) notFound();

  const isPending = ['issued', 'sent', 'overdue'].includes(inv.status);

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/portal/client/invoices"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        Back to Invoices
      </Link>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-8">
        {/* Invoice header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Invoice</p>
            <p className="font-mono text-gray-400 text-sm">
              #{inv.invoiceNumber || invoiceId.slice(-8).toUpperCase()}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
              STATUS_STYLES[inv.status] || STATUS_STYLES.issued
            }`}
          >
            {inv.status}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Issued</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Due</p>
            <p className={`text-sm font-medium ${inv.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Line items */}
        {inv.lineItems && inv.lineItems.length > 0 && (
          <div className="mb-8">
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {inv.lineItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.description}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{item.quantity || 1}</td>
                      <td className="px-4 py-3 text-right text-gray-500">${(item.unitPrice || item.rate || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        ${(item.total || item.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-lg font-bold text-gray-900 dark:text-white">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {inv.currency || '$'}{(inv.amount || 0).toLocaleString()}
          </p>
        </div>

        {inv.status === 'paid' && inv.paidAt && (
          <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
            <span className="material-icons-outlined text-[16px]">check_circle</span>
            <p className="text-sm font-medium">Paid on {new Date(inv.paidAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {isPending && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-orange-500">payment</span>
            <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">
              Payment required. Contact our team to arrange payment.
            </p>
          </div>
          <Link
            href="/portal/client/messages"
            className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors shrink-0"
          >
            <span className="material-icons-outlined text-[14px]">chat</span>
            Contact Team
          </Link>
        </div>
      )}

      {inv.pdfUrl && (
        <a
          href={inv.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">picture_as_pdf</span>
          Download PDF
        </a>
      )}
    </div>
  );
}
