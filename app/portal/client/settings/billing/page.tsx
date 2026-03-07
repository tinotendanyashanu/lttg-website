import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { SettingsNav } from '@/components/portal/client/SettingsNav';

async function getBillingSummary(clientId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const [outstanding, paid] = await Promise.all([
      ClientInvoice.find({ clientId, status: { $in: ['issued', 'sent', 'overdue'] } })
        .select('amount currency invoiceNumber status dueAt')
        .lean(),
      ClientInvoice.countDocuments({ clientId, status: 'paid' }),
    ]);
    return {
      outstanding: JSON.parse(JSON.stringify(outstanding)),
      paidCount: paid,
    };
  } catch (_) {
    return { outstanding: [], paidCount: 0 };
  }
}

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const billing = await getBillingSummary(session.user.id);
  const totalDue = billing.outstanding.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <SettingsNav current="/portal/client/settings/billing" />

      {/* Balance summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
          <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
            ${totalDue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{billing.outstanding.length} invoice(s)</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {billing.paidCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">invoice(s)</p>
        </div>
      </div>

      {billing.outstanding.length > 0 && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h3>
            <Link
              href="/portal/client/invoices"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {billing.outstanding.map((inv: any) => (
              <div key={inv._id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {inv.invoiceNumber || inv._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Due {inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {inv.currency || '$'}{(inv.amount || 0).toLocaleString()}
                  </p>
                  <span className={`text-[11px] font-bold uppercase ${inv.status === 'overdue' ? 'text-red-500' : 'text-orange-500'}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Enquiries</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          To arrange payment or discuss billing, contact our team directly.
        </p>
        <Link
          href="/portal/client/messages"
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          <span className="material-icons-outlined text-[14px]">chat</span>
          Message Team
        </Link>
      </div>
    </div>
  );
}
