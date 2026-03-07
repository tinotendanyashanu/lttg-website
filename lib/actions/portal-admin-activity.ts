'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { ActivityLog } from '@/models/ActivityLog';

export async function getAdminActivityLogs(limit = 100) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const logs = await ActivityLog.find()
    .populate('actorAccountId', 'email fullName roles')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
}
