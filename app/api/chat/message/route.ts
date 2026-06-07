import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ChatSession } from "@/models/ChatSession";
import { sanitizeBotReply } from "@/lib/chat-sanitizer";

type BotReply = {
  content: string;
  actions?: { label: string; type: "booking" | "service" | "escalate"; href?: string }[];
  shouldEscalate: boolean;
  leadScore: number;
  isHighIntent: boolean;
};

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    const safeMessage = message.trim().slice(0, 1000);

    await dbConnect();

    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, status: "bot", messages: [], leadScore: 0 });
    }

    if (session.status === "human_active" || session.status === "pending_human") {
      return NextResponse.json({ handedOff: true, status: session.status });
    }

    const visitorMessageCount = session.messages.filter(
      (m: { role: string }) => m.role === "visitor"
    ).length;

    session.messages.push({ role: "visitor", content: safeMessage, timestamp: new Date() });

    let botReply: BotReply;
    let aiMode: "ai" | "fallback" = "fallback";
    let aiModel = "fallback-regex";
    let aiError = "";
    let aiConfidence = 0;
    let retrievalUsed = false;

    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const { getAIBotResponse, getSelectedChatModel } = await import("@/lib/ai-chatbot");
        const { getKBContext } = await import("@/lib/chatbot-kb");

        const history = session.messages
          .slice(0, -1)
          .filter((m: { role: string }) => m.role === "visitor" || m.role === "bot")
          .map((m: { role: string; content: string }) => ({
            role: (m.role === "visitor" ? "user" : "model") as "user" | "model",
            content: m.content,
          }));

        const currentLeadScore = session.leadScore ?? 0;
        aiModel = getSelectedChatModel(visitorMessageCount, currentLeadScore);

        // Use the country detected in earlier turns to pull region-specific context.
        const priorCountry = session.detectedCountry || undefined;
        const kbContext = await getKBContext(safeMessage, priorCountry);
        retrievalUsed = Boolean(kbContext);

        const aiResponse = await getAIBotResponse(
          safeMessage,
          history,
          visitorMessageCount,
          currentLeadScore,
          kbContext || undefined
        );

        aiMode = "ai";
        aiConfidence = aiResponse.confidence;
        session.leadScore = aiResponse.leadScore;
        if (aiResponse.detectedCountry) session.detectedCountry = aiResponse.detectedCountry;

        if (aiResponse.detectedGap && aiResponse.gapTitle && aiResponse.gapSuggestedContent) {
          import("@/models/KnowledgeGapSuggestion").then(({ KnowledgeGapSuggestion }) => {
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
      } catch (err) {
        aiError = normalizeError(err);
        console.error("AI chatbot error, falling back:", err);
        botReply = await getFallbackResponse(safeMessage, visitorMessageCount);
      }
    } else {
      aiError = "GOOGLE_AI_API_KEY not configured";
      botReply = await getFallbackResponse(safeMessage, visitorMessageCount);
    }

    // Final safety net: strip any internal/raw content before it is stored or shown.
    // Applies to BOTH the AI path and the regex fallback — nothing reaches the visitor unscrubbed.
    botReply.content = sanitizeBotReply(botReply.content);

    session.aiMode = aiMode;
    session.aiModel = aiModel;
    session.aiError = aiError;
    session.aiConfidence = aiConfidence;
    session.retrievalUsed = retrievalUsed;
    session.leadSummary = buildLeadSummary(session.messages, session.leadScore ?? 0);

    session.messages.push({ role: "bot", content: botReply.content, timestamp: new Date() });
    await session.save();

    // Sales automation: a qualifying conversation becomes a CRM lead (idempotent,
    // fire-and-forget — never affects the chat response).
    if ((session.leadScore ?? 0) >= 7) {
      import("@/lib/services/sales-qualification")
        .then(({ maybeCreateLeadFromChat }) =>
          maybeCreateLeadFromChat({
            sessionId,
            visitorName: session.visitorName,
            visitorEmail: session.visitorEmail,
            detectedCountry: session.detectedCountry,
            leadScore: session.leadScore,
            leadSummary: session.leadSummary,
            messages: session.messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        )
        .catch(() => {});
    }

    return NextResponse.json({
      reply: botReply.content,
      actions: botReply.actions,
      shouldEscalate: botReply.shouldEscalate,
      leadScore: botReply.leadScore,
      isHighIntent: botReply.isHighIntent,
      status: session.status,
      mode: aiMode,
    });
  } catch (err) {
    console.error("Chat message error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function getFallbackResponse(message: string, messageCount: number) {
  const { getBotResponse } = await import("@/lib/chatbot");
  const result = await getBotResponse(message, messageCount);
  return {
    content: result.content,
    actions: result.actions,
    shouldEscalate: result.shouldEscalate,
    leadScore: 5,
    isHighIntent: false,
  };
}

function normalizeError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return message.replace(/key=[^\s&]+/gi, "key=redacted").slice(0, 300);
}

function buildLeadSummary(messages: { role: string; content: string }[], leadScore: number) {
  const visitorMessages = messages
    .filter(m => m.role === "visitor")
    .map(m => m.content.trim())
    .filter(Boolean)
    .slice(-5);

  if (!visitorMessages.length) return "No visitor messages yet.";

  const combined = visitorMessages.join(" | ").slice(0, 500);
  return `Lead score ${leadScore}/10. Recent visitor intent: ${combined}`;
}
