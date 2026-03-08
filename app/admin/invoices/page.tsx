import dbConnect from '@/lib/mongodb';
import { ClientInvoice } from '@/models/ClientInvoice';
import { Account } from '@/models/Account';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CreateInvoiceModal from '@/components/admin/CreateInvoiceModal';
import Link from 'next/link';

export const metadata = { title: 'Invoices | Admin' };
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  issued:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  sent:      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/40',
  paid:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  overdue:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

async function getInvoices() {
  await dbConnect();
  const invoices = await ClientInvoice.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const clientIds = [...new Set(invoices.map((inv: any) => String(inv.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: acc.fullName, email: acc.email };
  }

  const totalPaid = invoices
    .filter((i: any) => i.status === 'paid')
    .reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalOutstanding = invoices
    .filter((i: any) => ['issued', 'sent', 'overdue'].includes(i.status))
    .reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const overdueCount = invoices.filter((i: any) => i.status === 'overdue').length;
  const draftCount = invoices.filter((i: any) => i.status === 'draft').length;

  return { invoices, accountMap, totalPaid, totalOutstanding, overdueCount, draftCount };
}

async function getClients() {
  await dbConnect();
  const clients = await Account.find({ roles: 'client', isActive: true }, 'fullName email').sort({ fullName: 1 }).lean();
  return clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default async function AdminInvoicesPage() {
  const [{ invoices, accountMap, totalPaid, totalOutstanding, overdueCount, draftCount }, clients] =
    await Promise.all([getInvoices(), getClients()]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="receipt_long"
        title="Client Invoices"
        description="Create, send, and manage all client invoices. Invoices appear instantly in the client portal."
        action={<CreateInvoiceModal clients={clients} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Total Collected</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{fmt.format(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Outstanding</p>
          <p className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">{fmt.format(totalOutstanding)}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Overdue</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{overdueCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Drafts</p>
          <p className="text-2xl font-extrabold text-gray-500 dark:text-gray-400">{draftCount}</p>
        </div>
      </div>

      {/* Invoices table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">All Invoices</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Issued</th>
                <th className="px-6 py-3">Due</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                    No invoices yet. Click "New Invoice" to create one.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => {
                  const client = accountMap[String(inv.clientId)];
                  return (
                    <tr key={String(inv._id)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-xs">
                          {client?.fullName || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-gray-400">{client?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white tabular-nums text-xs">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: inv.currency || 'USD',
                        }).format(inv.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${STATUS_STYLES[inv.status] ?? STATUS_STYLES['draft']}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {inv.dueAt ? (
                          <span className={inv.status === 'overdue' ? 'text-red-500 dark:text-red-400 font-semibold' : ''}>
                            {new Date(inv.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/invoices/${String(inv._id)}`}
                          className="text-xs font-semibold text-brand-primary hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
