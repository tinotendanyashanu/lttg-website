'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { ActivityLog } from '@/models/ActivityLog';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function getAdminUsers() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const users = await Account.find().sort({ createdAt: -1 }).lean();

  return { success: true, users: JSON.parse(JSON.stringify(users)) };
}

export async function updateAdminUser(userId: string, data: { roles?: string[], teamId?: string, commissionRate?: number, isActive?: boolean }) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const adminAccount = await getAccountByEmail(session.user.email);
  if (!adminAccount || !adminAccount.roles.includes('admin')) throw new Error('Unauthorized');

  const user = await Account.findByIdAndUpdate(userId, { $set: data }, { new: true });
  if (!user) throw new Error('User not found');

  await ActivityLog.create({
    actorAccountId: adminAccount._id,
    actionType: 'user_updated',
    newValue: `User ${user.email} updated with new settings`,
  });

  return { success: true };
}

export async function createAdminUser(data: { fullName: string; email: string; roles: string[]; password?: string }) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const tempPassword = data.password || crypto.randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const newUser = await Account.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    roles: data.roles,
    passwordHash,
    isActive: true,
  });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'user_created',
    newValue: `User created: ${newUser.email}. Temp password: ${tempPassword}`,
  });

  return { success: true, tempPassword };
}

export async function resetAdminUserPassword(userId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const tempPassword = crypto.randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await Account.findByIdAndUpdate(userId, { $set: { passwordHash } });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'password_reset_by_admin',
    newValue: `Password reset for user ID: ${userId}`,
  });

  return { success: true, tempPassword };
}
