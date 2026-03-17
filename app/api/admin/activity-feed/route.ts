import { NextResponse } from 'next/server';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((r: string) => ['admin', 'employee'].includes(r))) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await dbConnect();
  const { ActivityLog } = await import('@/models/ActivityLog');

  const logs = await ActivityLog.find()
    .populate('actorAccountId', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const notifications = (logs as any[]).map(log => ({
    _id: String(log._id),
    actionType: log.actionType,
    newValue: log.newValue,
    previousValue: log.previousValue,
    actor: log.actorAccountId?.fullName || log.actorAccountId?.email || null,
    createdAt: log.createdAt,
    caseId: log.caseId ? String(log.caseId) : null,
  }));

  return NextResponse.json({ notifications });
}
