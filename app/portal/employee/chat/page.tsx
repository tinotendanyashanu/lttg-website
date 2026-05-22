import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ChatStatus = 'bot' | 'pending_human' | 'human_active' | 'resolved';

interface ChatSessionRow {
  _id: string;
  visitorName?: string;
  visitorEmail?: string;
  status: ChatStatus;
  messages: { role: string; content: string; timestamp: string }[];
  assignedEmployeeName?: string;
  updatedAt: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<ChatStatus, { label: string; color: string; dot: string }> = {
  bot: { label: 'Bot only', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', dot: 'bg-blue-400' },
  pending_human: { label: 'Needs Reply', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', dot: 'bg-amber-400 animate-pulse' },
  human_active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', dot: 'bg-emerald-400' },
  resolved: { label: 'Resolved', color: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-300' },
};

async function getSessions(isAdmin: boolean) {
  await dbConnect();
  const { ChatSession } = await import('@/models/ChatSession');

  const filter = isAdmin ? {} : { status: { $in: ['pending_human', 'human_active'] } };

  const [sessions, pendingCount] = await Promise.all([
    ChatSession.find(filter)
      .sort({ updatedAt: -1 })
      .limit(60)
      .select('visitorName visitorEmail status messages assignedEmployeeName updatedAt createdAt')
      .lean(),
    ChatSession.countDocuments({ status: 'pending_human' }),
  ]);

  return {
    sessions: JSON.parse(JSON.stringify(sessions)),
    pendingCount,
  };
}

export default async function EmployeeChatPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/portal/login');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/portal/login');

  const isAdmin = account.roles.includes('admin');
  const isEmployee = account.roles.includes('employee') || isAdmin;
  if (!isEmployee) redirect('/portal/employee');

  const { sessions, pendingCount } = await getSessions(isAdmin);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-icons-outlined text-[#7c3aed]">chat_bubble</span>
              Website Chat Inbox
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reply to visitors who requested a human agent. They get an email when you reply.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex-shrink-0 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {pendingCount} pending
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['pending_human', 'human_active', 'bot', 'resolved'] as ChatStatus[]).map(s => {
          const count = (sessions as ChatSessionRow[]).filter(r => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-white dark:bg-[#27272a] rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{cfg.label}</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Sessions */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {isAdmin ? 'All Sessions' : 'Awaiting Your Reply'}
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-icons-outlined text-4xl text-gray-200 dark:text-gray-700 mb-3 block">
              chat_bubble_outline
            </span>
            <p className="text-sm text-gray-400">No sessions to reply to right now</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {(sessions as ChatSessionRow[]).map(s => {
              const cfg = STATUS_CONFIG[s.status];
              const lastMsg = s.messages?.[s.messages.length - 1];
              const preview = lastMsg?.content?.slice(0, 80) || '';
              const diff = Date.now() - new Date(s.updatedAt).getTime();
              const timeAgo =
                diff < 60000 ? 'Just now' :
                diff < 3600000 ? `${Math.floor(diff / 60000)}m ago` :
                diff < 86400000 ? `${Math.floor(diff / 3600000)}h ago` :
                `${Math.floor(diff / 86400000)}d ago`;

              return (
                <Link
                  key={s._id}
                  href={`/admin/chat/${s._id}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
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
                      <p className="text-xs text-gray-400 mb-0.5">{s.visitorEmail}</p>
                    )}
                    {preview && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{preview}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-gray-400">{timeAgo}</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{s.messages?.length || 0} msgs</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Replies are sent from the{' '}
        <Link href="/admin/chat" className="text-[#7c3aed] hover:underline">Admin Chat panel</Link>.
        Visitors receive an email with a link to continue the conversation.
      </p>
    </div>
  );
}
