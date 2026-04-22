'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { ActivityLog } from '@/models/ActivityLog';
import { InvitationToken } from '@/models/InvitationToken';
import { Team } from '@/models/Team';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { calculatePerformanceMetrics } from '@/lib/services/performance';
import { z } from 'zod';
import { headers } from 'next/headers';

const UserUpdateSchema = z.object({
  roles: z.array(z.string()).optional(),
  teamId: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
});

const UserCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

export async function getAdminTeams() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const teams = await Team.find({ isActive: true }).sort({ name: 1 }).lean();
  return { success: true, teams: JSON.parse(JSON.stringify(teams)) };
}

export async function getAdminUsers() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const users = await Account.find({ roles: { $nin: ['client'] } }).sort({ createdAt: -1 }).lean();

  // Enhance users with performance data
  const enhancedUsers = await Promise.all(users.map(async (user: any) => {
    // Only calculate performance for roles that are expected to have targets (employee, intern)
    const hasTargets = user.roles.some((r: string) => ['employee', 'intern'].includes(r));
    let performance = null;
    
    if (hasTargets) {
      try {
        performance = await calculatePerformanceMetrics(user._id.toString());
      } catch (err) {
        console.error(`Error calculating performance for user ${user._id}:`, err);
      }
    }

    return {
      ...user,
      performance
    };
  }));

  return { success: true, users: JSON.parse(JSON.stringify(enhancedUsers)) };
}

export async function updateAdminUser(userId: string, rawData: z.infer<typeof UserUpdateSchema>) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const adminAccount = await getAccountByEmail(session.user.email);
  if (!adminAccount || !adminAccount.roles.includes('admin')) throw new Error('Unauthorized');

  const validatedData = UserUpdateSchema.parse(rawData);

  const user = await Account.findByIdAndUpdate(userId, { $set: validatedData }, { new: true });
  if (!user) throw new Error('User not found');

  await ActivityLog.create({
    actorAccountId: adminAccount._id,
    targetEntityId: user._id,
    targetEntityType: 'user',
    actionType: 'user_updated',
    newValue: `User settings updated for ${user.email}`,
    metadata: validatedData,
  });

  return { success: true };
}

/**
 * Professional Invitation Flow:
 * Creates an invitation token and a "pending" account.
 * Real password setup happens via the invitation link.
 */
export async function createAdminUser(rawData: z.infer<typeof UserCreateSchema>) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const adminAccount = await getAccountByEmail(session.user.email);
  if (!adminAccount || !adminAccount.roles.includes('admin')) throw new Error('Unauthorized');

  const data = UserCreateSchema.parse(rawData);

  // Check if user already exists
  const existing = await Account.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('Account with this email already exists');

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  // Create invitation
  await InvitationToken.create({
    email: data.email.toLowerCase(),
    fullName: data.fullName,
    roles: data.roles,
    token,
    expiresAt,
    invitedBy: adminAccount._id,
  });

  // Create placeholder account with random password (to be reset during onboarding)
  // This ensures the account exists for team/commission assignments immediately.
  const tempPassHash = await bcrypt.hash(crypto.randomBytes(20).toString('hex'), 10);
  
  const newUser = await Account.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    roles: data.roles,
    passwordHash: tempPassHash,
    isActive: true,
    passwordSetupRequired: true,
  });

  await ActivityLog.create({
    actorAccountId: adminAccount._id,
    targetEntityId: newUser._id,
    targetEntityType: 'user',
    actionType: 'user_invited',
    newValue: `Invitation sent to ${newUser.email}`,
  });

  // In a real production system, you would send an email here via Resend/Postmark
  // For this environment, we return the link for the admin to share or for us to test.
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  if (!baseUrl) {
    const host = (await headers()).get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    baseUrl = `${protocol}://${host}`;
  }
  const inviteLink = `${baseUrl}/portal/onboarding/${token}`;

  return { 
    success: true, 
    inviteLink,
    message: 'User invited successfully. Share the onboarding link with them.'
  };
}

export async function resetAdminUserPassword(userId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const adminAccount = await getAccountByEmail(session.user.email);
  if (!adminAccount || !adminAccount.roles.includes('admin')) throw new Error('Unauthorized');

  const user = await Account.findById(userId);
  if (!user) throw new Error('User not found');

  // Instead of a temp password, we generate a Password Reset Link flow
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Reuse InvitationToken or a separate ResetToken? Let's use Invitation logic for simplicity in this MVP
  await InvitationToken.create({
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    token,
    expiresAt,
    invitedBy: adminAccount._id,
  });

  await ActivityLog.create({
    actorAccountId: adminAccount._id,
    targetEntityId: user._id,
    targetEntityType: 'user',
    actionType: 'password_reset_initiated',
    newValue: `Password reset link generated for ${user.email}`,
  });

  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  if (!baseUrl) {
    const host = (await headers()).get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    baseUrl = `${protocol}://${host}`;
  }
  const resetLink = `${baseUrl}/portal/onboarding/${token}`;

  return { success: true, resetLink };
}
