import dbConnect from '@/lib/mongodb';
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

  return {
    contracts,
    accountMap,
    totalActive: contracts.filter((c: any) => c.status === 'active').length,
    pendingSign: contracts.filter((c: any) => ['sent', 'under_review'].includes(c.status)).length,
    signedCount: contracts.filter((c: any) => c.status === 'signed').length,
    draftCount:  contracts.filter((c: any) => c.status === 'draft').length,
  };
}

async function getClients() {
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find(
    { roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } },
    'fullName email',
  ).sort({ fullName: 1 }).lean();
  return clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));
}

export default async function AdminContractsPage() {
  const [{ contracts, accountMap, totalActive, pendingSign, signedCount, draftCount }, clients] =
    await Promise.all([getContracts(), getClients()]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contracts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create, send, and track all client contracts.
          </p>
        </div>
        <CreateContractModal clients={clients} />
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 dark:border-gray-800 -mt-2">
        <Link
          href="/admin/contracts"
          className="px-4 py-2.5 text-sm font-semibold text-brand-primary border-b-2 border-brand-primary -mb-px"
        >
          All Contracts
        </Link>
        <Link
          href="/admin/contracts/templates"
          className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200 -mb-px transition-colors"
        >
          Templates
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active',            value: totalActive, color: 'text-green-600 dark:text-green-400' },
          { label: 'Pending Signature', value: pendingSign, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Signed',            value: signedCount, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Drafts',            value: draftCount,  color: 'text-gray-500 dark:text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft px-5 py-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-900 dark:text-white">All Contracts</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['Contract #', 'Client', 'Title', 'Type', 'Status', 'Signed', 'Expiry', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-[40px] block mb-3">description</span>
                    <p className="text-sm text-gray-400 dark:text-gray-600">No contracts yet.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Click &ldquo;New Contract&rdquo; to get started.</p>
                  </td>
                </tr>
              ) : (
                contracts.map((c: any) => {
                  const client = accountMap[String(c.clientId)];
                  return (
                    <tr key={String(c._id)} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold whitespace-nowrap">
                        {c.contractNumber}
                      </td>
                      <td className="px-6 py-3.5 min-w-[140px]">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{client?.fullName || 'Unknown'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{client?.email || ''}</p>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-700 dark:text-gray-300 max-w-[180px]">
                        <span className="line-clamp-1">{c.title}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {c.type || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[c.status] ?? STATUS_STYLES['draft']}`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {c.signedAt ? new Date(c.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {c.endDate ? new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/contracts/${String(c._id)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:opacity-70 transition-opacity"
                        >
                          View
                          <span className="material-icons-outlined text-[13px]">arrow_forward</span>
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
