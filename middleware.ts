import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const refCode = nextUrl.searchParams.get('ref');
  
  console.log(`[Middleware] Request: ${nextUrl.pathname}${refCode ? ` | Ref: ${refCode}` : ''}`);

  // 1. Handle Referral Tracking
  if (refCode) {
    const response = NextResponse.next();
    response.cookies.set('leo_partner_ref', refCode, {
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
      sameSite: 'lax',
    });
    console.log(`[Middleware] Set ref cookie: ${refCode}`);

    // Fire and forget tracking API call
    fetch(`${nextUrl.origin}/api/tracking/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        refCode, 
        userAgent: req.headers.get('user-agent') || '', 
        ip: req.headers.get('x-forwarded-for') || '' 
      })
    }).catch((err) => console.error('[Middleware] Failed to track referral click:', err));

    return response;
  }

  // NextAuth handles the rest based on authConfig.callbacks.authorized
  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
