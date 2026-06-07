'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  replyToTicket,
  updateTicketStatusAsStaff,
  generateReplyDraft,
  applyAISuggestion,
  assignTicket,
  escalateTicket,
  addInternalNote,
  reprocessTicketAI,
} from '@/lib/actions/support-center';
import { uploadTicketAttachments, formatFileSize } from '@/lib/support/uploadAttachments';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_client', label: 'Waiting on Client' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

type TicketStatus = (typeof STATUS_OPTIONS)[number]['value'];

interface AISuggestions {
  summary?: string;
  sentiment?: string;
  suggestedCategory?: string;
  suggestedCategoryLabel?: string;
  suggestedPriority?: string;
  suggestedTeam?: string;
  processingStatus?: string;
}

interface Props {
  ticketId: string;
  ticketRef: string;
  currentStatus: TicketStatus;
  currentCategory?: string;
  currentPriority?: string;
  currentTeam?: string;
  ai?: AISuggestions;
  staff: { _id: string; fullName: string }[];
}

export default function TicketActionPanel({
  ticketId,
  ticketRef,
  currentStatus,
  currentCategory,
  currentPriority,
  currentTeam,
  ai,
  staff,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState<TicketStatus | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [notifyOnStatus, setNotifyOnStatus] = useState(true);

  const [assignee, setAssignee] = useState('');
  const [note, setNote] = useState('');

  function showMsg(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function run(fn: () => Promise<unknown>, ok: string, after?: () => void) {
    startTransition(async () => {
      try {
        await fn();
        showMsg('success', ok);
        after?.();
        router.refresh();
      } catch (err: any) {
        showMsg('error', err?.message || 'Action failed.');
      }
    });
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await generateReplyDraft(ticketId);
      setReply(res.draft);
      showMsg('success', 'AI draft generated — review and edit before sending.');
    } catch (err: any) {
      showMsg('error', err?.message || 'Could not generate a draft.');
    } finally {
      setGenerating(false);
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() && files.length === 0) {
      showMsg('error', 'Reply cannot be empty.');
      return;
    }
    setSending(true);
    try {
      const attachments = files.length ? await uploadTicketAttachments(ticketId, files) : [];
      startTransition(async () => {
        try {
          await replyToTicket(ticketId, reply.trim(), attachments, (replyStatus || undefined) as TicketStatus | undefined);
          showMsg('success', 'Reply sent and client notified by email.');
          setReply('');
          setReplyStatus('');
          setFiles([]);
          router.refresh();
        } catch (err: any) {
          showMsg('error', err?.message || 'Could not send reply.');
        } finally {
          setSending(false);
        }
      });
    } catch (err: any) {
      showMsg('error', err?.message || 'Attachment upload failed.');
      setSending(false);
    }
  }

  const suggestionChips: { label: string; field: 'category' | 'priority' | 'team'; value: string }[] = [];
  if (ai?.suggestedCategory && ai.suggestedCategory !== currentCategory) {
    suggestionChips.push({ label: `Category → ${ai.suggestedCategoryLabel || ai.suggestedCategory}`, field: 'category', value: ai.suggestedCategory });
  }
  if (ai?.suggestedPriority && ai.suggestedPriority !== currentPriority) {
    suggestionChips.push({ label: `Priority → ${ai.suggestedPriority}`, field: 'priority', value: ai.suggestedPriority });
  }
  if (ai?.suggestedTeam && ai.suggestedTeam !== currentTeam) {
    suggestionChips.push({ label: `Team → ${ai.suggestedTeam}`, field: 'team', value: ai.suggestedTeam });
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30';

  return (
    <div className="space-y-4">
      {/* AI suggestion chips */}
      {suggestionChips.length > 0 && (
        <div className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl border border-brand-primary/20 p-4">
          <p className="text-[11px] font-bold text-brand-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="material-icons-outlined text-[14px]">auto_awesome</span>
            Apply AI Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((c) => (
              <button
                key={c.field}
                disabled={isPending}
                onClick={() => run(() => applyAISuggestion(ticketId, { [c.field]: c.value } as any), `Applied: ${c.label}`)}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-white dark:bg-[#27272a] border border-brand-primary/30 text-brand-primary rounded-full px-3 py-1.5 hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50"
              >
                <span className="material-icons-outlined text-[13px]">add</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply Form with AI assistant */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-icons-outlined text-[16px] text-brand-primary">reply</span>
            Reply to Client
          </h3>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || isPending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded-full px-3 py-1.5 hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50"
          >
            <span className={`material-icons-outlined text-[14px] ${generating ? 'animate-spin' : ''}`}>
              {generating ? 'autorenew' : 'auto_awesome'}
            </span>
            {generating ? 'Generating…' : 'Generate AI Response'}
          </button>
        </div>
        <form onSubmit={handleSendReply} className="space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            placeholder="Write your reply, or use Generate AI Response to draft one…"
            className={`${inputClass} resize-none`}
          />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300"
                >
                  <span className="material-icons-outlined text-[14px] text-gray-400">attach_file</span>
                  <span className="truncate max-w-[140px]">{f.name}</span>
                  <span className="text-gray-400">{formatFileSize(f.size)}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500" aria-label="Remove attachment">
                    <span className="material-icons-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={sending || isPending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50"
            >
              <span className="material-icons-outlined text-[16px]">attach_file</span>
              Attach
            </button>
            <input ref={fileRef} type="file" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
            <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value as TicketStatus | '')} className={`${inputClass} flex-1`}>
              <option value="">Keep current status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={sending || isPending || (!reply.trim() && files.length === 0)}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          >
            <span className={`material-icons-outlined text-[16px] ${sending || isPending ? 'animate-spin' : ''}`}>{sending || isPending ? 'autorenew' : 'send'}</span>
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </form>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Update Status</h3>
        <div className="space-y-3">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)} className={inputClass}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifyOnStatus} onChange={(e) => setNotifyOnStatus(e.target.checked)} className="w-4 h-4 rounded accent-brand-primary" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Notify client by email</span>
          </label>
          <button
            onClick={() =>
              selectedStatus === currentStatus
                ? showMsg('error', 'Status unchanged.')
                : run(() => updateTicketStatusAsStaff(ticketId, selectedStatus, notifyOnStatus), `Ticket ${ticketRef} updated to "${selectedStatus}".`)
            }
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-100 hover:opacity-80 disabled:opacity-50 text-white dark:text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
          >
            <span className="material-icons-outlined text-[16px]">save</span>
            Update Status
          </button>
        </div>
      </div>

      {/* Assign + Escalate */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Assign &amp; Escalate</h3>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
          <option value="">Select staff member…</option>
          {staff.map((s) => (
            <option key={s._id} value={s._id}>{s.fullName}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => (assignee ? run(() => assignTicket(ticketId, assignee, currentTeam), 'Ticket assigned.') : showMsg('error', 'Pick a staff member.'))}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold hover:opacity-80 disabled:opacity-50"
          >
            <span className="material-icons-outlined text-[16px]">person_add</span>
            Assign
          </button>
          <button
            onClick={() => run(() => escalateTicket(ticketId), 'Ticket escalated.')}
            disabled={isPending || currentStatus === 'escalated'}
            className="inline-flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-3 py-2.5 text-sm font-semibold hover:opacity-80 disabled:opacity-50"
          >
            <span className="material-icons-outlined text-[16px]">priority_high</span>
            Escalate
          </button>
        </div>
      </div>

      {/* Internal note */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <span className="material-icons-outlined text-[15px] text-yellow-500">lock</span>
          Internal Note
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a private note (not visible to the client)…"
          className={`${inputClass} resize-none`}
        />
        <button
          onClick={() => (note.trim() ? run(() => addInternalNote(ticketId, note.trim()), 'Internal note added.', () => setNote('')) : showMsg('error', 'Note cannot be empty.'))}
          disabled={isPending || !note.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-80 disabled:opacity-50"
        >
          <span className="material-icons-outlined text-[16px]">note_add</span>
          Save Note
        </button>
      </div>

      {/* Reprocess AI */}
      <button
        onClick={() => run(() => reprocessTicketAI(ticketId), 'AI reprocessing complete.')}
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 hover:text-brand-primary transition-colors disabled:opacity-50"
      >
        <span className="material-icons-outlined text-[14px]">refresh</span>
        Reprocess with AI
        {ai?.processingStatus === 'pending' && <span className="text-amber-500">(pending…)</span>}
        {ai?.processingStatus === 'failed' && <span className="text-red-500">(last run failed)</span>}
      </button>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40'
          }`}
        >
          <span className="material-icons-outlined text-[14px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}
    </div>
  );
}
