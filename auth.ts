import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { LoginSchema } from '@/lib/schemas';
import { authConfig } from './auth.config';

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
          let { email, password } = parsedCredentials.data;
          email = email.toLowerCase();
          
          await dbConnect();
          const user = await Partner.findOne({ email });
          
          if (!user || !user.password || user.status !== 'active') {
             return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              tier: user.tier,
            };
          }
        }
        
        return null;
      },
    }),
  ],
});
