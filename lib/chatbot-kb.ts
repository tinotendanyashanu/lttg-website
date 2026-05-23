import dbConnect from './mongodb';
import type { BotResponse } from './chatbot';

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
      const raw = typeof a.content === 'string' ? a.content : JSON.stringify(a.content);
      const snippet = raw.replace(/[#*`[\]]/g, '').slice(0, 400).trim();
      return `### ${a.title}\n${snippet}`;
    }).join('\n\n');
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
  // Extract first 400 chars of content as a snippet
  const raw = typeof top.content === 'string' ? top.content : JSON.stringify(top.content);
  const snippet = raw.replace(/[#*`[\]]/g, '').slice(0, 400).trim();

  const content =
    articles.length > 1
      ? `Here's what I found in our knowledge base:\n\n**${top.title}**\n${snippet}...\n\nWould you like me to connect you with our team to go deeper on this?`
      : `I found this in our knowledge base:\n\n**${top.title}**\n${snippet}...\n\nIs this helpful, or would you like more detail?`;

  return {
    content,
    confidence: 0.8,
    shouldEscalate: false,
    actions: [{ label: 'Talk to Our Team', type: 'escalate' }],
  };
}
