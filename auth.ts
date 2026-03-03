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
    role?: 'partner' | 'admin' | 'intern';
    tier?: string;
    id?: string;
    isEmailVerified?: boolean;
  }
  interface Session {
    user: {
      role?: 'partner' | 'admin' | 'intern';
      tier?: string;
      id?: string;
      isEmailVerified?: boolean;
    } & import('next-auth').DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'partner' | 'admin' | 'intern';
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
          let { email, password } = parsedCredentials.data;
          email = email.toLowerCase();
          
          await dbConnect();
          const user = await Partner.findOne({ email });
          
          if (!user || !user.password || user.status !== 'active') {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          // Block login if email is not verified — throw a signal the login action will catch
          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'intern',
            tier: user.tier,
            isEmailVerified: user.emailVerified,
          };
        }
        
        return null;
      },
    }),
  ],
});

export const { auth, signIn, signOut, handlers } = nextAuthResult;
