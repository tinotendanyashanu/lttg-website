import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { auth } from '@/auth';
import { ActivityLog } from '@/models/ActivityLog';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseDoc = await Case.findById(id)
      .populate('ownerId', 'fullName email profileImageUrl')
      .populate('participants', 'fullName email profileImageUrl');

    if (!caseDoc) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && 
        caseDoc.ownerId._id.toString() !== session.user.id &&
        !caseDoc.participants.some((p: any) => p._id.toString() === session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ case: caseDoc }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, dealValue } = await req.json();
    const caseDoc = await Case.findById(id);

    if (!caseDoc) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    
    if (caseDoc.status === 'closed') {
      return NextResponse.json({ error: 'Cannot modify closed case' }, { status: 400 });
    }

    if (session.user.role === 'intern') {
      return NextResponse.json({ error: 'Interns cannot modify fields directly' }, { status: 403 });
    }

    if (session.user.role === 'employee') {
      if (!caseDoc.participants.includes(session.user.id as any)) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (dealValue && dealValue !== caseDoc.dealValue) {
         return NextResponse.json({ error: 'Employees cannot change deal value' }, { status: 403 });
      }
    }

    const updates: any = {};
    const oldStatus = caseDoc.status;
    if (status && status !== caseDoc.status) updates.status = status;
    if (session.user.role === 'admin' && typeof dealValue === 'number' && dealValue !== caseDoc.dealValue) {
       updates.dealValue = dealValue;
    }

    if (Object.keys(updates).length > 0) {
      Object.assign(caseDoc, updates);
      await caseDoc.save();

      if (updates.status) {
         await ActivityLog.create({
            caseId: caseDoc._id,
            actorAccountId: session.user.id,
            actionType: 'status_changed',
            previousValue: oldStatus,
            newValue: status,
         });
      }
    }

    return NextResponse.json({ case: caseDoc }, { status: 200 });

  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await Case.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
