import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
  open: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  waiting_client: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  escalated: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  resolved: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  urgent: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

async function getTickets(clientId: string) {
  try {
    await dbConnect();
    const { SupportTicket } = await import('@/models/SupportTicket');
    const tickets = await SupportTicket.find({ clientId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(tickets));
  } catch (_) {
    return [];
  }
}

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const tickets = await getTickets(session.user.id);
  const open = tickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {open > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {open} open
            </span>
          )}
        </div>
        <Link
          href="/portal/client/tickets/create"
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors shrink-0"
        >
          <span className="material-icons-outlined text-[14px]">add</span>
          New Ticket
        </Link>
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              support_agent
            </span>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No support tickets yet</p>
            <Link
              href="/portal/client/tickets/create"
              className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Create First Ticket
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {tickets.map((ticket: any) => (
                <Link
                  key={ticket._id}
                  href={`/portal/client/tickets/${ticket._id}`}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-icons-outlined text-purple-600 dark:text-purple-400 text-[18px]">support_agent</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-[11px] text-gray-400">
                        {ticket.ticketId || ticket._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ticket.category?.replace(/_/g, ' ') || 'General'} · {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="material-icons-outlined text-gray-300 dark:text-gray-700 text-[18px] shrink-0 mt-1">chevron_right</span>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {tickets.map((ticket: any) => (
                    <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link
                          href={`/portal/client/tickets/${ticket._id}`}
                          className="font-mono text-xs text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        >
                          {ticket.ticketId || ticket._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/portal/client/tickets/${ticket._id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">
                        {ticket.category?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
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
