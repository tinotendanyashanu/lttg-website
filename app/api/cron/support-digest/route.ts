import { NextResponse } from 'next/server';
import { deliverSupportDigest } from '@/lib/services/support-digest';

/**
 * Scheduled executive support digest. Intended to be hit by Vercel Cron (or any
 * scheduler) on a cadence — e.g. weekly. Builds the support digest and emails it
 * to every active admin. Secured with the shared CRON_SECRET when configured.
 *
 * Optional `?days=N` overrides the trailing window (default 7).
 *
 * Example vercel.json:
 *   { "crons": [{ "path": "/api/cron/support-digest", "schedule": "0 8 * * 1" }] }
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 7));

    const { recipients, sent, digest } = await deliverSupportDigest(days);

    return NextResponse.json({
      success: true,
      windowDays: days,
      recipients,
      sent,
      openNow: digest.metrics.openNow,
      slaBreaches:
        digest.metrics.slaFirstResponseBreaches + digest.metrics.slaResolutionBreaches,
    });
  } catch (error) {
    console.error('Support Digest Cron Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
