import dbConnect from '@/lib/mongodb';
import { ClientInvoice } from '@/models/ClientInvoice';
import { Account } from '@/models/Account';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CreateInvoiceModal from '@/components/admin/CreateInvoiceModal';
import InvoicesTable from '@/components/admin/InvoicesTable';

export const metadata = { title: 'Invoices | Admin' };
export const dynamic = 'force-dynamic';

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
  const draftCount   = invoices.filter((i: any) => i.status === 'draft').length;

  return { invoices, accountMap, totalPaid, totalOutstanding, overdueCount, draftCount };
}

async function getClients() {
  await dbConnect();
  const clients = await Account.find(
    { roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } },
    'fullName email'
  ).sort({ fullName: 1 }).lean();
  return clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default async function AdminInvoicesPage() {
  const [
    { invoices, accountMap, totalPaid, totalOutstanding, overdueCount, draftCount },
    clients,
  ] = await Promise.all([getInvoices(), getClients()]);

  // Serialize for client component
  const serializedInvoices = invoices.map((inv: any) => ({
    _id:           String(inv._id),
    invoiceNumber: inv.invoiceNumber,
    amount:        inv.amount,
    currency:      inv.currency,
    status:        inv.status,
    issuedAt:      inv.issuedAt?.toISOString?.() ?? (inv.issuedAt ? String(inv.issuedAt) : undefined),
    dueAt:         inv.dueAt?.toISOString?.() ?? (inv.dueAt ? String(inv.dueAt) : undefined),
    clientId:      String(inv.clientId),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="receipt_long"
        title="Client Invoices"
        description="Create, send, and manage all client invoices. Invoices appear instantly in the client portal."
        action={
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/export/invoices"
              download
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-icons-outlined text-[18px]">download</span>
              Export CSV
            </a>
            <CreateInvoiceModal clients={clients} />
          </div>
        }
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

      <InvoicesTable invoices={serializedInvoices} accountMap={accountMap} />
    </div>
  );
}
