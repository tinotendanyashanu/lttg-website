import { NextResponse } from 'next/server';
import { deliverExecSummary } from '@/lib/services/executive-intelligence';

/**
 * Weekly executive AI business summary cron endpoint.
 * Intended to be hit by Vercel Cron (or any scheduler) — e.g. every Monday at 08:00.
 * Builds the cross-business summary and emails every active admin.
 * Secured with the shared CRON_SECRET when configured.
 *
 * Optional ?days=N overrides the trailing window (default 7).
 *
 * Example vercel.json entry:
 *   { "crons": [{ "path": "/api/cron/executive-summary", "schedule": "0 8 * * 1" }] }
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days')) || 7));

    const { recipients, sent, summary } = await deliverExecSummary(days);

    return NextResponse.json({
      success: true,
      windowDays: days,
      recipients,
      sent,
      revenue: summary.revenue.collectedInWindow,
      activeProjects: summary.projects.active,
      openTickets: summary.support.openTickets,
    });
  } catch (error) {
    console.error('Executive Summary Cron Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
