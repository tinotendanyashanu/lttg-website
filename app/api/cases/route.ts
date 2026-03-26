import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { Account } from '@/models/Account';
import { auth } from '@/auth';
import { CaseSchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user || !['intern', 'employee', 'admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // 'my_cases', 'participating', 'closed'
    const status = searchParams.get('status');

    const query: any = {};

    if (session.user.role !== 'admin') {
      if (filter === 'my_cases') {
        query.ownerId = session.user.id;
      } else if (filter === 'participating') {
        query.participants = session.user.id;
      } else if (filter === 'closed') {
        query.$or = [{ ownerId: session.user.id }, { participants: session.user.id }];
        query.status = 'closed';
      } else {
        // all visible to user
        query.$or = [{ ownerId: session.user.id }, { participants: session.user.id }];
      }
    } else {
      if (filter === 'my_cases') {
        query.ownerId = session.user.id;
      } else if (filter === 'participating') {
        query.participants = session.user.id;
      } else if (filter === 'closed') {
        query.status = 'closed';
      }
    }

    if (status) query.status = status;

    const cases = await Case.find(query)
      .populate('ownerId', 'fullName email')
      .populate('participants', 'fullName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ cases }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session || !session.user || !['intern', 'employee', 'admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = CaseSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsedData.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { businessName, contactName, email, phone, serviceInterest, dealValue } = parsedData.data;

    const account = await Account.findById(session.user.id);
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // Generate caseId logic
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await Case.countDocuments();
    const paddedNumber = String(count + 1).padStart(6, '0');
    const caseId = `CA${paddedNumber}${year}`;

    const newCase = new Case({
      caseId,
      businessName,
      contactName,
      email,
      phone,
      serviceInterest,
      dealValue,
      status: 'new',
      ownerId: session.user.id,
      participants: [session.user.id],
      teamId: account.teamId,
    });

    await newCase.save();

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
