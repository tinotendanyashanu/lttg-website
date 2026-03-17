'use server';

import { auth } from '@/auth';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

const STAFF_ROLES = ['admin', 'employee', 'intern'];

async function getActor() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account) throw new Error('Account not found');
  return account;
}

export async function getCaseMessages(caseId: string) {
  await dbConnect();
  const CaseMessage = (await import('@/models/CaseMessage')).default;
  const messages = await CaseMessage.find({ caseId })
    .populate('authorId', 'fullName email roles')
    .sort({ createdAt: 1 })
    .lean();
  return JSON.parse(JSON.stringify(messages));
}

export async function sendCaseMessage(caseId: string, body: string) {
  const actor = await getActor();
  await dbConnect();
  const CaseMessage = (await import('@/models/CaseMessage')).default;
  const { Case } = await import('@/models/Case');

  if (!body?.trim()) throw new Error('Message body is required');
  if (body.length > 4000) throw new Error('Message too long');

  const caseDoc = await Case.findById(caseId).lean();
  if (!caseDoc) throw new Error('Case not found');

  const isStaff = actor.roles.some((r: string) => STAFF_ROLES.includes(r));
  const isClient = actor.roles.includes('client');

  if (!isStaff && !isClient) throw new Error('Unauthorized');

  // Determine author role (most privileged)
  let authorRole: 'client' | 'admin' | 'employee' | 'intern' = 'client';
  if (actor.roles.includes('admin')) authorRole = 'admin';
  else if (actor.roles.includes('employee')) authorRole = 'employee';
  else if (actor.roles.includes('intern')) authorRole = 'intern';

  const msg = await CaseMessage.create({
    caseId,
    authorId: actor._id,
    authorRole,
    body: body.trim(),
    readByAdmin: isStaff,   // staff messages are auto-read by admin
    readByClient: isClient, // client messages are auto-read by client
  });

  // Notify the other party
  try {
    if (isClient) {
      // Notify admin — use ActivityLog for now
      const { ActivityLog } = await import('@/models/ActivityLog');
      await ActivityLog.create({
        caseId,
        actorAccountId: actor._id,
        actionType: 'client_message',
        newValue: body.trim().slice(0, 100) + (body.length > 100 ? '…' : ''),
      });
    }
  } catch (_) { /* Non-blocking */ }

  revalidatePath(`/portal/admin/cases`);
  revalidatePath(`/portal/case-management`);

  return { success: true, message: JSON.parse(JSON.stringify(msg)) };
}

export async function markMessagesRead(caseId: string) {
  const actor = await getActor();
  await dbConnect();
  const CaseMessage = (await import('@/models/CaseMessage')).default;

  const isStaff = actor.roles.some((r: string) => STAFF_ROLES.includes(r));
  const isClient = actor.roles.includes('client');

  if (isStaff) {
    await CaseMessage.updateMany({ caseId, readByAdmin: false }, { $set: { readByAdmin: true } });
  } else if (isClient) {
    await CaseMessage.updateMany({ caseId, readByClient: false }, { $set: { readByClient: true } });
  }

  return { success: true };
}

export async function getUnreadCounts(caseIds: string[]): Promise<Record<string, number>> {
  const actor = await getActor();
  await dbConnect();
  const CaseMessage = (await import('@/models/CaseMessage')).default;

  const isStaff = actor.roles.some((r: string) => STAFF_ROLES.includes(r));
  const field = isStaff ? 'readByAdmin' : 'readByClient';

  const counts = await CaseMessage.aggregate([
    { $match: { caseId: { $in: caseIds.map(id => new (require('mongoose').Types.ObjectId)(id)) }, [field]: false } },
    { $group: { _id: '$caseId', count: { $sum: 1 } } },
  ]);

  const result: Record<string, number> = {};
  for (const c of counts) result[String(c._id)] = c.count;
  return result;
}
