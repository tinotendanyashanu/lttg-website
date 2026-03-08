import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import AdminReplyBox from './AdminReplyBox';

export const dynamic = 'force-dynamic';

async function getThread(threadId: string) {
  await dbConnect();
  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');
  const { Account } = await import('@/models/Account');

  const thread = await MessageThread.findById(threadId).lean();
  if (!thread) return null;

  const [messages, client] = await Promise.all([
    ClientMessage.find({ threadId }).sort({ createdAt: 1 }).lean(),
    Account.findById((thread as any).clientId, 'fullName email clientProfile').lean(),
  ]);

  // Mark as read by team
  await MessageThread.findByIdAndUpdate(threadId, { $set: { unreadByTeam: 0 } });

  return {
    thread: JSON.parse(JSON.stringify(thread)),
    messages: JSON.parse(JSON.stringify(messages)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

export default async function AdminThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const data = await getThread(threadId);
  if (!data) notFound();

  const { thread, messages, client } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/messages"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        All Messages
      </Link>

      {/* Thread Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{thread.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[10px]">
                {(client?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {client?.fullName || 'Unknown'} · {client?.email || '—'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
            <Link
              href={`/portal/client/messages/${threadId}`}
              target="_blank"
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-0.5 justify-end mt-1"
            >
              Client View
              <span className="material-icons-outlined text-[11px]">open_in_new</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No messages yet. Use the reply box below to start the conversation.
            </div>
          ) : (
            messages.map((msg: any) => {
              const isAdmin = msg.senderRole !== 'client';
              return (
                <div
                  key={String(msg._id)}
                  className={`px-5 py-4 ${isAdmin ? 'bg-brand-primary/[0.03] dark:bg-brand-primary/5' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${isAdmin ? 'text-brand-primary' : 'text-blue-600 dark:text-blue-400'}`}>
                      {isAdmin
                        ? (msg.senderName || 'LeoTheTechGuy Team')
                        : (client?.fullName || 'Client')}
                      {isAdmin && (
                        <span className="ml-2 text-[9px] bg-brand-primary/10 text-brand-primary rounded-md px-1.5 py-0.5 font-semibold uppercase tracking-wide">Team</span>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Reply box */}
        <AdminReplyBox
          threadId={threadId}
          clientName={client?.fullName || 'Client'}
        />
      </div>

      {/* Client sidebar info */}
      {client && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">Client Info</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
              {(client.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.fullName}</p>
              <p className="text-xs text-gray-400">{client.email}</p>
              {client.clientProfile?.companyName && (
                <p className="text-xs text-gray-400">{client.clientProfile.companyName}</p>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-4">
            <Link href="/admin/invoices" className="text-xs font-semibold text-brand-primary hover:underline">Invoices</Link>
            <Link href="/admin/tickets" className="text-xs font-semibold text-brand-primary hover:underline">Tickets</Link>
          </div>
        </div>
      )}
    </div>
  );
}
