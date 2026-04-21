'use server';

import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { InvitationToken } from '@/models/InvitationToken';
import { ActivityLog } from '@/models/ActivityLog';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const PasswordSetupSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function validateOnboardingToken(token: string) {
  await dbConnect();
  
  const invite = await InvitationToken.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  
  if (!invite) {
    return { valid: false, message: 'Invalid or expired invitation link.' };
  }
  
  return { valid: true, email: invite.email, fullName: invite.fullName };
}

export async function setupUserPassword(rawData: any) {
  await dbConnect();
  
  const result = PasswordSetupSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  
  const { token, password } = result.data;
  
  const invite = await InvitationToken.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  if (!invite) {
    return { success: false, message: 'Invalid or expired invitation link.' };
  }
  
  const account = await Account.findOne({ email: invite.email });
  if (!account) {
    return { success: false, message: 'Account not found.' };
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Update account
  account.passwordHash = passwordHash;
  account.passwordSetupRequired = false;
  account.isActive = true;
  await account.save();
  
  // Mark token as used
  invite.used = true;
  await invite.save();
  
  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'password_setup_complete',
    newValue: `User ${account.email} completed account setup`,
  });
  
  return { success: true, message: 'Account setup complete. You can now log in.' };
}
