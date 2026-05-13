import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  waiting_client: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  resolved: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  urgent: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

async function getTicket(clientId: string, ticketId: string) {
  try {
    await dbConnect();
    const { SupportTicket } = await import('@/models/SupportTicket');
    const ticket = await SupportTicket.findOne({ _id: ticketId, clientId }).lean();
    return ticket ? JSON.parse(JSON.stringify(ticket)) : null;
  } catch (_) {
    return null;
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const ticket = await getTicket(session.user.id, ticketId);
  if (!ticket) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/portal/client/tickets"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        Back to Tickets
      </Link>

      {/* Ticket Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-400">
                {ticket.ticketId || ticketId.slice(-8).toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                  STATUS_STYLES[ticket.status] || STATUS_STYLES.open
                }`}
              >
                {ticket.status.replace(/_/g, ' ')}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                  PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium
                }`}
              >
                {ticket.priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Category', value: ticket.category?.replace(/_/g, ' ') || '—' },
            { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString() },
            { label: 'Last Updated', value: new Date(ticket.updatedAt).toLocaleDateString() },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider text-gray-400">
          Description
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Messages / Replies */}
      {ticket.messages && ticket.messages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Replies</h3>
          {ticket.messages.map((msg: any, i: number) => (
            <div
              key={i}
              className={`rounded-2xl p-4 ${
                msg.senderRole === 'client'
                  ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 ml-8'
                  : 'bg-white dark:bg-[#27272a] shadow-soft border border-gray-100 dark:border-gray-800 mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${msg.senderRole === 'client' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {msg.senderRole === 'client' ? 'You' : msg.senderName || 'LeoTech Team'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Status info for closed/resolved tickets */}
      {(ticket.status === 'resolved' || ticket.status === 'closed') && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-icons-outlined text-green-600 dark:text-green-400">check_circle</span>
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            This ticket has been {ticket.status}. If you need further help, please create a new ticket.
          </p>
        </div>
      )}

      {/* Messages link */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Need faster help?</p>
          <p className="text-xs text-gray-400 mt-0.5">Send a direct message to our team</p>
        </div>
        <Link
          href="/portal/client/messages"
          className="inline-flex items-center gap-1.5 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          <span className="material-icons-outlined text-[14px]">chat</span>
          Messages
        </Link>
      </div>
    </div>
  );
}
