import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';
import { getBotResponse } from '@/lib/chatbot';

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    const safeMessage = message.trim().slice(0, 1000);

    await dbConnect();

    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, status: 'bot', messages: [] });
    }

    // If handed to human, only accept replies via /api/chat/reply
    if (session.status === 'human_active' || session.status === 'pending_human') {
      return NextResponse.json({ handedOff: true, status: session.status });
    }

    const visitorMessageCount = session.messages.filter((m: { role: string }) => m.role === 'visitor').length;

    session.messages.push({ role: 'visitor', content: safeMessage, timestamp: new Date() });

    const botReply = await getBotResponse(safeMessage, visitorMessageCount);

    session.messages.push({ role: 'bot', content: botReply.content, timestamp: new Date() });
    await session.save();

    return NextResponse.json({
      reply: botReply.content,
      actions: botReply.actions,
      shouldEscalate: botReply.shouldEscalate,
      status: session.status,
    });
  } catch (err) {
    console.error('Chat message error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
