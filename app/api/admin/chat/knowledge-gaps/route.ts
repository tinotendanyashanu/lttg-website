import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { KnowledgeGapSuggestion } from '@/models/KnowledgeGapSuggestion';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['admin', 'employee'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  await dbConnect();

  const gaps = await KnowledgeGapSuggestion.find({ status })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    KnowledgeGapSuggestion.countDocuments({ status: 'pending' }),
    KnowledgeGapSuggestion.countDocuments({ status: 'approved' }),
    KnowledgeGapSuggestion.countDocuments({ status: 'rejected' }),
  ]);

  return NextResponse.json({
    gaps: JSON.parse(JSON.stringify(gaps)),
    counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
  });
}
