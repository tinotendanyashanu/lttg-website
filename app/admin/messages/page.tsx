import dbConnect from '@/lib/mongodb';
import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import AdminComposeModal from '@/components/admin/AdminComposeModal';

export const metadata = { title: 'Messages | Admin' };
export const dynamic = 'force-dynamic';

async function getThreadsData() {
  await dbConnect();
  const { MessageThread } = await import('@/models/MessageThread');
  const { Account } = await import('@/models/Account');

  const threads = await MessageThread.find().sort({ lastMessageAt: -1 }).limit(200).lean();
  const clientIds = [...new Set(threads.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  const totalUnread = threads.reduce((s: number, t: any) => s + (t.unreadByTeam || 0), 0);
  const clients = await Account.find({ roles: 'client', isActive: true }, 'fullName email').sort({ fullName: 1 }).lean();

  return { threads, accountMap, totalUnread, clients };
}

export default async function AdminMessagesPage() {
  const { threads, accountMap, totalUnread, clients } = await getThreadsData();
  const clientList = clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="chat"
        title="Client Messages"
        description="View and respond to all client message threads. Replies are emailed to clients automatically."
        action={<AdminComposeModal clients={clientList} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Total Threads</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{threads.length}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Unread by Team</p>
          <p className={`text-2xl font-extrabold ${totalUnread > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {totalUnread}
          </p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Active Clients</p>
          <p className="text-2xl font-extrabold text-brand-primary">
            {new Set(threads.map((t: any) => String(t.clientId))).size}
          </p>
        </div>
      </div>

      {/* Threads table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">All Message Threads</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{threads.length} thread{threads.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {threads.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
              No message threads yet. Click "New Message" to start a conversation with a client.
            </div>
          ) : (
            threads.map((thread: any) => {
              const client = accountMap[String(thread.clientId)];
              const hasUnread = (thread.unreadByTeam || 0) > 0;
              return (
                <Link
                  key={String(thread._id)}
                  href={`/admin/messages/${String(thread._id)}`}
                  className="block px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0 mt-0.5">
                        {(client?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                            {client?.fullName || 'Unknown'}
                          </p>
                          {hasUnread && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold shrink-0">
                              {thread.unreadByTeam}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{thread.subject}</p>
                        {thread.lastMessagePreview && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 italic">
                            "{thread.lastMessagePreview}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(thread.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-[18px] mt-1">chevron_right</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
