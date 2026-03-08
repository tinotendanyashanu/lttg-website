import dbConnect from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';
import { Account } from '@/models/Account';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import Link from 'next/link';

export const metadata = { title: 'Support Tickets | Admin' };
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  open:           'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  in_progress:    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/40',
  waiting_client: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  resolved:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  closed:         'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:    'text-gray-500',
  medium: 'text-blue-600 dark:text-blue-400',
  high:   'text-orange-500',
  urgent: 'text-red-600 dark:text-red-400 font-bold',
};

async function getTickets() {
  await dbConnect();
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const clientIds = [...new Set(tickets.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: acc.fullName, email: acc.email };
  }

  const openCount = tickets.filter((t: any) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t: any) => t.status === 'in_progress').length;
  const urgentCount = tickets.filter((t: any) => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length;

  return { tickets, accountMap, openCount, inProgressCount, urgentCount };
}

export default async function AdminTicketsPage() {
  const { tickets, accountMap, openCount, inProgressCount, urgentCount } = await getTickets();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="support_agent"
        title="Support Tickets"
        description="Manage all client support tickets raised through the client portal."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Open</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{openCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">In Progress</p>
          <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Urgent</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{urgentCount}</p>
        </div>
      </div>

      {/* Tickets table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">All Tickets</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600 font-semibold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                    No support tickets yet.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => {
                  const client = accountMap[String(ticket.clientId)];
                  return (
                    <tr key={String(ticket._id)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400 font-semibold whitespace-nowrap">
                        {ticket.ticketId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-xs">{client?.fullName || 'Unknown'}</div>
                        <div className="text-[11px] text-gray-400">{client?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[220px]">
                        <p className="text-xs text-gray-800 dark:text-gray-200 truncate" title={ticket.subject}>{ticket.subject}</p>
                        {ticket.category && (
                          <p className="text-[11px] text-gray-400 capitalize">{ticket.category}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs capitalize ${PRIORITY_STYLES[ticket.priority] ?? ''}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES['open']}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/tickets/${String(ticket._id)}`}
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
