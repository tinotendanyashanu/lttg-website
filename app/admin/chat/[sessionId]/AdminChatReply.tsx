'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminChatReply({ sessionId }: { sessionId: string }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/chat/sessions/${sessionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.success) {
        setContent('');
        router.refresh();
      } else {
        setError(data.error || 'Failed to send.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    if (!confirm('Mark this conversation as resolved?')) return;
    try {
      const res = await fetch(`/api/admin/chat/sessions/${sessionId}/resolve`, { method: 'POST' });
      if ((await res.json()).success) router.refresh();
    } catch { /* silent */ }
  }

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5 space-y-4">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Reply to Visitor</h3>
      <form onSubmit={handleSend} className="space-y-3">
        <textarea
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type your reply... The visitor will be notified by email."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] transition-all resize-none"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Reply
          </button>
          <button
            type="button"
            onClick={handleResolve}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Mark Resolved
          </button>
        </div>
      </form>
    </div>
  );
}
