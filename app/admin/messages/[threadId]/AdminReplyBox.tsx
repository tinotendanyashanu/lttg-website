'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { adminSendMessage } from '@/lib/actions/admin-messages';
import { useRouter } from 'next/navigation';

interface Props {
  threadId: string;
  clientName: string;
}

export default function AdminReplyBox({ threadId, clientName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        await adminSendMessage(threadId, content.trim(), notify);
        setContent('');
        setSuccess(`Message sent to ${clientName}.${notify ? ' Email notification delivered.' : ''}`);
        router.refresh();
        textareaRef.current?.focus();
      } catch (err: any) {
        setError(err?.message || 'Failed to send message.');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-[#27272a]">
      {error && (
        <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="material-icons-outlined text-[14px]">check_circle</span>
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={`Reply to ${clientName}… (Ctrl+Enter to send)`}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-brand-primary"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Email notification</span>
          </label>
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="inline-flex items-center gap-1.5 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity"
          >
            {isPending ? (
              <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
            ) : (
              <span className="material-icons-outlined text-[16px]">send</span>
            )}
            {isPending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
