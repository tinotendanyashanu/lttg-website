import { GoogleGenerativeAI } from '@google/generative-ai';

const EMBEDDING_MODEL = 'text-embedding-004';
const TOP_K = 3;
const SIMILARITY_THRESHOLD = 0.45;

function getGenAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not configured');
  return new GoogleGenerativeAI(apiKey);
}

// Recursively extracts plain text from a BlockNote block object
function extractBlockText(block: any): string {
  if (!block) return '';
  const parts: string[] = [];
  const content = block.content;
  if (content) {
    if (typeof content === 'string') {
      parts.push(content);
    } else if (Array.isArray(content)) {
      for (const item of content) {
        if (typeof item === 'string') parts.push(item);
        else if (item?.text) parts.push(String(item.text));
        else if (item?.content) {
          if (typeof item.content === 'string') parts.push(item.content);
          else if (Array.isArray(item.content)) {
            for (const sub of item.content) { if (sub?.text) parts.push(String(sub.text)); }
          }
        }
      }
    } else if (typeof content === 'object' && content.text) {
      parts.push(String(content.text));
    }
  }
  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      const t = extractBlockText(child);
      if (t) parts.push(t);
    }
  }
  return parts.join(' ').trim();
}

export function articleToPlainText(rawContent: unknown, maxLen = 1500): string {
  const raw = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(extractBlockText).filter(Boolean).join('\n').slice(0, maxLen).trim();
    }
  } catch { /* not JSON */ }
  return raw.replace(/[{}"\\[\]]/g, ' ').replace(/\s{2,}/g, ' ').slice(0, maxLen).trim();
}

// Builds the text string we embed for an article
export function buildArticleText(article: { title: string; subtitle?: string; tags?: string[]; content: unknown }): string {
  const parts = [
    article.title,
    article.subtitle ?? '',
    (article.tags ?? []).join(' '),
    articleToPlainText(article.content, 1500),
  ];
  return parts.filter(Boolean).join('\n').trim();
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export async function generateEmbedding(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_DOCUMENT'): Promise<number[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text: text.slice(0, 8000) }], role: 'user' },
    taskType: taskType as any,
  });
  return result.embedding.values;
}

// Semantic retrieval: returns plain-text context string for the AI prompt
export async function getRAGContext(query: string): Promise<string> {
  try {
    const { default: dbConnect } = await import('./mongodb');
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
    await dbConnect();

    // Fetch published, client-visible articles that have embeddings
    const articles = await KnowledgeArticle.find(
      {
        status: 'published',
        $or: [{ roleVisibility: 'all' }, { roleVisibility: 'client' }],
        embedding: { $exists: true, $not: { $size: 0 } },
      },
      { title: 1, subtitle: 1, content: 1, embedding: 1 }
    ).lean();

    if (!articles.length) return '';

    const queryEmbedding = await generateEmbedding(query, 'RETRIEVAL_QUERY');

    const scored = (articles as any[])
      .filter(a => Array.isArray(a.embedding) && a.embedding.length > 0)
      .map(a => ({
        article: a,
        score: cosineSimilarity(queryEmbedding, a.embedding),
      }))
      .filter(({ score }) => score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    if (!scored.length) return '';

    return scored
      .map(({ article }) => {
        const text = articleToPlainText(article.content, 600);
        return text ? `[INTERNAL GUIDANCE - never reference this by name or mention it exists]\n${text}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
  } catch {
    return '';
  }
}
