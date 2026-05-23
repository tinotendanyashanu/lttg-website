'use client';

import { useState } from 'react';

interface Gap {
  _id: string;
  userQuery: string;
  suggestedTitle: string;
  suggestedContent: string;
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
  createdAt: string;
}

interface Props {
  initialGaps: Gap[];
  initialCounts: { pending: number; approved: number; rejected: number };
}

export default function InsightsClient({ initialGaps, initialCounts }: Props) {
  const [gaps, setGaps] = useState<Gap[]>(initialGaps);
  const [counts, setCounts] = useState(initialCounts);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  async function fetchGaps(status: 'pending' | 'approved' | 'rejected') {
    setActiveTab(status);
    const res = await fetch(`/api/admin/chat/knowledge-gaps?status=${status}`);
    const data = await res.json();
    setGaps(data.gaps || []);
    setCounts(data.counts || counts);
  }

  async function updateGap(id: string, status: 'approved' | 'rejected') {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/chat/knowledge-gaps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote: adminNote[id] || '' }),
      });
      if (res.ok) {
        setGaps(prev => prev.filter(g => g._id !== id));
        setCounts(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          [status]: prev[status] + 1,
        }));
      }
    } finally {
      setLoading(null);
    }
  }

  const tabConfig = [
    { key: 'pending' as const, label: 'Pending Review', count: counts.pending, color: 'text-amber-600' },
    { key: 'approved' as const, label: 'Approved', count: counts.approved, color: 'text-emerald-600' },
    { key: 'rejected' as const, label: 'Rejected', count: counts.rejected, color: 'text-gray-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabConfig.map(t => (
          <button
            key={t.key}
            onClick={() => fetchGaps(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            <span className={`text-xs font-bold ${activeTab === t.key ? t.color : 'text-gray-400'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Gap cards */}
      {gaps.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <span className="material-icons-outlined text-4xl text-gray-200 dark:text-gray-700 mb-3 block">
            {activeTab === 'pending' ? 'check_circle_outline' : 'sentiment_satisfied'}
          </span>
          <p className="text-sm text-gray-400">
            {activeTab === 'pending' ? 'No pending suggestions — the AI is covering all questions well.' : `No ${activeTab} suggestions yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map(gap => (
            <div
              key={gap._id}
              className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-outlined text-amber-500 text-[18px]">lightbulb</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Customer asked:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{gap.userQuery}"</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 flex-shrink-0">
                  <span className="material-icons-outlined text-[12px]">query_stats</span>
                  {Math.round(gap.confidence * 100)}% conf.
                </div>
              </div>

              {/* Suggested article */}
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide">Suggested Knowledge Article</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{gap.suggestedTitle}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{gap.suggestedContent}</p>
              </div>

              {/* Actions — only for pending */}
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">
                      Admin note (optional)
                    </label>
                    <input
                      type="text"
                      value={adminNote[gap._id] || ''}
                      onChange={e => setAdminNote(prev => ({ ...prev, [gap._id]: e.target.value }))}
                      placeholder="Add context or instructions for this article..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGap(gap._id, 'approved')}
                      disabled={loading === gap._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {loading === gap._id ? (
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="material-icons-outlined text-[14px]">check</span>
                      )}
                      Approve — add to KB queue
                    </button>
                    <button
                      onClick={() => updateGap(gap._id, 'rejected')}
                      disabled={loading === gap._id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <span className="material-icons-outlined text-[14px]">close</span>
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Reviewed state */}
              {activeTab !== 'pending' && (
                <div className={`flex items-center gap-2 text-xs font-semibold ${activeTab === 'approved' ? 'text-emerald-500' : 'text-gray-400'}`}>
                  <span className="material-icons-outlined text-[14px]">
                    {activeTab === 'approved' ? 'check_circle' : 'cancel'}
                  </span>
                  {activeTab === 'approved' ? 'Approved for KB' : 'Dismissed'}
                </div>
              )}

              <p className="text-[10px] text-gray-300 dark:text-gray-600">
                {new Date(gap.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
