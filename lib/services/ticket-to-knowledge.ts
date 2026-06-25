/**
 * Ticket → Knowledge automation (Phase B, spec §4).
 *
 * When a support ticket is resolved, this analyses the resolved thread and drafts
 * a knowledge-base article so the RAG system keeps improving from real resolutions.
 * The drafted article is created with status 'draft' (employee-visible) and queued
 * for the existing KB review/publish flow — nothing is auto-published.
 *
 * Guardrails:
 *  - Fire-and-forget: never throws, never blocks the resolve action.
 *  - Dedupe first: if the unified retriever already finds a confident article for
 *    this topic, we skip drafting (no near-duplicate noise).
 *  - Reuses the unified AI provider JSON pattern (lib/ai-chatbot.ts / support-ai.ts),
 *    the KnowledgeArticle model, and the embedding writer.
 *  - One draft per ticket (idempotent on a deterministic slug marker).
 */

import { z } from 'zod';
import { AIProvider } from '@/lib/ai/provider';
import { KB_KINDS, KB_SERVICE_VALUES, RETRIEVAL_CONFIDENCE } from '@/lib/knowledge/constants';


// Marker tag stamped on AI-drafted articles so they can be filtered in review.
const AI_DRAFT_TAG = 'ai-drafted';

interface TicketInput {
  ticketId: string;
  ticketRef?: string; // human ticket code (ticket.ticketId), for slug + audit
  subject: string;
  description: string;
  category?: string;
  resolutionText?: string; // the agent's resolving reply, if available
}

const DRAFT_SYSTEM = `You are a knowledge-base editor for LeoTheTechGuy, a premium technology company. You turn a RESOLVED support ticket into a reusable internal knowledge-base article so the team can answer the same question faster next time.

RULES:
- Write a clear, evergreen article — not a ticket recap. Remove client names, account IDs, ticket numbers, and any personal data.
- Generalise: describe the problem and the working solution so it applies to future cases.
- British English, concise, practical. Use short paragraphs and, where useful, a numbered steps list in the body text.
- Never invent facts the ticket does not support. If the resolution is unclear, keep the article scoped to what is known.
- pick "kind" from this exact list: ${KB_KINDS.join(', ')}.
- "services" is an array (possibly empty) of any of these exact values that the article relates to: ${KB_SERVICE_VALUES.join(', ')}.

Respond with valid JSON ONLY, matching exactly:
{"title":"...","subtitle":"...","body":"the full article text in plain prose/markdown","kind":"one-of-the-kinds","tags":["3-6","short","lowercase","tags"],"services":["service-id"]}`;

const TicketArticleDraftSchema = z.object({
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  body: z.string().optional().default(''),
  kind: z.string().optional().default('support'),
  tags: z.array(z.string()).optional().default([]),
  services: z.array(z.string()).optional().default([]),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function coerceKind(v: unknown): string | undefined {
  const s = String(v || '').toLowerCase().trim();
  return (KB_KINDS as readonly string[]).includes(s) ? s : 'support';
}

function coerceServices(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => String(x).toLowerCase().trim())
    .filter((x) => KB_SERVICE_VALUES.includes(x))
    .slice(0, 6);
}

function coerceTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => String(x).toLowerCase().trim().slice(0, 30))
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Draft a KB article from a resolved ticket. Safe to call fire-and-forget.
 * Returns the new article id, or null when skipped (duplicate / no AI / error).
 */
export async function draftArticleFromResolvedTicket(input: TicketInput): Promise<string | null> {
  try {

    const { default: dbConnect } = await import('@/lib/mongodb');
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
    await dbConnect();

    // Idempotency — one AI draft per ticket (deterministic slug marker).
    const baseSlug = `kb-ticket-${slugify(input.ticketRef || input.ticketId)}`;
    const existingForTicket = await KnowledgeArticle.findOne({
      slug: new RegExp(`^${baseSlug}`),
    })
      .select('_id')
      .lean();
    if (existingForTicket) return null;

    // Dedupe — if the KB already answers this confidently, don't add a near-duplicate.
    try {
      const { retrieveKnowledge } = await import('@/lib/services/knowledge-retrieval');
      const probe = await retrieveKnowledge({
        source: 'ticket_ai',
        query: `${input.subject}\n${input.description}`.slice(0, 2000),
        audience: 'employee',
        log: false,
      });
      if (probe.confidence === 'high' && probe.topScore >= RETRIEVAL_CONFIDENCE.high) {
        return null; // good coverage already exists
      }
    } catch {
      /* dedupe is best-effort */
    }

    const prompt = [
      `RESOLVED TICKET`,
      `Subject: ${input.subject}`,
      input.category ? `Category: ${input.category}` : '',
      `\nProblem as reported:\n${input.description}`,
      input.resolutionText ? `\nHow it was resolved:\n${input.resolutionText}` : '',
      `\nWrite the reusable knowledge-base article now.`,
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 8000);

    const parsed = await AIProvider.extractJSON({
      task: 'knowledge_draft',
      system: DRAFT_SYSTEM,
      prompt,
      temperature: 0.4,
      maxTokens: 1200,
      schema: TicketArticleDraftSchema,
      fallback: { title: '', subtitle: '', body: '', kind: 'support', tags: [], services: [] },
    });

    const title = String(parsed.title || '').trim().slice(0, 160);
    const body = String(parsed.body || '').trim();
    if (!title || body.length < 40) return null; // not enough to be useful

    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const tags = Array.from(new Set([...coerceTags(parsed.tags), AI_DRAFT_TAG]));

    const article = await KnowledgeArticle.create({
      title,
      subtitle: String(parsed.subtitle || '').trim().slice(0, 200) || undefined,
      slug,
      category: 'Support',
      type: 'article',
      status: 'draft', // queued for human review — never auto-published
      isPublished: false,
      content: body,
      tags,
      roleVisibility: ['employee', 'admin'],
      kind: coerceKind(parsed.kind),
      services: coerceServices(parsed.services),
      createdBy: 'ai-knowledge-bot',
    });

    // Embed the draft so it is retrievable the moment a reviewer publishes it.
    try {
      const { generateEmbedding, buildArticleText, EMBEDDING_MODEL } = await import('@/lib/rag');
      const text = buildArticleText({ title, subtitle: article.subtitle, tags, content: body });
      if (text) {
        const embedding = await generateEmbedding(text);
        await KnowledgeArticle.findByIdAndUpdate(article._id, {
          embedding,
          embeddingUpdatedAt: new Date(),
          embeddingModel: EMBEDDING_MODEL,
        });
      }
    } catch {
      /* embedding is best-effort; the review queue still works without it */
    }

    // Audit (best-effort).
    try {
      const { ActivityLog } = await import('@/models/ActivityLog');
      await ActivityLog.create({
        actionType: 'knowledge_article_ai_drafted',
        newValue: `AI drafted article from ticket ${input.ticketRef || input.ticketId}: ${title}`,
      });
    } catch {
      /* non-blocking */
    }

    return String(article._id);
  } catch {
    return null;
  }
}
