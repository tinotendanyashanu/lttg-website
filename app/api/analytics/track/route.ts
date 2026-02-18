import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import crypto from 'crypto';
import geoip from 'geoip-lite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, sessionId } = body;

    if (!path || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Get IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    
    // Handle localhost/private IPs in production (optional fallback if behind unknown proxy)
    // For 'production ready', we trust the x-forwarded-for from the load balancer.
    // Ensure we don't try to lookup '::1' or '127.0.0.1' which returns null.
    if (ip === '::1' || ip === '127.0.0.1') {
        ip = '8.8.8.8'; // Mock IP for local testing so we see data, but in prod it uses real IP
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Hash IP for GDPR compliance (Visitor ID)
    const visitorId = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}-${new Date().toISOString().split('T')[0]}`) 
      .digest('hex');

    // GeoIP Lookup
    const geo = geoip.lookup(ip);
    
    await Analytics.create({
      path,
      visitorId,
      sessionId,
      userAgent,
      country: geo?.country,
      region: geo?.region,
      city: geo?.city
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
