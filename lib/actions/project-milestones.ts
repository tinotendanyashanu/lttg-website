'use server';

/**
 * Support Center — project milestones.
 *
 * Lightweight deliverable tracking on a ClientCase, managed by staff from inside
 * a linked ticket and surfaced read-only to the client. Reuses the existing
 * ClientCase model (milestones[] subdocument) and the case timeline for audit —
 * no new collection. Staff-gated (admin + employee). Revalidates the ticket
 * surfaces that show the project so progress updates appear immediately.
 */

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { MILESTONE_STATUSES, type MilestoneStatus } from '@/lib/support/constants';

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee') throw new Error('Unauthorized');
  return session!.user;
}

function actorName(user: { name?: string | null; email?: string | null }): string {
  return user.name || user.email || 'Support Agent';
}

function revalidateForTicket(ticketId?: string) {
  if (ticketId) {
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath(`/portal/employee/support/${ticketId}`);
    revalidatePath(`/portal/client/tickets/${ticketId}`);
  }
}

/** Add a milestone to a case. `ticketId` is only used for cache revalidation. */
export async function addMilestone(
  caseId: string,
  input: { title: string; description?: string; dueDate?: string },
  ticketId?: string,
) {
  const user = await requireStaff();
  const title = (input.title || '').trim();
  if (!title) throw new Error('Milestone title is required');

  await dbConnect();
  const { ClientCase } = await import('@/models/ClientCase');
  const clientCase = await ClientCase.findById(caseId);
  if (!clientCase) throw new Error('Project not found');

  const order = (clientCase.milestones?.length || 0);
  clientCase.milestones.push({
    title: title.slice(0, 160),
    description: input.description?.trim()?.slice(0, 600),
    status: 'pending',
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    order,
    createdAt: new Date(),
  } as any);
  clientCase.timeline.push({
    event: 'milestone_added',
    description: `Milestone added: ${title}`,
    performedBy: user.id as any,
    performedByName: actorName(user),
    createdAt: new Date(),
  } as any);
  await clientCase.save();

  revalidateForTicket(ticketId);
  return { success: true };
}

/** Update a milestone's status (and stamp completion). */
export async function updateMilestoneStatus(
  caseId: string,
  milestoneId: string,
  status: MilestoneStatus,
  ticketId?: string,
) {
  const user = await requireStaff();
  if (!MILESTONE_STATUSES.includes(status)) throw new Error('Invalid status');

  await dbConnect();
  const { ClientCase } = await import('@/models/ClientCase');
  const clientCase = await ClientCase.findById(caseId);
  if (!clientCase) throw new Error('Project not found');

  const milestone = (clientCase.milestones as any).id(milestoneId);
  if (!milestone) throw new Error('Milestone not found');

  milestone.status = status;
  milestone.completedAt = status === 'done' ? new Date() : undefined;
  clientCase.timeline.push({
    event: 'milestone_updated',
    description: `Milestone "${milestone.title}" → ${status.replace('_', ' ')}`,
    performedBy: user.id as any,
    performedByName: actorName(user),
    createdAt: new Date(),
  } as any);
  await clientCase.save();

  revalidateForTicket(ticketId);
  return { success: true };
}

/** Remove a milestone from a case. */
export async function removeMilestone(caseId: string, milestoneId: string, ticketId?: string) {
  const user = await requireStaff();
  await dbConnect();
  const { ClientCase } = await import('@/models/ClientCase');
  const clientCase = await ClientCase.findById(caseId);
  if (!clientCase) throw new Error('Project not found');

  const milestone = (clientCase.milestones as any).id(milestoneId);
  if (!milestone) throw new Error('Milestone not found');
  const title = milestone.title;
  milestone.deleteOne();
  clientCase.timeline.push({
    event: 'milestone_removed',
    description: `Milestone removed: ${title}`,
    performedBy: user.id as any,
    performedByName: actorName(user),
    createdAt: new Date(),
  } as any);
  await clientCase.save();

  revalidateForTicket(ticketId);
  return { success: true };
}
