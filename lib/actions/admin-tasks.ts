'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

const ALLOWED_ROLES = ['admin', 'employee'];

async function requireStaff() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((r: string) => ALLOWED_ROLES.includes(r)))
    throw new Error('Unauthorized');
  return account;
}

export async function getAdminTasks(filters?: {
  assignedTo?: string;
  status?: string;
  relatedCaseId?: string;
}) {
  await requireStaff();
  await dbConnect();
  const { Task } = await import('@/models/Task');
  const { Account } = await import('@/models/Account');

  const query: Record<string, unknown> = {};
  if (filters?.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters?.status) query.status = filters.status;
  if (filters?.relatedCaseId) query.relatedCaseId = filters.relatedCaseId;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'fullName email')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  // Also return staff list for assignment dropdown
  const staff = await Account.find(
    { roles: { $in: ALLOWED_ROLES }, isActive: { $ne: false } },
    'fullName email roles',
  ).sort({ fullName: 1 }).lean();

  return {
    tasks: JSON.parse(JSON.stringify(tasks)),
    staff: JSON.parse(JSON.stringify(staff)),
  };
}

export async function createAdminTask(data: {
  title: string;
  description?: string;
  assignedTo?: string;
  relatedCaseId?: string;
  dueDate?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}) {
  await requireStaff();
  await dbConnect();
  const { Task } = await import('@/models/Task');

  if (!data.title?.trim()) throw new Error('Title is required');

  const task = await Task.create({
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    assignedTo: data.assignedTo || undefined,
    relatedCaseId: data.relatedCaseId || undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    status: 'pending',
  });

  revalidatePath('/portal/admin/tasks');
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function updateAdminTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    assignedTo?: string | null;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dueDate?: string | null;
  },
) {
  await requireStaff();
  await dbConnect();
  const { Task } = await import('@/models/Task');

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title.trim();
  if (data.description !== undefined) update.description = data.description?.trim() || undefined;
  if (data.assignedTo !== undefined) update.assignedTo = data.assignedTo || null;
  if (data.status !== undefined) update.status = data.status;
  if (data.dueDate !== undefined) update.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const task = await Task.findByIdAndUpdate(taskId, { $set: update }, { new: true })
    .populate('assignedTo', 'fullName email')
    .lean();
  if (!task) throw new Error('Task not found');

  revalidatePath('/portal/admin/tasks');
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function deleteAdminTask(taskId: string) {
  await requireStaff();
  await dbConnect();
  const { Task } = await import('@/models/Task');

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new Error('Task not found');

  revalidatePath('/portal/admin/tasks');
  return { success: true };
}
