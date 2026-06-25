import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { ChatSession } from "@/models/ChatSession";
import { KnowledgeArticle } from "@/models/KnowledgeArticle";
import { EMBEDDING_MODEL } from "@/lib/rag";
import { getAIProviderConfigForAdmin } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || !role || !["admin", "employee"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const aiConfig = await getAIProviderConfigForAdmin();

  const [totalSessions, fallbackSessions, aiSessions, publishedArticles, embeddedArticles, staleEmbeddings, recentAiCalls, failedAiCalls] = await Promise.all([
    ChatSession.countDocuments({}),
    ChatSession.countDocuments({ aiMode: "fallback" }),
    ChatSession.countDocuments({ aiMode: "ai" }),
    KnowledgeArticle.countDocuments({ status: "published" }),
    KnowledgeArticle.countDocuments({ status: "published", embedding: { $exists: true, $not: { $size: 0 } } }),
    KnowledgeArticle.countDocuments({ status: "published", embeddingModel: { $ne: EMBEDDING_MODEL } }),
    (await import("@/models/AICallLog")).AICallLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    (await import("@/models/AICallLog")).AICallLog.countDocuments({ status: "failure", createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  const recentErrors = await ChatSession.find({ aiError: { $exists: true, $ne: "" } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("sessionId aiModel aiError updatedAt")
    .lean();

  return NextResponse.json({
    models: {
      provider: aiConfig.provider,
      default: aiConfig.defaultModel,
      secondary: aiConfig.secondaryModel,
      embedding: aiConfig.embeddingModel,
      tasks: aiConfig.taskModels,
    },
    providerHealth: aiConfig.health,
    aiCalls: {
      last24h: recentAiCalls,
      failedLast24h: failedAiCalls,
      failureRateLast24h: recentAiCalls ? failedAiCalls / recentAiCalls : 0,
    },
    sessions: {
      total: totalSessions,
      ai: aiSessions,
      fallback: fallbackSessions,
      fallbackRate: totalSessions ? fallbackSessions / totalSessions : 0,
    },
    knowledgeBase: {
      published: publishedArticles,
      embedded: embeddedArticles,
      missingEmbeddings: Math.max(0, publishedArticles - embeddedArticles),
      staleEmbeddings,
    },
    recentErrors,
  });
}
