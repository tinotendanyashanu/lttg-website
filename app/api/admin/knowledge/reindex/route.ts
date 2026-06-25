import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { KnowledgeArticle } from "@/models/KnowledgeArticle";
import { generateEmbedding, buildArticleText, EMBEDDING_MODEL } from "@/lib/rag";

interface ReindexQuery {
  status: string;
  "$or"?: Record<string, unknown>[];
}

interface ReindexArticle {
  _id: unknown;
  title: string;
  subtitle?: string;
  tags?: string[];
  content: unknown;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  await dbConnect();

  const query: ReindexQuery = { status: "published" };
  if (!force) {
    query.$or = [
      { embedding: { $exists: false } },
      { embedding: { $size: 0 } },
      { embeddingModel: { $ne: EMBEDDING_MODEL } },
    ];
  }

  const articles = await KnowledgeArticle.find(query, {
    title: 1,
    subtitle: 1,
    tags: 1,
    content: 1,
  }).lean();

  let succeeded = 0;
  let failed = 0;

  for (const article of articles as ReindexArticle[]) {
    try {
      const text = buildArticleText({
        title: article.title,
        subtitle: article.subtitle,
        tags: article.tags,
        content: article.content,
      });
      if (!text) throw new Error("Article has no embeddable text");

      const embedding = await generateEmbedding(text);
      await KnowledgeArticle.findByIdAndUpdate(article._id, {
        embedding,
        embeddingUpdatedAt: new Date(),
        embeddingModel: EMBEDDING_MODEL,
      });
      succeeded++;
    } catch (err) {
      console.error("Knowledge reindex failed", article._id, err);
      failed++;
    }
  }

  return NextResponse.json({ total: articles.length, succeeded, failed, embeddingModel: EMBEDDING_MODEL });
}
