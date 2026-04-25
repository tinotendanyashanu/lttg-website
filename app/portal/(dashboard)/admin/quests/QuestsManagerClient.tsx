'use client';

import React, { useState } from 'react';
import { createQuest, updateQuest, deleteQuest } from '@/lib/actions/quests';
import type { QuestListItem } from '@/lib/actions/quests';
import type { QuestMetric } from '@/lib/types/quest';
import { format } from 'date-fns';

const METRICS: { value: QuestMetric; label: string }[] = [
  { value: 'converted_leads', label: 'Won sales (converted leads)' },
  { value: 'new_leads', label: 'New leads created' },
  { value: 'qualified_leads', label: 'Qualified opportunities' },
  { value: 'revenue', label: 'Revenue from won leads ($)' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'employee', label: 'Employees' },
  { value: 'intern', label: 'Interns' },
];

export default function QuestsManagerClient({ initialQuests }: { initialQuests: QuestListItem[] }) {
  const [quests, setQuests] = useState(initialQuests);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    metric: 'converted_leads' as QuestMetric,
    targetValue: 5,
    startsAt: '',
    endsAt: '',
    rewardLabel: '',
    isActive: true,
    targetRoles: ['all'] as string[],
  });

  const openCreate = () => {
    setEditingId(null);
    const now = new Date();
    const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setForm({
      title: '',
      description: '',
      metric: 'converted_leads',
      targetValue: 5,
      startsAt: format(now, "yyyy-MM-dd'T'HH:mm"),
      endsAt: format(inWeek, "yyyy-MM-dd'T'HH:mm"),
      rewardLabel: '',
      isActive: true,
      targetRoles: ['all'],
    });
    setModal(true);
  };

  const openEdit = (q: QuestListItem) => {
    setEditingId(q._id);
    setForm({
      title: q.title,
      description: q.description,
      metric: q.metric,
      targetValue: q.targetValue,
      startsAt: format(new Date(q.startsAt), "yyyy-MM-dd'T'HH:mm"),
      endsAt: format(new Date(q.endsAt), "yyyy-MM-dd'T'HH:mm"),
      rewardLabel: q.rewardLabel || '',
      isActive: q.isActive,
      targetRoles: q.targetRoles?.includes('all') ? ['all'] : [...(q.targetRoles || [])],
    });
    setModal(true);
  };

  const toggleRole = (value: string) => {
    setForm((prev) => {
      if (value === 'all') {
        return { ...prev, targetRoles: ['all'] };
      }
      const withoutAll = prev.targetRoles.filter((r) => r !== 'all');
      if (withoutAll.includes(value)) {
        const next = withoutAll.filter((r) => r !== value);
        return { ...prev, targetRoles: next.length ? next : ['all'] };
      }
      return { ...prev, targetRoles: [...withoutAll, value] };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      description: form.description,
      metric: form.metric,
      targetValue: form.targetValue,
      startsAt: new Date(form.startsAt),
      endsAt: new Date(form.endsAt),
      rewardLabel: form.rewardLabel || undefined,
      isActive: form.isActive,
      targetRoles: form.targetRoles,
    };
    const res = editingId ? await updateQuest(editingId, payload) : await createQuest(payload);
    setLoading(false);
    if (res.success) {
      setModal(false);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this quest?')) return;
    const res = await deleteQuest(id);
    if (res.success) {
      setQuests((prev) => prev.filter((q) => q._id !== id));
    } else {
      alert(res.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Create time-bound sales challenges. Intern progress uses leads they submit; employees use leads assigned
          to them. Metrics are counted within the quest start and end window.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-brand-primary/90 flex items-center gap-2 shrink-0"
        >
          <span className="material-icons-outlined text-lg">add</span>
          New quest
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quest</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Window</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {quests.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{q.title}</p>
                    {q.rewardLabel && (
                      <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">Reward: {q.rewardLabel}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{q.metricLabel}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{q.targetValue}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                    {format(new Date(q.startsAt), 'MMM d, HH:mm')}
                    <br />
                    → {format(new Date(q.endsAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                        q.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {q.isActive ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button type="button" onClick={() => openEdit(q)} className="text-brand-primary text-sm font-medium">
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(q._id)} className="text-red-600 text-sm font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {quests.length === 0 && (
          <p className="text-center text-gray-500 py-10 text-sm">No quests yet. Create one to motivate your team.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit quest' : 'New quest'}
            </h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm min-h-[72px]"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metric</label>
                <select
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  value={form.metric}
                  onChange={(e) => setForm((p) => ({ ...p, metric: e.target.value as QuestMetric }))}
                >
                  {METRICS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  value={form.targetValue}
                  onChange={(e) => setForm((p) => ({ ...p, targetValue: Number(e.target.value) }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starts</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-2 text-sm"
                    value={form.startsAt}
                    onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ends</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-2 text-sm"
                    value={form.endsAt}
                    onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reward (optional)</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  placeholder="e.g. Team lunch, $50 bonus"
                  value={form.rewardLabel}
                  onChange={(e) => setForm((p) => ({ ...p, rewardLabel: e.target.value }))}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visible to</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={form.targetRoles.includes(o.value)}
                        onChange={() => toggleRole(o.value)}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
              {editingId && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  Quest is active
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving…' : editingId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
