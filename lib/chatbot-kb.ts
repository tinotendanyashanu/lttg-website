import dbConnect from './mongodb';
import type { BotResponse } from './chatbot';

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

// Converts KB article content to a plain-text snippet safe for AI injection and display
function toPlainText(rawContent: unknown, maxLen = 500): string {
  const raw = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const lines = parsed.map(extractBlockText).filter(Boolean);
      return lines.join('\n').slice(0, maxLen).trim();
    }
  } catch { /* not JSON, fall through */ }
  return raw.replace(/[{}"\\[\]]/g, ' ').replace(/\s{2,}/g, ' ').slice(0, maxLen).trim();
}

// Returns a plain-text context string for injection into the AI system prompt
export async function getKBContext(query: string): Promise<string> {
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

    return (articles as any[]).map(a => {
      const snippet = toPlainText(a.content, 500);
      return snippet ? `### ${a.title}\n${snippet}` : '';
    }).filter(Boolean).join('\n\n');
  } catch {
    return '';
  }
}

export async function searchKnowledge(query: string): Promise<BotResponse | null> {
  await dbConnect();
  const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');

  const articles = await KnowledgeArticle.find(
    {
      $text: { $search: query },
      status: 'published',
      $or: [{ roleVisibility: 'all' }, { roleVisibility: 'client' }],
    },
    { score: { $meta: 'textScore' }, title: 1, content: 1, subtitle: 1 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(2)
    .lean();

  if (!articles.length) return null;

  const top = articles[0] as any;
  const snippet = toPlainText(top.content, 400);

  const content =
    articles.length > 1
      ? `**${top.title}**\n${snippet}`
      : snippet;

  return {
    content: content || "I have some information on that — want me to connect you with the team for the full picture?",
    confidence: 0.8,
    shouldEscalate: false,
    actions: [{ label: 'Talk to Our Team', type: 'escalate' }],
  };
}
