import dbConnect from "./mongodb";
import type { BotResponse } from "./chatbot";
import { getRAGContext, articleToPlainText, isClientSafeArticle } from "./rag";

interface KnowledgeArticleSnippet {
  title?: string;
  category?: string;
  tags?: string[];
  roleVisibility?: string[];
  content?: unknown;
}

function toGuidanceSnippet(article: KnowledgeArticleSnippet, maxLen: number) {
  if (!isClientSafeArticle(article)) return "";
  const snippet = articleToPlainText(article.content, maxLen);
  if (!snippet || snippet.length < 40) return "";
  return snippet;
}

export async function getKBContext(query: string, country?: string): Promise<string> {
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const ragContext = await getRAGContext(query, country);
      if (ragContext) return ragContext;
    } catch {
      // fall through to keyword search
    }
  }

  try {
    await dbConnect();
    const { KnowledgeArticle } = await import("@/models/KnowledgeArticle");

    // Include the country in the keyword search so region-specific articles surface.
    const searchQuery = country ? `${query} ${country}` : query;

    const articles = await KnowledgeArticle.find(
      {
        $text: { $search: searchQuery },
        status: "published",
        $or: [{ roleVisibility: "all" }, { roleVisibility: "client" }],
      },
      { score: { $meta: "textScore" }, title: 1, category: 1, tags: 1, roleVisibility: 1, content: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .lean();

    const snippets = (articles as KnowledgeArticleSnippet[])
      .map(article => toGuidanceSnippet(article, 700))
      .filter(Boolean)
      .slice(0, 2);

    return snippets.map(text => `[INTERNAL GUIDANCE - do not mention the source]\n${text}`).join("\n\n");
  } catch {
    return "";
  }
}

// Used ONLY by the no-AI regex fallback bot. Without an LLM we cannot summarize an
// article safely, and raw article text must never be shown to a visitor. So we only
// check whether relevant client-safe material exists and, if so, respond
// conversationally and offer a human — we never return the article content itself.
export async function searchKnowledge(query: string): Promise<BotResponse | null> {
  try {
    await dbConnect();
    const { KnowledgeArticle } = await import("@/models/KnowledgeArticle");

    const articles = await KnowledgeArticle.find(
      {
        $text: { $search: query },
        status: "published",
        $or: [{ roleVisibility: "all" }, { roleVisibility: "client" }],
      },
      { score: { $meta: "textScore" }, title: 1, category: 1, tags: 1, roleVisibility: 1, content: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .lean();

    const hasRelevant = (articles as KnowledgeArticleSnippet[]).some(
      article => toGuidanceSnippet(article, 450).length > 0
    );

    if (!hasRelevant) return null;

    return {
      content:
        "That's something we can definitely help with. To give you accurate, specific guidance rather than a generic answer, the best next step is a quick chat with our team — they'll tailor it to your situation. Want me to connect you, or would you prefer to book a free call?",
      confidence: 0.6,
      shouldEscalate: false,
      actions: [
        { label: "Talk to Our Team", type: "escalate" },
        { label: "Book a Free Call", type: "booking", href: "https://cal.com/leothetechguy" },
      ],
    };
  } catch {
    return null;
  }
}
