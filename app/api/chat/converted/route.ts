import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';

export async function POST(request: Request) {
  try {
    const { sessionId, event } = await request.json();

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    await dbConnect();

    await ChatSession.findOneAndUpdate(
      { sessionId, converted: { $ne: true } },
      {
        $set: {
          converted: true,
          conversionEvent: String(event || 'cta_click').slice(0, 100),
          convertedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Conversion tracking error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
