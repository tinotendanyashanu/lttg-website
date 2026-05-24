import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();
    const authUser = authSession?.user as { role?: string } | undefined;
    const role = authUser?.role;
    if (!authUser || !['admin', 'employee'].includes(role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const chatSession = await ChatSession.findByIdAndUpdate(
      id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!chatSession) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Chat resolve error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
