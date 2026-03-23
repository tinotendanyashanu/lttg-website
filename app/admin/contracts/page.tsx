import dbConnect from '@/lib/mongodb';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CreateContractModal from '@/components/admin/CreateContractModal';
import Link from 'next/link';

export const metadata = { title: 'Contracts | Admin' };
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  sent:         'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  under_review: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/40',
  signed:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  active:       'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40',
  expired:      'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
  terminated:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
};

async function getContracts() {
  await dbConnect();
  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');

  const contracts = await ClientContract.find().sort({ createdAt: -1 }).limit(200).lean();

  const clientIds = [...new Set(contracts.map((c: any) => String(c.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  const totalActive   = contracts.filter((c: any) => c.status === 'active').length;
  const pendingSign   = contracts.filter((c: any) => ['sent', 'under_review'].includes(c.status)).length;
  const signedCount   = contracts.filter((c: any) => c.status === 'signed').length;
  const draftCount    = contracts.filter((c: any) => c.status === 'draft').length;

  return { contracts, accountMap, totalActive, pendingSign, signedCount, draftCount };
}

async function getClients() {
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find({ roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } }, 'fullName email').sort({ fullName: 1 }).lean();
  return clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));
}

export default async function AdminContractsPage() {
  const [{ contracts, accountMap, totalActive, pendingSign, signedCount, draftCount }, clients] =
    await Promise.all([getContracts(), getClients()]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 text-sm -mb-4">
        <Link href="/admin/contracts" className="px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary font-semibold">
          Contracts
        </Link>
        <Link href="/admin/contracts/templates" className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">
          Templates
        </Link>
      </div>

      <AdminPageBanner
        icon="description"
        title="Client Contracts"
        description="Create, send, and manage all client contracts. Clients can review and sign directly in the portal."
        action={<CreateContractModal clients={clients} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Active</p>
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{totalActive}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Pending Signature</p>
          <p className="text-2xl font-extrabold text-blue-500 dark:text-blue-400">{pendingSign}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Signed</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{signedCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Drafts</p>
          <p className="text-2xl font-extrabold text-gray-500 dark:text-gray-400">{draftCount}</p>
        </div>
      </div>

      {/* Contracts table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">All Contracts</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {contracts.length} contract{contracts.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Contract #</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Signed</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                    No contracts yet. Click &ldquo;New Contract&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                contracts.map((c: any) => {
                  const client = accountMap[String(c.clientId)];
                  return (
                    <tr key={String(c._id)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300 font-semibold">
                        {c.contractNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-xs">
                          {client?.fullName || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-gray-400">{client?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {c.type || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${STATUS_STYLES[c.status] ?? STATUS_STYLES['draft']}`}
                        >
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {c.signedAt
                          ? new Date(c.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {c.endDate
                          ? new Date(c.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/contracts/${String(c._id)}`}
                          className="text-xs font-semibold text-brand-primary hover:underline"
                        >
                          View
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
