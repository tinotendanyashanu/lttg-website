import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/partner/login',
    newUser: '/partner/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isDev = process.env.NODE_ENV === 'development';
      const isLoggedIn = !!auth?.user || isDev;
      const isOnDashboard = nextUrl.pathname.startsWith('/partner/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnPortal = nextUrl.pathname.startsWith('/portal');

      if (isOnPortal) {
        if (!isLoggedIn) return false;
        return true;
      }

      // Gate: if logged in but email not verified, redirect away from dashboard
      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        // isEmailVerified is our custom boolean field (separate from NextAuth's Date-typed emailVerified)
        if (!isDev && !auth?.user?.isEmailVerified) {
          const verifyUrl = new URL('/partner/verify-email', nextUrl.origin);
          return Response.redirect(verifyUrl);
        }
        return true;
      }

      if (isOnAdmin) {
        if (isLoggedIn && (isDev || auth?.user?.role === 'admin')) return true;
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.tier = user.tier;
        // Propagate our custom boolean verification field
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
        session.user.tier = token.tier;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
