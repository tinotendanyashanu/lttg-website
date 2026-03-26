'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { AdminLoginToken } from '@/models/AdminLoginToken';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { headers } from 'next/headers';

/**
 * Step 1: Validate admin password → generate OTP → send to admin email → redirect to verify page.
 * Called as a form action from /admin/login.
 */
export async function initiateAdminLogin(
  prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const password = (formData.get('password') as string | null)?.trim() ?? '';

  if (!password) {
    return { error: 'Password is required.' };
  }

  await dbConnect();

  // Find all active admin accounts and check the password
  // No projection restriction — passwordHash must always be present
  const adminAccounts = await Account.find({
    roles: 'admin',
    isActive: true,
  }).lean();

  let matchedAccountId: string | null = null;
  let matchedEmail: string | null = null;

  for (const account of adminAccounts) {
    if (!account.passwordHash) continue;
    const match = await bcrypt.compare(password, account.passwordHash);
    if (match) {
      matchedAccountId = account._id.toString();
      matchedEmail = account.email; // comes from DB — never hardcoded
      break;
    }
  }

  // Always take the same amount of time to prevent timing-based enumeration
  if (!matchedAccountId || !matchedEmail) {
    await bcrypt.compare(password, '$2b$10$Kj3QxYWmE5OjzGgH.xZbYuJCYDHSOa9xHPNYGmvBxqVBJiXTgTqZW');
    return { error: 'Invalid password.' };
  }

  // Attempt to get request IP
  let ip: string | undefined;
  try {
    const headersList = await headers();
    ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? headersList.get('x-real-ip') ?? undefined;
  } catch {
    // headers() not available in this context, skip IP
  }

  // Check if this IP has been verified before for this account
  const matchedAccount = adminAccounts.find(a => a._id.toString() === matchedAccountId);
  const ipIsTrusted = ip && matchedAccount?.trustedIps?.includes(ip);

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);

  // Store token with 10-minute expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const token = await AdminLoginToken.create({
    accountId: matchedAccountId,
    otpHash,
    expiresAt,
    used: false,
    requestIp: ip,
  });

  if (ipIsTrusted) {
    // Known IP — skip email verification, sign in directly
    await signIn('adminOtp', { tokenId: token._id.toString(), otp, redirectTo: '/admin' });
    // signIn throws NEXT_REDIRECT on success; this line is unreachable
    return { error: '' };
  }

  // Unknown IP — send OTP to email and redirect to verify page
  await sendEmail({
    to: matchedEmail,
    subject: '🔐 Admin Panel Login Code',
    html: EmailTemplates.adminLoginOTP(otp, ip),
  });

  redirect(`/admin/login/verify?t=${token._id.toString()}`);
}

/**
 * Step 2: Verify OTP → create NextAuth session → redirect to /admin.
 * Called as a form action from /admin/login/verify.
 */
export async function verifyAdminOTP(
  prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const tokenId = (formData.get('tokenId') as string | null)?.trim() ?? '';
  const otp = (formData.get('otp') as string | null)?.replace(/\s/g, '') ?? '';

  if (!tokenId || !/^\d{6}$/.test(otp)) {
    return { error: 'Invalid verification code.' };
  }

  try {
    // signIn throws NEXT_REDIRECT on success (Next.js handles as navigation)
    // or throws CredentialsSignin on failure
    await signIn('adminOtp', { tokenId, otp, redirectTo: '/admin' });
  } catch (error) {
    // Re-throw NEXT_REDIRECT so Next.js can handle the navigation
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if ((error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw error;

    if (error instanceof AuthError) {
      return { error: 'Invalid or expired verification code.' };
    }
    return { error: 'Something went wrong. Please try again.' };
  }

  return { error: 'Invalid or expired verification code. Please try again.' };
}
