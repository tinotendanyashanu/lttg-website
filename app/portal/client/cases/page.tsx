import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  reviewing: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  investigating: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  awaiting_client: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  resolved: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-yellow-50 text-yellow-600',
  high: 'bg-orange-50 text-orange-600',
  critical: 'bg-red-50 text-red-600',
};

async function getCases(clientId: string) {
  try {
    await dbConnect();
    const { ClientCase } = await import('@/models/ClientCase');
    const cases = await ClientCase.find({ clientId }).sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(cases));
  } catch (_) {
    return [];
  }
}

export default async function CasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const cases = await getCases(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {cases.length} total case{cases.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {cases.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              folder_shared
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No cases yet</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
              Your cases will appear here once your engagement begins
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Case ID', 'Title', 'Type', 'Status', 'Priority', 'Last Update', 'Assigned Team', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-5 font-semibold text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cases.map((c: any) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-xs text-gray-500">{c.caseNumber}</td>
                    <td className="py-4 px-5 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                      {c.title}
                    </td>
                    <td className="py-4 px-5 text-gray-500 dark:text-gray-400">{c.caseType}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          STATUS_STYLES[c.status] || STATUS_STYLES.submitted
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          PRIORITY_STYLES[c.priority] || PRIORITY_STYLES.medium
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-gray-500 dark:text-gray-400">
                      {c.assignedTeam || '—'}
                    </td>
                    <td className="py-4 px-5">
                      <Link
                        href={`/portal/client/cases/${c._id}`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      >
                        View{' '}
                        <span className="material-icons-outlined text-[14px]">arrow_forward</span>
                      </Link>
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
