import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import TicketActionPanel from './TicketActionPanel';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  open:           'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  in_progress:    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/40',
  waiting_client: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  resolved:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  closed:         'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:    'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  medium: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  high:   'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/40',
  urgent: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
};

async function getTicketData(id: string) {
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');

  const ticket = await SupportTicket.findById(id).lean();
  if (!ticket) return null;

  const client = await Account.findById((ticket as any).clientId, 'fullName email clientProfile').lean();
  return {
    ticket: JSON.parse(JSON.stringify(ticket)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const data = await getTicketData(ticketId);
  if (!data) notFound();

  const { ticket, client } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        All Tickets
      </Link>

      <AdminPageBanner
        icon="support_agent"
        title={`Ticket ${ticket.ticketId || ticketId.slice(-8).toUpperCase()}`}
        description={`${client?.fullName || 'Unknown Client'} · ${ticket.subject}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket Header */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.subject}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {ticket.ticketId} ·{' '}
                  {ticket.category?.replace(/_/g, ' ') || 'General'} ·{' '}
                  Created {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES['medium']}`}>
                  {ticket.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES['open']}`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Client Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Messages / Conversation */}
          {ticket.messages && ticket.messages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Conversation ({ticket.messages.length})</h3>
              {ticket.messages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`rounded-2xl p-5 ${
                    msg.senderRole === 'client'
                      ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 ml-8'
                      : 'bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 shadow-soft mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${msg.senderRole === 'client' ? 'text-blue-600 dark:text-blue-400' : 'text-brand-primary'}`}>
                      {msg.senderRole === 'client'
                        ? (client?.fullName || 'Client')
                        : (msg.senderName || 'LeoTheTechGuy Team')}
                      {msg.senderRole !== 'client' && (
                        <span className="ml-2 text-[10px] bg-brand-primary/10 text-brand-primary rounded-md px-1.5 py-0.5 font-semibold">TEAM</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {ticket.internalNotes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-5">
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-icons-outlined text-[14px]">lock</span>
                Internal Notes (not visible to client)
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed whitespace-pre-wrap">{ticket.internalNotes}</p>
            </div>
          )}

          {/* Resolution info */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Ticket {ticket.status} on{' '}
                {new Date(ticket.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TicketActionPanel
            ticketId={ticketId}
            currentStatus={ticket.status}
            ticketRef={ticket.ticketId || ticketId.slice(-8).toUpperCase()}
          />

          {/* Client Info */}
          {client && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                  {(client.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.fullName}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </div>
              </div>
              {client.clientProfile?.companyName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Company:</span> {client.clientProfile.companyName}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                <Link
                  href={`/admin/invoices`}
                  className="block text-xs font-semibold text-brand-primary hover:underline"
                >
                  View Client Invoices
                </Link>
                <Link
                  href={`/portal/client/tickets/${ticketId}`}
                  target="_blank"
                  className="block text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:underline flex items-center gap-1"
                >
                  Client View
                  <span className="material-icons-outlined text-[11px]">open_in_new</span>
                </Link>
              </div>
            </div>
          )}

          {/* Ticket Meta */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Details</h3>
            <dl className="space-y-2">
              {[
                { label: 'Ticket ID', value: ticket.ticketId },
                { label: 'Priority', value: ticket.priority },
                { label: 'Category', value: ticket.category || 'General' },
                { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString() },
                { label: 'Last Updated', value: new Date(ticket.updatedAt).toLocaleDateString() },
                { label: 'Messages', value: String(ticket.messages?.length || 0) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <dt className="text-xs text-gray-400">{item.label}</dt>
                  <dd className="text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
