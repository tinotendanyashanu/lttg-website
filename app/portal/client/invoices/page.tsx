import { auth } from '@/auth';
import { redirect } from 'next/navigation';
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

async function getInvoices(clientId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const invoices = await ClientInvoice.find({ clientId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(invoices));
  } catch (_) {
    return [];
  }
}

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const invoices = await getInvoices(session.user.id);
  const unpaid = invoices.filter((i: any) => ['issued', 'sent', 'overdue'].includes(i.status));
  const totalOutstanding = unpaid.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      {totalOutstanding > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-icons-outlined text-orange-500">warning_amber</span>
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">
              Outstanding Balance: ${totalOutstanding.toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
              {unpaid.length} invoice{unpaid.length !== 1 ? 's' : ''} awaiting payment
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              receipt_long
            </span>
            <p className="text-gray-500 dark:text-gray-400">No invoices yet</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map((inv: any) => (
                <Link
                  key={inv._id}
                  href={`/portal/client/invoices/${inv._id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-orange-500 dark:text-orange-400 text-[18px]">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {inv.title || inv.description || 'Services'}
                      </span>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[inv.status] || STATUS_STYLES.issued}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono">{inv.invoiceNumber || inv._id.slice(-6).toUpperCase()}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {inv.currency || '$'}{(inv.amount || 0).toLocaleString()}
                      </span>
                      {inv.dueAt && (
                        <>
                          <span>·</span>
                          <span>Due {new Date(inv.dueAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-[18px] shrink-0">chevron_right</span>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Invoice #', 'Description', 'Amount', 'Status', 'Due Date', ''].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {invoices.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {inv.invoiceNumber || inv._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {inv.title || inv.description || 'Services'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {inv.currency || '$'}{(inv.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            STATUS_STYLES[inv.status] || STATUS_STYLES.issued
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/portal/client/invoices/${inv._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
