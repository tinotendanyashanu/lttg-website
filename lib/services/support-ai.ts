/**
 * Support Center — AI service.
 *
 * Uses the unified AI provider and the embedding/RAG helpers from lib/rag.ts. Provides:
 *   - processTicketAI:        summary, category, priority, sentiment, suggested team
 *   - suggestArticlesForTicket: KB-article suggestions via embeddings (for agents)
 *   - generateTicketReplyDraft: a professional draft reply for the AI Reply Assistant
 *
 * Nothing here writes to the DB except the knowledge-gap hook, which reuses the
 * existing KnowledgeGapSuggestion review queue (no new gap system is created).
 */

import { z } from 'zod';
import { AIProvider } from '@/lib/ai/provider';
import { articleToPlainText } from '@/lib/rag';
import {
  CATEGORY_VALUES,
  categoryLabel,
  suggestedTeamForCategory,
  type TicketPriority,
  type Sentiment,
} from '@/lib/support/constants';

// ── Ticket classification ──────────────────────────────────────────────────────

export interface TicketAIResult {
  summary: string;
  category: string;
  priority: TicketPriority;
  sentiment: Sentiment;
  suggestedTeam: string;
}

const CLASSIFY_SYSTEM = `You are the triage engine for LeoTheTechGuy's customer support center. You read a support ticket and return a concise, structured classification. You are precise and never invent facts.

CATEGORIES (choose exactly one value): ${CATEGORY_VALUES.join(', ')}
PRIORITIES (choose exactly one): low, medium, high, critical
SENTIMENT (choose exactly one): positive, neutral, negative

Guidance:
- "critical" = service down, data loss, security incident, or a client blocked from operating.
- "high" = significant impact or an angry/at-risk client, but a workaround may exist.
- "medium" = standard request. "low" = minor question or cosmetic issue.
- summary: 1-2 neutral sentences an agent can skim. Never include private speculation.

ALWAYS respond with valid JSON only, matching exactly:
{"summary":"...","category":"one-of-the-category-values","priority":"low|medium|high|critical","sentiment":"positive|neutral|negative"}`;

const TicketClassificationSchema = z.object({
  summary: z.string().optional().default(""),
  category: z.string().optional().default("general_inquiry"),
  priority: z.string().optional().default("medium"),
  sentiment: z.string().optional().default("neutral"),
});

function coercePriority(v: unknown): TicketPriority {
  const s = String(v || '').toLowerCase();
  if (s === 'critical' || s === 'urgent') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}

function coerceSentiment(v: unknown): Sentiment {
  const s = String(v || '').toLowerCase();
  if (s === 'positive') return 'positive';
  if (s === 'negative') return 'negative';
  return 'neutral';
}

function coerceCategory(v: unknown): string {
  const s = String(v || '').toLowerCase().replace(/\s+/g, '_');
  return CATEGORY_VALUES.includes(s) ? s : 'general_inquiry';
}

/**
 * Classify a ticket with the unified AI provider. On any failure returns a safe heuristic result
 * so callers never have to handle exceptions — ticket creation must never break.
 */
export async function processTicketAI(input: {
  subject: string;
  description: string;
}): Promise<TicketAIResult> {
  const fallback: TicketAIResult = {
    summary: input.subject.slice(0, 200),
    category: 'general_inquiry',
    priority: 'medium',
    sentiment: 'neutral',
    suggestedTeam: suggestedTeamForCategory('general_inquiry'),
  };

  try {
    const prompt = ['SUBJECT: ' + input.subject, '', 'DESCRIPTION:', input.description].join(String.fromCharCode(10)).slice(0, 6000);
    const parsed = await AIProvider.classify({
      task: 'support',
      system: CLASSIFY_SYSTEM,
      prompt,
      temperature: 0.2,
      maxTokens: 400,
      schema: TicketClassificationSchema,
      fallback,
    });

    const category = coerceCategory(parsed.category);
    return {
      summary: String(parsed.summary || '').trim().slice(0, 600) || fallback.summary,
      category,
      priority: coercePriority(parsed.priority),
      sentiment: coerceSentiment(parsed.sentiment),
      suggestedTeam: suggestedTeamForCategory(category),
    };
  } catch {
    return fallback;
  }
}

// ── KB article suggestions (RAG) ───────────────────────────────────────────────

export interface SuggestedArticle {
  articleId: string;
  title: string;
  slug?: string;
  score: number;
}

