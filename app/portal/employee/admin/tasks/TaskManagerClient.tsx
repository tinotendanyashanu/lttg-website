'use client';

import { useState, useMemo, useTransition } from 'react';
import { createAdminTask, updateAdminTask, deleteAdminTask } from '@/lib/actions/admin-tasks';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assignedTo?: { _id: string; fullName?: string; email: string } | null;
  createdAt: string;
}

interface StaffMember {
  _id: string;
  fullName?: string;
  email: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  pending:     { label: 'Pending',     color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',           icon: 'radio_button_unchecked' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',        icon: 'pending' },
  completed:   { label: 'Done',        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',    icon: 'check_circle' },
  cancelled:   { label: 'Cancelled',   color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',            icon: 'cancel' },
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
  cancelled: 'pending',
};

function isOverdue(task: Task) {
  return task.dueDate && task.status !== 'completed' && task.status !== 'cancelled'
    && new Date(task.dueDate) < new Date();
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      <span className="material-icons-outlined text-[18px]">{type === 'success' ? 'check_circle' : 'error_outline'}</span>
      {message}
    </div>
  );
}

export default function TaskManagerClient({
  initialTasks,
  staff,
}: {
  initialTasks: Task[];
  staff: StaffMember[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [search, setSearch] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDue, setNewDue] = useState('');

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDue, setEditDue] = useState('');

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus === 'active' && (t.status === 'completed' || t.status === 'cancelled')) return false;
      if (filterStatus !== 'active' && filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterAssignee && t.assignedTo?._id !== filterAssignee) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [tasks, filterStatus, filterAssignee, search]);

  const counts = useMemo(() => ({
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  }), [tasks]);

  function handleCycleStatus(task: Task) {
    const next = STATUS_CYCLE[task.status];
    startTransition(async () => {
      try {
        await updateAdminTask(task._id, { status: next });
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: next } : t));
      } catch (err: any) {
        showToast(err.message || 'Failed to update task', 'error');
      }
    });
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      try {
        const res = await createAdminTask({
          title: newTitle,
          description: newDesc || undefined,
          assignedTo: newAssignee || undefined,
          dueDate: newDue || undefined,
        });
        const assignee = staff.find(s => s._id === newAssignee);
        const task = {
          ...res.task,
          assignedTo: assignee ? { _id: assignee._id, fullName: assignee.fullName, email: assignee.email } : null,
        };
        setTasks(prev => [task, ...prev]);
        setNewTitle(''); setNewDesc(''); setNewAssignee(''); setNewDue('');
        setShowCreate(false);
        showToast('Task created.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to create task', 'error');
      }
    });
  }

  function startEdit(task: Task) {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditAssignee(task.assignedTo?._id || '');
    setEditDue(task.dueDate ? task.dueDate.split('T')[0] : '');
  }

  function handleSaveEdit(task: Task) {
    startTransition(async () => {
      try {
        await updateAdminTask(task._id, {
          title: editTitle,
          description: editDesc || undefined,
          assignedTo: editAssignee || null,
          dueDate: editDue || null,
        });
        const assignee = staff.find(s => s._id === editAssignee);
        setTasks(prev => prev.map(t => t._id === task._id ? {
          ...t,
          title: editTitle,
          description: editDesc || undefined,
          assignedTo: assignee ? { _id: assignee._id, fullName: assignee.fullName, email: assignee.email } : null,
          dueDate: editDue ? new Date(editDue).toISOString() : undefined,
        } : t));
        setEditingId(null);
        showToast('Task updated.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update task', 'error');
      }
    });
  }

  function handleDelete(taskId: string) {
    if (!confirm('Delete this task?')) return;
    startTransition(async () => {
      try {
        await deleteAdminTask(taskId);
        setTasks(prev => prev.filter(t => t._id !== taskId));
        showToast('Task deleted.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete task', 'error');
      }
    });
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: counts.pending, color: 'text-gray-600 dark:text-gray-400' },
          { label: 'In Progress', value: counts.in_progress, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Completed', value: counts.completed, color: 'text-green-600 dark:text-green-400' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-600 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
        >
          <option value="active">Active tasks</option>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
        >
          <option value="">All assignees</option>
          {staff.map(s => (
            <option key={s._id} value={s._id}>{s.fullName || s.email}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreate(v => !v)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">{showCreate ? 'close' : 'add'}</span>
          {showCreate ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-[#27272a] p-5 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/20 shadow-sm space-y-4 animate-in zoom-in-95 duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Title *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title..." className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="Optional details..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Assign To</label>
              <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} className={inputCls}>
                <option value="">Unassigned</option>
                {staff.map(s => <option key={s._id} value={s._id}>{s.fullName || s.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Due Date</label>
              <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className={inputCls} />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim() || isPending}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            {isPending ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 py-14 text-center">
            <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">task_alt</span>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No tasks found.</p>
          </div>
        ) : filtered.map(task => {
          const cfg = STATUS_CONFIG[task.status];
          const overdue = isOverdue(task);
          const isEditing = editingId === task._id;

          return (
            <div
              key={task._id}
              className={`bg-white dark:bg-[#27272a] rounded-2xl border shadow-sm transition-all ${
                overdue ? 'border-red-200 dark:border-red-900/40' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              {isEditing ? (
                <div className="p-4 space-y-3">
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputCls} />
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={editAssignee} onChange={e => setEditAssignee(e.target.value)} className={inputCls}>
                      <option value="">Unassigned</option>
                      {staff.map(s => <option key={s._id} value={s._id}>{s.fullName || s.email}</option>)}
                    </select>
                    <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(task)} disabled={isPending} className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-start gap-4">
                  {/* Status toggle button */}
                  <button
                    onClick={() => handleCycleStatus(task)}
                    disabled={isPending}
                    title={`Mark as ${STATUS_CYCLE[task.status]}`}
                    className="mt-0.5 shrink-0 text-gray-400 hover:text-brand-primary transition-colors disabled:opacity-40"
                  >
                    <span className="material-icons-outlined text-[22px]">{cfg.icon}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                        <button onClick={() => startEdit(task)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <span className="material-icons-outlined text-[15px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(task._id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <span className="material-icons-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      {task.assignedTo ? (
                        <span className="flex items-center gap-1">
                          <span className="material-icons-outlined text-[13px]">person</span>
                          {task.assignedTo.fullName || task.assignedTo.email}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">Unassigned</span>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                          <span className="material-icons-outlined text-[13px]">{overdue ? 'warning' : 'schedule'}</span>
                          {overdue ? 'Overdue · ' : 'Due '}
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 ml-auto">
                        <span className="material-icons-outlined text-[13px]">calendar_today</span>
                        {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
