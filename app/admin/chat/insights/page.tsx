import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import InsightsClient from './InsightsClient';

export const metadata = { title: 'AI Chat Insights | Admin' };
export const dynamic = 'force-dynamic';

async function getInsightsData() {
  await dbConnect();

  const { KnowledgeGapSuggestion } = await import('@/models/KnowledgeGapSuggestion');
  const { ChatSession } = await import('@/models/ChatSession');

  const [gaps, counts, sessionStats, highIntentSessions] = await Promise.all([
    KnowledgeGapSuggestion.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Promise.all([
      KnowledgeGapSuggestion.countDocuments({ status: 'pending' }),
      KnowledgeGapSuggestion.countDocuments({ status: 'approved' }),
      KnowledgeGapSuggestion.countDocuments({ status: 'rejected' }),
    ]),
    Promise.all([
      ChatSession.countDocuments({}),
      ChatSession.countDocuments({ status: { $in: ['pending_human', 'human_active'] } }),
      ChatSession.countDocuments({ status: 'resolved' }),
    ]),
    ChatSession.find({ leadScore: { $gte: 7 } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('sessionId visitorName visitorEmail leadScore status updatedAt messages')
      .lean(),
  ]);

  return {
    gaps: JSON.parse(JSON.stringify(gaps)),
    gapCounts: { pending: counts[0], approved: counts[1], rejected: counts[2] },
    sessionStats: { total: sessionStats[0], escalated: sessionStats[1], resolved: sessionStats[2] },
    highIntentSessions: JSON.parse(JSON.stringify(highIntentSessions)),
  };
}

export default async function ChatInsightsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['admin', 'employee'].includes(role)) redirect('/admin/login');

  const { gaps, gapCounts, sessionStats, highIntentSessions } = await getInsightsData();

  const conversionRate = sessionStats.total > 0
    ? Math.round((sessionStats.escalated + sessionStats.resolved) / sessionStats.total * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="psychology"
        title="AI Chat Insights"
        description="Knowledge gaps detected by the AI, lead signals, and conversation intelligence."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Knowledge Gaps', value: gapCounts.pending, color: 'text-amber-500', icon: 'lightbulb' },
          { label: 'Total Sessions', value: sessionStats.total, color: 'text-[#7c3aed]', icon: 'chat_bubble' },
          { label: 'Escalated / Active', value: sessionStats.escalated, color: 'text-blue-500', icon: 'support_agent' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-emerald-500', icon: 'trending_up' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-icons-outlined text-[18px] ${s.color}`}>{s.icon}</span>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{s.label}</p>
            </div>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* High-intent sessions */}
      {highIntentSessions.length > 0 && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="material-icons-outlined text-[18px] text-emerald-500">bolt</span>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">High-Intent Leads</h2>
            <span className="ml-auto text-[10px] text-gray-400">Lead score ≥ 7</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {(highIntentSessions as any[]).map((s: any) => {
              const lastMsg = s.messages?.[s.messages.length - 1];
              return (
                <a
                  key={s._id}
                  href={`/admin/chat/${s._id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                    {(s.visitorName || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {s.visitorName || 'Anonymous Visitor'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{lastMsg?.content?.slice(0, 70) || 'No messages'}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="material-icons-outlined text-[12px] text-emerald-500">bolt</span>
                      <span className="text-xs font-bold text-emerald-600">{s.leadScore}/10</span>
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      s.status === 'pending_human' ? 'text-amber-500' :
                      s.status === 'human_active' ? 'text-emerald-500' : 'text-gray-400'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Knowledge gap review */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-icons-outlined text-[20px] text-[#7c3aed]">auto_fix_high</span>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Knowledge Gap Suggestions</h2>
          <p className="text-xs text-gray-400 ml-1">
            AI-detected gaps from real customer conversations. Approve to queue for KB creation.
          </p>
        </div>
        <InsightsClient initialGaps={gaps} initialCounts={gapCounts} />
      </div>
    </div>
  );
}
