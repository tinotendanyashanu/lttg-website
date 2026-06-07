'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addMilestone,
  updateMilestoneStatus,
  removeMilestone,
} from '@/lib/actions/project-milestones';
import { MILESTONE_LABELS, type MilestoneStatus } from '@/lib/support/constants';

export interface Milestone {
  _id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  order?: number;
}

const STATUS_STYLES: Record<MilestoneStatus, string> = {
  pending: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  in_progress: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  done: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
};

const NEXT_STATUS: Record<MilestoneStatus, MilestoneStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

/**
 * Project milestones / deliverables surfaced inside a ticket. When `editable`
 * (staff), milestones can be added, advanced through their lifecycle and removed.
 * Read-only otherwise (client portal) — just the progress bar and the list.
 */
export default function ProjectMilestonesPanel({
  caseId,
  ticketId,
  milestones,
  editable = false,
}: {
  caseId: string;
  ticketId: string;
  milestones: Milestone[];
  editable?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const sorted = [...milestones].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const done = sorted.filter((m) => m.status === 'done').length;
  const pct = sorted.length ? Math.round((done / sorted.length) * 100) : 0;

  function refresh() {
    startTransition(() => router.refresh());
  }

  function handleAdd() {
    const t = title.trim();
    if (!t) return;
    setError('');
    startTransition(async () => {
      try {
        await addMilestone(caseId, { title: t, dueDate: dueDate || undefined }, ticketId);
        setTitle('');
        setDueDate('');
        setAdding(false);
        router.refresh();
      } catch (e) {
        setError((e as Error).message || 'Failed to add milestone');
      }
    });
  }

  function cycleStatus(m: Milestone) {
    startTransition(async () => {
      try {
        await updateMilestoneStatus(caseId, m._id, NEXT_STATUS[m.status], ticketId);
        router.refresh();
      } catch {
        /* surfaced via disabled state */
      }
    });
  }

  function handleRemove(m: Milestone) {
    startTransition(async () => {
      try {
        await removeMilestone(caseId, m._id, ticketId);
        router.refresh();
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-icons-outlined text-[15px] text-brand-primary">flag</span>
          Project Milestones
        </h3>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {done}/{sorted.length} · {pct}%
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 mb-3">No milestones yet.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {sorted.map((m) => (
            <li key={m._id} className="flex items-start gap-2.5">
              <button
                type="button"
                disabled={!editable || pending}
                onClick={() => cycleStatus(m)}
                title={editable ? 'Advance status' : undefined}
                className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  m.status === 'done'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : m.status === 'in_progress'
                      ? 'border-blue-400'
                      : 'border-gray-300 dark:border-gray-600'
                } ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
              >
                {m.status === 'done' && <span className="material-icons-outlined text-[11px]">check</span>}
                {m.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    m.status === 'done'
                      ? 'text-gray-400 line-through'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {m.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_STYLES[m.status]}`}>
                    {MILESTONE_LABELS[m.status]}
                  </span>
                  {m.dueDate && (
                    <span className="text-[10px] text-gray-400">
                      Due {new Date(m.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {editable && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRemove(m)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  title="Remove milestone"
                >
                  <span className="material-icons-outlined text-[16px]">close</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable &&
        (adding ? (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Milestone title"
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending || !title.trim()}
                onClick={handleAdd}
                className="flex-1 text-xs font-semibold bg-brand-primary text-white rounded-lg py-2 disabled:opacity-50"
              >
                {pending ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setError('');
                }}
                className="text-xs font-semibold text-gray-500 px-3"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full text-xs font-semibold text-brand-primary border border-dashed border-brand-primary/40 rounded-lg py-2 hover:bg-brand-primary/5 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">add</span>
            Add milestone
          </button>
        ))}
    </div>
  );
}
