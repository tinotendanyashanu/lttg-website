import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  expired: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
};

const STATUS_LABELS: Record<string, string> = {
  sent: 'Awaiting Response',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

async function getQuotations(clientId: string) {
  try {
    await dbConnect();
    const { Quotation } = await import('@/models/Quotation');
    const quotations = await Quotation.find({ clientId, status: { $ne: 'draft' } })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(quotations));
  } catch (_) {
    return [];
  }
}

export default async function ClientQuotationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const quotations = await getQuotations(session.user.id);
  const pending = quotations.filter((q: any) => q.status === 'sent');

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-icons-outlined text-violet-500">request_quote</span>
          <div>
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-400">
              {pending.length} quotation{pending.length !== 1 ? 's' : ''} awaiting your response
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-500 mt-0.5">
              Review and accept or decline to proceed.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {quotations.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              request_quote
            </span>
            <p className="text-gray-500 dark:text-gray-400">No quotations yet</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {quotations.map((q: any) => (
                <Link
                  key={q._id}
                  href={`/portal/client/quotations/${q._id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-violet-500 dark:text-violet-400 text-[18px]">
                      request_quote
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {q.description || q.quotationNumber}
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          STATUS_STYLES[q.status] || STATUS_STYLES.sent
                        }`}
                      >
                        {STATUS_LABELS[q.status] || q.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono">{q.quotationNumber}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {q.currency} {(q.amount || 0).toLocaleString()}
                      </span>
                      {q.validUntil && (
                        <>
                          <span>·</span>
                          <span>Valid until {new Date(q.validUntil).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-[18px] shrink-0">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Quotation #', 'Description', 'Amount', 'Status', 'Valid Until', ''].map((h) => (
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
                  {quotations.map((q: any) => (
                    <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{q.quotationNumber}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {q.description || '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {q.currency} {(q.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            STATUS_STYLES[q.status] || STATUS_STYLES.sent
                          }`}
                        >
                          {STATUS_LABELS[q.status] || q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/portal/client/quotations/${q._id}`}
                          className="text-violet-600 dark:text-violet-400 hover:underline text-xs font-medium"
                        >
                          {q.status === 'sent' ? 'Review' : 'View'}
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
