import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { LoginSchema } from '@/lib/schemas';
import { authConfig } from './auth.config';
import { z } from 'zod';

// Augment NextAuth types
declare module 'next-auth' {
  interface User {
    role?: 'partner' | 'admin';
    tier?: string;
    id?: string;
  }
  interface Session {
    user: {
      role?: 'partner' | 'admin';
      tier?: string;
      id?: string;
    } & import('next-auth').DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'partner' | 'admin';
    tier?: string;
    id?: string;
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);


        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(`[Auth] Attempting login for: ${email}`);
          
          await dbConnect();
          const user = await Partner.findOne({ email });
          
          if (!user) {
            console.log(`[Auth] User not found: ${email}`);
            return null;
          }
          
          console.log(`[Auth] User found: ${user.email}, Role: ${user.role}, Status: ${user.status}`);

          // If user has no password (e.g. strict OAuth or legacy), return null for credentials provider
          if (!user.password) {
             console.log(`[Auth] User has no password set.`);
             return null;
          }

          // Check if user is active
          if (user.status !== 'active') {
             console.log(`[Auth] User ${email} is not active. Status: ${user.status}`);
             return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            console.log(`[Auth] Password match success.`);
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              tier: user.tier,
            };
          } else {
            console.log(`[Auth] Password mismatch.`);
          }
        } else {
            console.log(`[Auth] Invalid credentials format.`);
        }
        
        return null;
      },
    }),
  ],
});
