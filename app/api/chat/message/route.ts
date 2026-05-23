import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ChatSession } from '@/models/ChatSession';

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
      session = await ChatSession.create({ sessionId, status: 'bot', messages: [], leadScore: 0 });
    }

    if (session.status === 'human_active' || session.status === 'pending_human') {
      return NextResponse.json({ handedOff: true, status: session.status });
    }

    const visitorMessageCount = session.messages.filter(
      (m: { role: string }) => m.role === 'visitor'
    ).length;

    session.messages.push({ role: 'visitor', content: safeMessage, timestamp: new Date() });

    let botReply;

    // Try AI first, fall back to regex-based bot if unavailable
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const { getAIBotResponse } = await import('@/lib/ai-chatbot');
        const { getKBContext } = await import('@/lib/chatbot-kb');

        // Build conversation history for AI (visitor ↔ bot turns only)
        const history = session.messages
          .slice(0, -1) // exclude the message we just pushed
          .filter((m: { role: string }) => m.role === 'visitor' || m.role === 'bot')
          .map((m: { role: string; content: string }) => ({
            role: m.role === 'visitor' ? 'user' : 'model' as 'user' | 'model',
            content: m.content,
          }));

        const kbContext = await getKBContext(safeMessage);
        const currentLeadScore = session.leadScore ?? 0;

        const aiResponse = await getAIBotResponse(
          safeMessage,
          history,
          visitorMessageCount,
          currentLeadScore,
          kbContext || undefined
        );

        // Persist lead score update
        session.leadScore = aiResponse.leadScore;

        // Store knowledge gap suggestion asynchronously (don't block the response)
        if (aiResponse.detectedGap && aiResponse.gapTitle && aiResponse.gapSuggestedContent) {
          import('@/models/KnowledgeGapSuggestion').then(({ KnowledgeGapSuggestion }) => {
            KnowledgeGapSuggestion.create({
              sessionId,
              userQuery: safeMessage,
              suggestedTitle: aiResponse.gapTitle,
              suggestedContent: aiResponse.gapSuggestedContent,
              confidence: aiResponse.confidence,
            }).catch(() => {});
          });
        }

        botReply = {
          content: aiResponse.content,
          actions: aiResponse.actions,
          shouldEscalate: aiResponse.shouldEscalate,
          leadScore: aiResponse.leadScore,
          isHighIntent: aiResponse.isHighIntent,
        };
      } catch (aiErr) {
        console.error('AI chatbot error, falling back:', aiErr);
        botReply = await getFallbackResponse(safeMessage, visitorMessageCount);
      }
    } else {
      botReply = await getFallbackResponse(safeMessage, visitorMessageCount);
    }

    session.messages.push({ role: 'bot', content: botReply.content, timestamp: new Date() });
    await session.save();

    return NextResponse.json({
      reply: botReply.content,
      actions: botReply.actions,
      shouldEscalate: botReply.shouldEscalate,
      leadScore: (botReply as any).leadScore,
      isHighIntent: (botReply as any).isHighIntent,
      status: session.status,
    });
  } catch (err) {
    console.error('Chat message error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function getFallbackResponse(message: string, messageCount: number) {
  const { getBotResponse } = await import('@/lib/chatbot');
  const result = await getBotResponse(message, messageCount);
  return {
    content: result.content,
    actions: result.actions,
    shouldEscalate: result.shouldEscalate,
    leadScore: 5,
    isHighIntent: false,
  };
}
