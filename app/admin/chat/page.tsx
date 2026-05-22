import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';

export const metadata = { title: 'Chat Inbox | Admin' };
export const dynamic = 'force-dynamic';

type ChatStatus = 'bot' | 'pending_human' | 'human_active' | 'resolved';

async function getChatSessions() {
  await dbConnect();
  const { ChatSession } = await import('@/models/ChatSession');

  const [pending, active, resolved, total] = await Promise.all([
    ChatSession.countDocuments({ status: 'pending_human' }),
    ChatSession.countDocuments({ status: 'human_active' }),
    ChatSession.countDocuments({ status: 'resolved' }),
    ChatSession.countDocuments({}),
  ]);

  const sessions = await ChatSession.find({ status: { $in: ['pending_human', 'human_active', 'bot'] } })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select('sessionId visitorName visitorEmail status messages assignedEmployeeName updatedAt createdAt')
    .lean();

  return {
    sessions: JSON.parse(JSON.stringify(sessions)),
    stats: { pending, active, resolved, total },
  };
}

const STATUS_CONFIG: Record<ChatStatus, { label: string; color: string; dot: string }> = {
  bot: { label: 'Bot', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', dot: 'bg-blue-400' },
  pending_human: { label: 'Needs Reply', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-400 animate-pulse' },
  human_active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-400' },
  resolved: { label: 'Resolved', color: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-300' },
};

export default async function AdminChatPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['admin', 'employee'].includes(role)) redirect('/admin/login');

  const { sessions, stats } = await getChatSessions();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="chat_bubble"
        title="Chat Inbox"
        description="Manage website chat sessions. Reply to visitors and close deals."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Needs Reply', value: stats.pending, color: 'text-amber-500' },
          { label: 'Active', value: stats.active, color: 'text-emerald-500' },
          { label: 'Resolved', value: stats.resolved, color: 'text-gray-400' },
          { label: 'Total', value: stats.total, color: 'text-[#7c3aed]' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions list */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Active & Pending Sessions</h2>
          <Link href="/admin/chat?all=1" className="text-xs text-[#7c3aed] hover:underline font-semibold">View all</Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-icons-outlined text-4xl text-gray-200 dark:text-gray-700 mb-3 block">chat_bubble_outline</span>
            <p className="text-sm text-gray-400">No active chat sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {(sessions as any[]).map(s => {
              const cfg = STATUS_CONFIG[s.status as ChatStatus] || STATUS_CONFIG.bot;
              const lastMsg = s.messages?.[s.messages.length - 1];
              const preview = lastMsg?.content?.slice(0, 90) || 'No messages yet';
              const timeAgo = s.updatedAt
                ? (() => {
                    const diff = Date.now() - new Date(s.updatedAt).getTime();
                    if (diff < 60000) return 'Just now';
                    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                    return `${Math.floor(diff / 86400000)}d ago`;
                  })()
                : '';

              return (
                <Link
                  key={s._id}
                  href={`/admin/chat/${s._id}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-bold text-sm flex-shrink-0 mt-0.5">
                    {(s.visitorName || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {s.visitorName || 'Anonymous Visitor'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    {s.visitorEmail && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{s.visitorEmail}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{preview}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[10px] text-gray-400">{timeAgo}</span>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{s.messages?.length || 0} msgs</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