/**
 * Suggest the most relevant knowledge-base articles for a ticket. Agent-facing,
 * so employee/admin-visible articles are eligible (unlike the client RAG path).
 * Delegates to the unified retriever so ticket retrieval is hybrid-ranked and
 * recorded in retrieval analytics like every other surface.
 */
export async function suggestArticlesForTicket(text: string): Promise<SuggestedArticle[]> {
  try {
    const { retrieveKnowledge } = await import('@/lib/services/knowledge-retrieval');
    const result = await retrieveKnowledge({
      source: 'ticket_ai',
      query: text.slice(0, 4000),
      audience: 'employee',
    });
    return result.articles.map((a) => ({
      articleId: a.id,
      title: a.title,
      slug: a.slug,
      score: a.score,
    }));
  } catch {
    return [];
  }
}

/**
 * Knowledge-gap hook: when no article clears the similarity threshold, record a
 * suggestion in the existing review queue so the team can fill the gap.
 */
export async function recordTicketKnowledgeGap(input: {
  ticketId: string;
  subject: string;
  description: string;
}): Promise<void> {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { KnowledgeGapSuggestion } = await import('@/models/KnowledgeGapSuggestion');
    await dbConnect();

    const exists = await KnowledgeGapSuggestion.findOne({
      sessionId: `ticket:${input.ticketId}`,
    }).lean();
    if (exists) return;

    await KnowledgeGapSuggestion.create({
      sessionId: `ticket:${input.ticketId}`,
      userQuery: input.subject,
      suggestedTitle: input.subject.slice(0, 120),
      suggestedContent: `A support ticket raised a topic with no matching knowledge-base article. Consider documenting: ${input.description.slice(0, 400)}`,
      confidence: 0.5,
      status: 'pending',
    });
  } catch {
    /* best-effort */
  }
}

// ── AI Reply Assistant ─────────────────────────────────────────────────────────

const REPLY_SYSTEM = `You are a senior customer-support agent at LeoTheTechGuy, a premium European technology company. You draft a professional, empathetic reply to a client's support ticket that a human agent will review and edit before sending.

RULES:
- Warm, clear, confident. British English. No corporate filler ("Certainly!", "Of course!").
- Address the client by first name if available.
- Acknowledge the issue, give concrete next steps or an answer, set expectations on timing.
- If knowledge-base context is provided, use it silently — never mention articles, internal docs, or that a knowledge base exists.
- Never invent facts, account details, prices, or commitments you cannot support. If something needs investigation, say it's being looked into.
- 2-3 short paragraphs max. Sign off as "The LeoTheTechGuy Support Team".
- Output ONLY the reply text — no JSON, no preamble, no markdown headings.`;

export async function generateTicketReplyDraft(input: {
  subject: string;
  description: string;
  clientName?: string;
  category?: string;
  priority?: string;
  history?: { senderRole: string; content: string }[];
  kbContext?: string;
}): Promise<string> {

  const historyText = (input.history || [])
    .slice(-6)
    .map((m) => `${m.senderRole === 'client' ? 'Client' : 'Agent'}: ${m.content}`)
    .join('\n');

  const prompt = [
    `CLIENT NAME: ${input.clientName || 'there'}`,
    `CATEGORY: ${categoryLabel(input.category)}`,
    `PRIORITY: ${input.priority || 'medium'}`,
    `\nTICKET SUBJECT: ${input.subject}`,
    `TICKET DESCRIPTION:\n${input.description}`,
    historyText ? `\nCONVERSATION SO FAR:\n${historyText}` : '',
    input.kbContext ? `\nINTERNAL KNOWLEDGE (do not mention the source):\n${input.kbContext}` : '',
    `\nWrite the draft reply now.`,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 8000);

  const result = await AIProvider.generate({
    task: 'support',
    system: REPLY_SYSTEM,
    prompt,
    temperature: 0.5,
    maxTokens: 600,
    fallbackText: 'Thank you for reaching out — we are looking into this and will follow up shortly.',
  });
  const text = result.text.trim();
  return text || 'Thank you for reaching out — we are looking into this and will follow up shortly.';
}

/** Build a short KB context string from article ids/content for the reply prompt. */
export async function buildKbContextForArticles(articleIds: string[]): Promise<string> {
  if (!articleIds.length) return '';
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
    await dbConnect();
    const articles = await KnowledgeArticle.find(
      { _id: { $in: articleIds } },
      { title: 1, content: 1 }
    ).lean();
    return (articles as { content?: unknown }[])
      .map((a) => articleToPlainText(a.content, 700))
      .filter(Boolean)
      .join('\n\n')
      .slice(0, 3000);
  } catch {
    return '';
  }
}
