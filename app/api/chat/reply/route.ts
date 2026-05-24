import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';
import { sendAdminNotification } from '@/lib/email';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://leothetechguy.com';

export async function POST(request: Request) {
  try {
    const { sessionId, content } = await request.json();

    if (!sessionId || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const safeContent = content.trim().slice(0, 2000);
    if (!safeContent) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

    await dbConnect();

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    session.messages.push({
      role: 'visitor',
      content: safeContent,
      senderName: session.visitorName,
      timestamp: new Date(),
    });

    // Re-notify employee if they haven't been notified recently (>2 hours)
    const twoHours = 2 * 60 * 60 * 1000;
    const shouldNotify =
      !session.employeeNotifiedAt ||
      Date.now() - session.employeeNotifiedAt.getTime() > twoHours;

    if (shouldNotify) {
      session.employeeNotifiedAt = new Date();
      const sessionUrl = `${SITE_URL}/portal/employee/chat/${session._id}`;
      await sendAdminNotification({
        subject: `💬 ${session.visitorName || 'Visitor'} replied in chat`,
        text: `${session.visitorName || 'Visitor'} (${session.visitorEmail || 'no email'}) sent a new message.\n\nReply: ${sessionUrl}`,
      }).catch(() => {});
    }

    await session.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Chat reply error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
