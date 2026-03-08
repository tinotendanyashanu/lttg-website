import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, sessionId } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Get real client IP — trust x-forwarded-for (set by Vercel/Cloudflare/NGINX)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
    let ip = cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

    // Normalise IPv6 loopback for local dev
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = '8.8.8.8'; // fallback for local testing only
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Hash IP+UA+date → anonymous daily VisitorID (GDPR-safe, no PII stored)
    const visitorId = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}-${new Date().toISOString().split('T')[0]}`)
      .digest('hex');

    // GeoIP lookup using geoip-lite (offline MaxMind DB — no external API calls)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let geo: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const geoip = require('geoip-lite');
      geo = geoip.lookup(ip);
    } catch {
      // geoip-lite not available or lookup failed — country/region/city stay null
    }

    await Analytics.create({
      path,
      visitorId,
      sessionId,
      userAgent,
      ip: crypto.createHash('sha256').update(ip).digest('hex'), // store hashed IP only
      country: geo?.country ?? null,
      region: geo?.region ?? null,
      city: geo?.city ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
