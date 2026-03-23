import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

async function getPayments(clientId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const paid = await ClientInvoice.find({ clientId, status: 'paid' })
      .sort({ paidAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(paid));
  } catch (_) {
    return [];
  }
}

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const payments = await getPayments(session.user.id);
  const total = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              payments
            </span>
            <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Invoice #', 'Description', 'Amount', 'Date', 'Documents'].map((h) => (
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
                {payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {p.invoiceNumber || p._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {p.title || p.description || 'Services'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      {p.currency || '$'}{(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/portal/client/invoices/${p._id}`}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-medium"
                        >
                          Receipt
                        </Link>
                        <Link
                          href={`/portal/client/invoices/${p._id}/print`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:underline text-xs"
                        >
                          Print
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
