import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';
import { generateEmbedding, buildArticleText } from '@/lib/rag';

// POST /api/admin/knowledge/reindex
// Backfills embeddings for all published articles that are missing them.
// Safe to call multiple times — skips articles that already have up-to-date embeddings
// unless ?force=true is passed.
export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  await dbConnect();

  const query: any = { status: 'published' };
  if (!force) query.embedding = { $exists: false };

  const articles = await KnowledgeArticle.find(query, {
    title: 1, subtitle: 1, tags: 1, content: 1,
  }).lean();

  let succeeded = 0;
  let failed = 0;

  for (const article of articles as any[]) {
    try {
      const text = buildArticleText({
        title: article.title,
        subtitle: article.subtitle,
        tags: article.tags,
        content: article.content,
      });
      const embedding = await generateEmbedding(text);
      await KnowledgeArticle.findByIdAndUpdate(article._id, {
        embedding,
        embeddingUpdatedAt: new Date(),
      });
      succeeded++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ total: articles.length, succeeded, failed });
}
