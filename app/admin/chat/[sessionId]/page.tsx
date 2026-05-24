import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Link from 'next/link';
import AdminChatReply from './AdminChatReply';

export const dynamic = 'force-dynamic';

type MessageRole = 'bot' | 'visitor' | 'employee';

interface ChatMessage {
  role: MessageRole;
  content: string;
  senderName?: string;
  timestamp: string;
}

const ROLE_CONFIG = {
  bot: { label: 'Bot', bg: 'bg-[#7c3aed]/10', text: 'text-[#7c3aed]', bubble: 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100' },
  visitor: { label: 'Visitor', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500', bubble: 'bg-[#7c3aed] text-white' },
  employee: { label: 'Team', bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', bubble: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800' },
};

async function getSession(id: string) {
  await dbConnect();
  const { ChatSession } = await import('@/models/ChatSession');
  const session = await ChatSession.findById(id).lean();
  if (!session) return null;
  return JSON.parse(JSON.stringify(session));
}

export default async function AdminChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const authSession = await auth();
  const role = (authSession?.user as { role?: string })?.role;
  if (!authSession?.user || !role || !['admin', 'employee'].includes(role)) redirect('/admin/login');

  const chatSession = await getSession(sessionId);
  if (!chatSession) notFound();

  const messages: ChatMessage[] = chatSession.messages || [];

  const statusColors: Record<string, string> = {
    bot: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    pending_human: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    human_active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    resolved: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-2xl">
      <Link
        href="/admin/chat"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        Chat Inbox
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] font-bold">
              {(chatSession.visitorName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                {chatSession.visitorName || 'Anonymous Visitor'}
              </h1>
              {chatSession.visitorEmail && (
                <p className="text-xs text-gray-400 mt-0.5">{chatSession.visitorEmail}</p>
              )}
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[chatSession.status] || ''}`}>
            {chatSession.status.replace('_', ' ')}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Messages</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{messages.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Started</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {new Date(chatSession.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Last Activity</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {new Date(chatSession.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><span className="font-semibold text-gray-700 dark:text-gray-200">AI:</span> {chatSession.aiMode || "unknown"} · {chatSession.aiModel || "n/a"} · lead {chatSession.leadScore || 0}/10</p>
          {chatSession.leadSummary && <p><span className="font-semibold text-gray-700 dark:text-gray-200">Summary:</span> {chatSession.leadSummary}</p>}
          {chatSession.aiError && <p className="text-red-500"><span className="font-semibold">AI error:</span> {chatSession.aiError}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Conversation</h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50 max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => {
            const cfg = ROLE_CONFIG[m.role];
            const isVisitor = m.role === 'visitor';
            return (
              <div key={i} className={`px-5 py-4 flex gap-3 ${isVisitor ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                  {m.role === 'bot' ? (
                    <span className="material-icons-outlined text-[14px]">smart_toy</span>
                  ) : m.role === 'visitor' ? (
                    (chatSession.visitorName || 'A')[0].toUpperCase()
                  ) : (
                    (m.senderName || 'T')[0].toUpperCase()
                  )}
                </div>
                <div className={`flex-1 flex flex-col gap-1 ${isVisitor ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold ${cfg.text}`}>
                      {m.role === 'employee' ? m.senderName || 'Team' : m.role === 'visitor' ? chatSession.visitorName || 'Visitor' : 'Leo (Bot)'}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] ${cfg.bubble}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply box — only if not resolved */}
      {chatSession.status !== 'resolved' && (
        <AdminChatReply sessionId={sessionId} />
      )}

      {chatSession.status === 'resolved' && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">This conversation has been resolved.</p>
        </div>
      )}
    </div>
  );
}
