'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { replyToOwnTicket } from '@/lib/actions/client';
import {
  uploadTicketAttachments,
  formatFileSize,
} from '@/lib/support/uploadAttachments';

export default function ClientTicketReply({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      setMsg({ type: 'error', text: 'Write a message or attach a file.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const attachments = files.length ? await uploadTicketAttachments(ticketId, files) : [];
      startTransition(async () => {
        const res = await replyToOwnTicket(ticketId, content.trim(), attachments);
        if (res?.error) {
          setMsg({ type: 'error', text: res.error });
        } else {
          setContent('');
          setFiles([]);
          setMsg({ type: 'success', text: 'Reply sent. Our team will get back to you.' });
          router.refresh();
        }
        setBusy(false);
      });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Could not send your reply.' });
      setBusy(false);
    }
  }

  const disabled = busy || isPending;

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Add a Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Type your reply to our team…"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none"
        />

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300"
              >
                <span className="material-icons-outlined text-[14px] text-gray-400">attach_file</span>
                <span className="truncate max-w-[160px]">{f.name}</span>
                <span className="text-gray-400">{formatFileSize(f.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Remove attachment"
                >
                  <span className="material-icons-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
          </div>
        )}

        {msg && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              msg.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            <span className="material-icons-outlined text-[16px]">
              {msg.type === 'success' ? 'check_circle' : 'error_outline'}
            </span>
            {msg.text}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-icons-outlined text-[18px]">attach_file</span>
            Attach files
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
          >
            <span className={`material-icons-outlined text-[16px] ${disabled ? 'animate-spin' : ''}`}>
              {disabled ? 'refresh' : 'send'}
            </span>
            {busy ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
