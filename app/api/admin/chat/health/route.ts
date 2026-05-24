import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { ChatSession } from "@/models/ChatSession";
import { KnowledgeArticle } from "@/models/KnowledgeArticle";
import { EMBEDDING_MODEL } from "@/lib/rag";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || !role || !["admin", "employee"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const [totalSessions, fallbackSessions, aiSessions, publishedArticles, embeddedArticles, staleEmbeddings] = await Promise.all([
    ChatSession.countDocuments({}),
    ChatSession.countDocuments({ aiMode: "fallback" }),
    ChatSession.countDocuments({ aiMode: "ai" }),
    KnowledgeArticle.countDocuments({ status: "published" }),
    KnowledgeArticle.countDocuments({ status: "published", embedding: { $exists: true, $not: { $size: 0 } } }),
    KnowledgeArticle.countDocuments({ status: "published", embeddingModel: { $ne: EMBEDDING_MODEL } }),
  ]);

  const recentErrors = await ChatSession.find({ aiError: { $exists: true, $ne: "" } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("sessionId aiModel aiError updatedAt")
    .lean();

  return NextResponse.json({
    models: {
      primary: process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-flash",
      upgraded: process.env.GEMINI_UPGRADED_MODEL || "gemini-2.5-flash",
      embedding: EMBEDDING_MODEL,
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
