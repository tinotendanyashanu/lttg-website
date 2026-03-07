import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  under_review: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  signed: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  active: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  expired: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
  terminated: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

async function getContracts(clientId: string) {
  try {
    await dbConnect();
    const { ClientContract } = await import('@/models/ClientContract');
    const contracts = await ClientContract.find({ clientId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(contracts));
  } catch (_) {
    return [];
  }
}

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const contracts = await getContracts(session.user.id);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {contracts.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              description
            </span>
            <p className="text-gray-500 dark:text-gray-400">No contracts on file</p>
            <p className="text-sm text-gray-400 mt-1">Contracts will appear here once issued by our team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Title', 'Type', 'Status', 'Signed Date', 'Expiry', ''].map((h) => (
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
                {contracts.map((c: any) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">
                      {c.contractType?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          STATUS_STYLES[c.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {c.signedAt ? new Date(c.signedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {c.documentUrl && (
                        <a
                          href={c.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium inline-flex items-center gap-0.5"
                        >
                          View <span className="material-icons-outlined text-[12px]">open_in_new</span>
                        </a>
                      )}
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
