import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { CaseCommission } from '@/models/CaseCommission';
import { CommissionAllocation } from '@/models/CommissionAllocation';
import { ActivityLog } from '@/models/ActivityLog';
import { auth } from '@/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const session = await auth();
    
    if (!session || session.user?.role !== 'admin') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { totalCommission: passedComm } = await req.json();

    const caseDoc = await Case.findById(id);
    if (!caseDoc) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    if (caseDoc.status === 'closed') {
       return NextResponse.json({ error: 'Case is already closed' }, { status: 400 });
    }

    if (!caseDoc.dealValue || caseDoc.dealValue <= 0) {
       return NextResponse.json({ error: 'Valid deal value required to close case' }, { status: 400 });
    }

    if (!caseDoc.participants || caseDoc.participants.length === 0) {
       return NextResponse.json({ error: 'Case must have at least one participant' }, { status: 400 });
    }

    const participantCount = caseDoc.participants.length;
    
    // Default 10% calculation or use passed amount
    const totalCommission = typeof passedComm === 'number' ? passedComm : (caseDoc.dealValue * 0.10);
    const commissionPerPerson = totalCommission / participantCount;

    const commissionRecord = new CaseCommission({
       caseId: caseDoc._id,
       totalCommission,
       status: 'pending'
    });
    await commissionRecord.save();

    for (const participantId of caseDoc.participants) {
       await CommissionAllocation.create({
          caseCommissionId: commissionRecord._id,
          accountId: participantId,
          allocatedAmount: commissionPerPerson,
          status: 'pending'
       });
    }

    caseDoc.status = 'closed';
    caseDoc.closedAt = new Date();
    await caseDoc.save();

    await ActivityLog.create({
       caseId: caseDoc._id,
       actorAccountId: session.user.id,
       actionType: 'case_closed'
    });

    return NextResponse.json({ message: 'Case closed successfully', case: caseDoc, commission: commissionRecord }, { status: 200 });

  } catch (error) {
     console.error(error);
     return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
