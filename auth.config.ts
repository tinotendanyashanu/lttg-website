import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // Update token every hour to ensure sliding window sessions
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  pages: {
    signIn: '/partner/login',
    newUser: '/partner/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/partner/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnPortal = nextUrl.pathname.startsWith('/portal');

      // If they are on the actual portal login page, do not gate it
      if (nextUrl.pathname === '/portal/login') {
         // Do not auto-redirect to /portal here. If the user's DB account was deleted or their
         // portal roles were removed, but their NextAuth cookie is still active, redirecting
         // them to /portal will bounce them back to /portal/login, causing an infinite loop.
         // Let the portal login page simply render. If they login again, it overwrites the session.
         return true;
      }

      // Client portal login — public, but redirect already-signed-in clients to their dashboard
      if (nextUrl.pathname === '/portal/client/login') {
        if (auth?.user?.role === 'client') {
          return Response.redirect(new URL('/portal/client/dashboard', nextUrl.origin));
        }
        return true;
      }

      if (isOnPortal) {
        // Allow unauthenticated access to password setup and reset routes
        if (
          nextUrl.pathname === '/portal/setup-password' ||
          nextUrl.pathname === '/portal/reset-password'
        ) {
          return true;
        }

        // Client portal routes — handle separately with client-specific login redirect
        const isOnClientPortal = nextUrl.pathname.startsWith('/portal/client');
        if (isOnClientPortal) {
          if (!isLoggedIn) {
            return Response.redirect(new URL('/portal/client/login', nextUrl.origin));
          }
          if (auth?.user?.role === 'client') return true;
          // Internal staff trying to access client portal → redirect to their portal
          if (
            auth?.user?.role === 'admin' ||
            auth?.user?.role === 'employee' ||
            auth?.user?.role === 'intern'
          ) {
            return Response.redirect(new URL('/portal', nextUrl.origin));
          }
          return Response.redirect(new URL('/portal/client/login', nextUrl.origin));
        }

        if (!isLoggedIn) {
          const loginUrl = new URL('/portal/login', nextUrl.origin);
          return Response.redirect(loginUrl);
        }

        // Main portal — internal staff only
        if (
          auth?.user?.role === 'admin' ||
          auth?.user?.role === 'employee' ||
          auth?.user?.role === 'intern'
        ) {
          return true;
        }
        // Clients trying to access main portal → redirect to client portal
        if (auth?.user?.role === 'client') {
          return Response.redirect(new URL('/portal/client/dashboard', nextUrl.origin));
        }
        return false;
      }

      // Gate: if logged in but email not verified, redirect away from dashboard
      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Ensure only partners access the partner dashboard
        if (auth?.user?.role !== 'partner') {
          return false;
        }

        // isEmailVerified is our custom boolean field (separate from NextAuth's Date-typed emailVerified)
        if (!auth?.user?.isEmailVerified) {
          const verifyUrl = new URL('/partner/verify-email', nextUrl.origin);
          return Response.redirect(verifyUrl);
        }
        return true;
      }

      if (isOnAdmin) {
        // Allow admin login pages through without authentication
        const isAdminLoginPage =
          nextUrl.pathname === '/admin/login' ||
          nextUrl.pathname === '/admin/login/verify';

        if (isAdminLoginPage) {
          // Already authenticated admins visiting the login page → send to dashboard
          if (isLoggedIn && auth?.user?.role === 'admin') {
            return Response.redirect(new URL('/admin', nextUrl.origin));
          }
          return true;
        }

        if (isLoggedIn && auth?.user?.role === 'admin') return true;
        return Response.redirect(new URL('/admin/login', nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.accountId = user.accountId;
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
        session.user.accountId = token.accountId as string;
        session.user.tier = token.tier;
        session.user.isEmailVerified = token.isEmailVerified;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
