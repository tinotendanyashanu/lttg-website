import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { auth } from '@/auth';
import { ActivityLog } from '@/models/ActivityLog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
       return NextResponse.json({ error: 'Unauthorized only admins can add participants' }, { status: 401 });
    }

    const { accountId } = await req.json();
    const caseDoc = await Case.findById(id);

    if (!caseDoc) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    if (caseDoc.status === 'closed') return NextResponse.json({ error: 'Case is closed' }, { status: 400 });

    if (!caseDoc.participants.includes(accountId as any)) {
      caseDoc.participants.push(accountId as any);
      await caseDoc.save();

      await ActivityLog.create({
         caseId: caseDoc._id,
         actorAccountId: session.user.id,
         actionType: 'participant_added',
         newValue: accountId
      });
    }

    return NextResponse.json({ case: caseDoc }, { status: 200 });

  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
