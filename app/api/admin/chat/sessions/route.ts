import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !['admin', 'employee'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 30;

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (status && ['bot', 'pending_human', 'human_active', 'resolved'].includes(status)) {
      filter.status = status;
    }

    const [sessions, total] = await Promise.all([
      ChatSession.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('sessionId visitorName visitorEmail status messages assignedEmployeeName updatedAt createdAt')
        .lean(),
      ChatSession.countDocuments(filter),
    ]);

    const mapped = (sessions as any[]).map(s => ({
      _id: String(s._id),
      sessionId: s.sessionId,
      visitorName: s.visitorName || 'Anonymous',
      visitorEmail: s.visitorEmail || null,
      status: s.status,
      messageCount: s.messages?.length || 0,
      lastMessage: s.messages?.at(-1)?.content?.slice(0, 100) || '',
      assignedEmployeeName: s.assignedEmployeeName || null,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ sessions: mapped, total, page });
  } catch (err) {
    console.error('Chat sessions list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
