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

export async function getKBContext(query: string): Promise<string> {
  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const ragContext = await getRAGContext(query);
      if (ragContext) return ragContext;
    } catch {
      // fall through to keyword search
    }
  }

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

    const snippets = (articles as KnowledgeArticleSnippet[])
      .map(article => toGuidanceSnippet(article, 700))
      .filter(Boolean)
      .slice(0, 2);

    return snippets.map(text => `[INTERNAL GUIDANCE - do not mention the source]\n${text}`).join("\n\n");
  } catch {
    return "";
  }
}

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

    const snippet = (articles as KnowledgeArticleSnippet[])
      .map(article => toGuidanceSnippet(article, 450))
      .find(Boolean);

    if (!snippet) return null;

    return {
      content: `${snippet}\n\nDoes that answer your question, or would you like the team to look at your specific situation?`,
      confidence: 0.75,
      shouldEscalate: false,
      actions: [{ label: "Talk to Our Team", type: "escalate" }],
    };
  } catch {
    return null;
  }
}
