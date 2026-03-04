import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { LoginSchema } from '@/lib/schemas';
import { authConfig } from './auth.config';

// Augment NextAuth types with custom fields
// Note: Using 'isEmailVerified' (boolean) as a separate field to avoid conflicting
// with NextAuth's built-in 'emailVerified' (Date | null) type.
declare module 'next-auth' {
  interface User {
    role?: 'partner' | 'admin' | 'employee' | 'intern';
    tier?: string;
    id?: string;
    isEmailVerified?: boolean;
  }
  interface Session {
    user: {
      role?: 'partner' | 'admin' | 'employee' | 'intern';
      tier?: string;
      id?: string;
      isEmailVerified?: boolean;
    } & import('next-auth').DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'partner' | 'admin' | 'employee' | 'intern';
    tier?: string;
    id?: string;
    isEmailVerified?: boolean;
  }
}

const nextAuthResult = NextAuth({
  ...authConfig,
  providers: [
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

          // 2. Check Account collection (admins, employees, interns)
          if (!loginSource || loginSource === 'portal') {
            const { Account } = await import('@/models/Account');
            const accountUser = await Account.findOne({ email });

            if (accountUser && accountUser.isActive) {
              const passwordsMatch = await bcrypt.compare(password, accountUser.passwordHash);
              if (passwordsMatch) {
                let primaryRole: 'admin' | 'employee' | 'intern' = 'intern';
                if (accountUser.roles.includes('admin')) primaryRole = 'admin';
                else if (accountUser.roles.includes('employee')) primaryRole = 'employee';

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
  ],
});

export const { auth, signIn, signOut, handlers } = nextAuthResult;
