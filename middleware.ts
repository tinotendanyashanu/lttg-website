import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// Simple in-memory rate limiting for demonstration/basic protection.
// Note: In a multi-instance production environment, use Upstash or Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export default auth((req) => {
  const { nextUrl } = req;
  // x-forwarded-for may be a comma-separated list; the first value is the client IP.
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

  // Admin access is now controlled via OTP verification for unknown IPs.
  // Trusted IPs (stored in Account.trustedIps) bypass email verification but still require password + OTP.
  // No IP blocking at the middleware level.
  
  // Rate Limiting Logic
  const now = Date.now();
  const rateLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };
  
  if (now - rateLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimit.count = 1;
    rateLimit.lastReset = now;
  } else {
    rateLimit.count++;
  }
  
  rateLimitMap.set(ip, rateLimit);
  
  if (rateLimit.count > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const refCode = nextUrl.searchParams.get('ref');
  
  // Forward the current pathname as a header so server components (layouts) can read it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', nextUrl.pathname);

  // 1. Handle Referral Tracking
  if (refCode) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set('leo_partner_ref', refCode, {
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    // Fire and forget tracking API call
    fetch(`${nextUrl.origin}/api/tracking/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        refCode, 
        userAgent: req.headers.get('user-agent') || '', 
        ip 
      })
    }).catch(() => {
      // Silently fail in production
    });

    return response;
  }

  // NextAuth handles the rest based on authConfig.callbacks.authorized
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  // Apply to all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.html$|.*\\.svg$).*)'],
};
