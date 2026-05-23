import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { KnowledgeGapSuggestion, GapStatus } from '@/models/KnowledgeGapSuggestion';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['admin', 'employee'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminNote } = body;

  const validStatuses: GapStatus[] = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await dbConnect();

  const gap = await KnowledgeGapSuggestion.findByIdAndUpdate(
    id,
    {
      status,
      adminNote: adminNote ? String(adminNote).slice(0, 500) : undefined,
      reviewedAt: new Date(),
    },
    { new: true }
  ).lean();

  if (!gap) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ gap: JSON.parse(JSON.stringify(gap)) });
}
