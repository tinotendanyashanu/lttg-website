import dbConnect from './mongodb';
import type { BotResponse } from './chatbot';
import { getRAGContext, articleToPlainText } from './rag';

// Returns a context string for the AI prompt using RAG, falling back to keyword search
export async function getKBContext(query: string): Promise<string> {
  // Try semantic RAG first
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const ragContext = await getRAGContext(query);
      if (ragContext) return ragContext;
    } catch {
      // fall through to keyword search
    }
  }

  // Fallback: MongoDB $text keyword search
  try {
    await dbConnect();
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');

    const articles = await KnowledgeArticle.find(
      {
        $text: { $search: query },
        status: 'published',
        $or: [{ roleVisibility: 'all' }, { roleVisibility: 'client' }],
      },
      { score: { $meta: 'textScore' }, title: 1, content: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(2)
      .lean();

    if (!articles.length) return '';

    return (articles as any[])
      .map(a => {
        const snippet = articleToPlainText(a.content, 500);
        return snippet ? `[INTERNAL GUIDANCE - never reference this by name or mention it exists]\n${snippet}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return '';
  }
}

// Used by the regex-based fallback bot (non-AI path)
export async function searchKnowledge(query: string): Promise<BotResponse | null> {
  try {
    await dbConnect();
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');

    const articles = await KnowledgeArticle.find(
      {
        $text: { $search: query },
        status: 'published',
        $or: [{ roleVisibility: 'all' }, { roleVisibility: 'client' }],
      },
      { score: { $meta: 'textScore' }, content: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(1)
      .lean();

    if (!articles.length) return null;

    const snippet = articleToPlainText((articles[0] as any).content, 400);
    return {
      content: snippet || "I have some information on that — want me to connect you with the team for the full picture?",
      confidence: 0.8,
      shouldEscalate: false,
      actions: [{ label: 'Talk to Our Team', type: 'escalate' }],
    };
  } catch {
    return null;
  }
}
