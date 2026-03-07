import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { LoginSchema } from '@/lib/schemas';
import { authConfig } from './auth.config';
import { AdminLoginToken } from '@/models/AdminLoginToken';

// Augment NextAuth types with custom fields
// Note: Using 'isEmailVerified' (boolean) as a separate field to avoid conflicting
// with NextAuth's built-in 'emailVerified' (Date | null) type.
declare module 'next-auth' {
  interface User {
    role?: 'partner' | 'admin' | 'employee' | 'intern' | 'client';
    tier?: string;
    id?: string;
    isEmailVerified?: boolean;
  }
  interface Session {
    user: {
      role?: 'partner' | 'admin' | 'employee' | 'intern' | 'client';
      tier?: string;
      id?: string;
      isEmailVerified?: boolean;
    } & import('next-auth').DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'partner' | 'admin' | 'employee' | 'intern' | 'client';
    tier?: string;
    id?: string;
    isEmailVerified?: boolean;
  }
}

const nextAuthResult = NextAuth({
  ...authConfig,
  providers: [
    // Standard credentials login (partners + portal staff)
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          let { email, password, loginSource } = parsedCredentials.data;
          email = email.toLowerCase();

          await dbConnect();

          // 1. Check Partner collection (partner login)
          if (!loginSource || loginSource === 'partner') {
            const user = await Partner.findOne({ email });

            if (user && user.password && user.status === 'active') {
              const passwordsMatch = await bcrypt.compare(password, user.password);
              if (passwordsMatch) {
                if (!user.emailVerified) {
                  throw new Error('EMAIL_NOT_VERIFIED');
                }
                return {
                  id: user._id.toString(),
                  name: user.name,
                  email: user.email,
                  role: user.role || 'partner',
                  tier: user.tier,
                  isEmailVerified: user.emailVerified,
                };
              }
            }
          }

          // 2. Check Account collection (admins, employees, interns, clients)
          if (!loginSource || loginSource === 'portal') {
            const { Account } = await import('@/models/Account');
            const accountUser = await Account.findOne({ email });

            if (accountUser && accountUser.isActive) {
              const passwordsMatch = await bcrypt.compare(password, accountUser.passwordHash);
              if (passwordsMatch) {
                let primaryRole: 'admin' | 'employee' | 'intern' | 'client' = 'intern';
                if (accountUser.roles.includes('admin')) primaryRole = 'admin';
                else if (accountUser.roles.includes('employee')) primaryRole = 'employee';
                else if (accountUser.roles.includes('client')) primaryRole = 'client';

                return {
                  id: accountUser._id.toString(),
                  name: accountUser.fullName,
                  email: accountUser.email,
                  role: primaryRole,
                  isEmailVerified: true,
                };
              }
            }
          }

          return null;
        }

        return null;
      },
    }),

    // Admin 2-step OTP login — verifies a time-limited one-time code sent to the admin email
    Credentials({
      id: 'adminOtp',
      async authorize(credentials) {
        const { tokenId, otp } = (credentials ?? {}) as { tokenId?: string; otp?: string };
        if (!tokenId || !otp || !/^\d{6}$/.test(otp)) return null;

        await dbConnect();
        const { Account } = await import('@/models/Account');

        const token = await AdminLoginToken.findById(tokenId);
        if (!token || token.used || token.expiresAt < new Date()) return null;

        const otpValid = await bcrypt.compare(otp, token.otpHash);
        if (!otpValid) return null;

        // Mark token used before issuing session
        await AdminLoginToken.findByIdAndUpdate(tokenId, { used: true });

        const account = await Account.findById(token.accountId);
        if (!account || !account.isActive || !account.roles.includes('admin')) return null;

        return {
          id: account._id.toString(),
          name: account.fullName,
          email: account.email,
          role: 'admin' as const,
          isEmailVerified: true,
        };
      },
    }),
  ],
});

export const { auth, signIn, signOut, handlers } = nextAuthResult;
