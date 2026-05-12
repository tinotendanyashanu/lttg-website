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
    signIn: '/login',
    newUser: '/partner/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPartnerDashboard = nextUrl.pathname.startsWith('/partner/dashboard');
      const isOnMailDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnPortal = nextUrl.pathname.startsWith('/portal');

      // Specialized login pages
      const isPartnerLogin = nextUrl.pathname === '/partner/login';
      const isStaffLogin = nextUrl.pathname === '/portal/login';
      const isClientLogin = nextUrl.pathname === '/portal/client/login';

      if (isPartnerLogin || isStaffLogin || isClientLogin || nextUrl.pathname === '/login') {
        if (!isLoggedIn) return true;
        if (auth?.user?.role === 'admin') {
          return Response.redirect(new URL('/admin', nextUrl.origin));
        }
        if (auth?.user?.role === 'employee' || auth?.user?.role === 'intern') {
          return Response.redirect(new URL('/portal', nextUrl.origin));
        }
        if (auth?.user?.role === 'client') {
          return Response.redirect(new URL('/portal/client/dashboard', nextUrl.origin));
        }
        return Response.redirect(new URL('/partner/dashboard', nextUrl.origin));
      }

      if (isOnPortal) {
        // Allow unauthenticated access to password setup and reset routes
        if (
          nextUrl.pathname === '/portal/setup-password' ||
          nextUrl.pathname === '/portal/reset-password' ||
          nextUrl.pathname.startsWith('/portal/onboarding/')
        ) {
          return true;
        }

        // Client portal routes — handle separately with client-specific login redirect
        const isOnClientPortal = nextUrl.pathname.startsWith('/portal/client');
        if (isOnClientPortal) {
          if (!isLoggedIn) {
            const loginUrl = new URL('/login', nextUrl.origin);
            loginUrl.searchParams.set('loginSource', 'client_portal');
            return Response.redirect(loginUrl);
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
          return Response.redirect(new URL('/login', nextUrl.origin));
        }

        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl.origin);
          loginUrl.searchParams.set('loginSource', 'portal');
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

      // Gate: if logged in but email not verified, redirect away from partner dashboard
      if (isOnPartnerDashboard) {
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl.origin);
          loginUrl.searchParams.set('loginSource', 'partner');
          return Response.redirect(loginUrl);
        }

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

      if (isOnMailDashboard) {
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl.origin);
          loginUrl.searchParams.set('loginSource', 'portal');
          return Response.redirect(loginUrl);
        }
        if (auth?.user?.role === 'admin' || auth?.user?.role === 'employee') {
          return true;
        }
        return Response.redirect(new URL('/portal', nextUrl.origin));
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
        
        // Redirect to specialized admin login instead of unified login for 2-step verification
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
