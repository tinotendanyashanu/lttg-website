import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId || sessionId.length > 100) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    await dbConnect();
    const session = await ChatSession.findOne({ sessionId })
      .select('status messages visitorName assignedEmployeeName updatedAt')
      .lean();

    if (!session) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error('Chat session GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
