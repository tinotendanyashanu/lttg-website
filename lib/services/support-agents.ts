/**
 * Support Center — multi-agent AI orchestration.
 *
 * Coordinates several specialized AI "agents" over a single ticket and merges
 * their output into one actionable workup for the human agent. Each agent reuses
 * the existing single-purpose helpers in `support-ai.ts` (no duplicated provider
 * plumbing); the strategist is the only extra model call and it is fully
 * defensive — any failure degrades to a heuristic so the caller never throws.
 *
 *   triage      → classification + summary (processTicketAI)
 *   knowledge   → relevant KB articles + answerability (suggestArticlesForTicket)
 *   strategist  → recommendation, confidence, can-auto-resolve, next steps, draft
 */

import { z } from 'zod';
import { AIProvider } from '@/lib/ai/provider';
import {
  processTicketAI,
  suggestArticlesForTicket,
  buildKbContextForArticles,
  generateTicketReplyDraft,
  type SuggestedArticle,
} from '@/lib/services/support-ai';
import { categoryLabel } from '@/lib/support/constants';


export interface AgentStep {
  agent: string;
  title: string;
  detail: string;
}

export interface AgentWorkup {
  recommendation: string;
  confidence: number; // 0-1
  canAutoResolve: boolean;
  draftReply: string;
  steps: AgentStep[];
  articles: SuggestedArticle[];
}

interface WorkupInput {
  subject: string;
  description: string;
  clientName?: string;
  category?: string;
  priority?: string;
  history?: { senderRole: string; content: string }[];
}

const STRATEGIST_SYSTEM = `You are the lead resolution strategist in an AI support team for LeoTheTechGuy. You are given a ticket plus the triage classification and the knowledge-base context the knowledge agent retrieved. Decide how the human agent should resolve this ticket.

Return STRICT JSON only, matching exactly:
{"recommendation":"one or two sentences of concrete guidance for the agent","confidence":0.0-1.0,"canAutoResolve":true|false,"nextSteps":["short imperative step", "..."]}

Rules:
- "canAutoResolve" is true ONLY when the knowledge context fully answers the request and no account-specific action, refund, or human judgement is needed.
- "confidence" reflects how well the available context covers the request.
- 2-4 nextSteps, each a short imperative phrase. No markdown, no prose outside the JSON.`;

const StrategistSchema = z.object({
  recommendation: z.string().optional().default(""),
  confidence: z.number().optional().default(0.5),
  canAutoResolve: z.boolean().optional().default(false),
  nextSteps: z.array(z.string()).optional().default([]),
});

function clamp01(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

async function runStrategist(
  input: WorkupInput,
  triageSummary: string,
  kbContext: string,
): Promise<{ recommendation: string; confidence: number; canAutoResolve: boolean; nextSteps: string[] }> {
  const fallback = {
    recommendation: kbContext
      ? 'Relevant knowledge was found — review the suggested articles and confirm they address the client before replying.'
      : 'No strong knowledge match. Investigate manually and consider documenting the resolution afterwards.',
    confidence: kbContext ? 0.6 : 0.3,
    canAutoResolve: false,
    nextSteps: kbContext
      ? ['Review suggested articles', 'Confirm they fit the client', 'Send a tailored reply']
      : ['Investigate the issue', 'Gather any missing detail from the client', 'Draft a manual reply'],
  };

  try {
    const prompt = [
      `TICKET SUBJECT: ${input.subject}`,
      `CATEGORY: ${categoryLabel(input.category)} · PRIORITY: ${input.priority || 'medium'}`,
      `TRIAGE SUMMARY: ${triageSummary}`,
      `DESCRIPTION:\n${input.description}`,
      kbContext ? `\nKNOWLEDGE CONTEXT:\n${kbContext}` : '\nKNOWLEDGE CONTEXT: (none found)',
    ]
      .join('\n')
      .slice(0, 8000);

    const parsed = await AIProvider.extractJSON({
      task: 'support',
      system: STRATEGIST_SYSTEM,
      prompt,
      temperature: 0.3,
      maxTokens: 500,
      schema: StrategistSchema,
      fallback,
    });

    const nextSteps = Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps.map((s: unknown) => String(s).slice(0, 160)).filter(Boolean).slice(0, 4)
      : fallback.nextSteps;

    return {
      recommendation: String(parsed.recommendation || '').trim().slice(0, 600) || fallback.recommendation,
      confidence: clamp01(parsed.confidence),
      canAutoResolve: Boolean(parsed.canAutoResolve) && kbContext.length > 0,
      nextSteps: nextSteps.length ? nextSteps : fallback.nextSteps,
    };
  } catch {
    return fallback;
  }
}

/**
 * Run the full multi-agent workup for a ticket. Always resolves (never throws);
 * individual agent failures degrade gracefully so the panel always renders.
 */
export async function runTicketAgentWorkup(input: WorkupInput): Promise<AgentWorkup> {
  const ticketText = `${input.subject}\n${input.description}`;

  // Agents 1 & 2 run in parallel — they have no dependency on each other.
  const [triage, articles] = await Promise.all([
    processTicketAI({ subject: input.subject, description: input.description }).catch(() => null),
    suggestArticlesForTicket(ticketText).catch(() => [] as SuggestedArticle[]),
  ]);

  const triageSummary = triage?.summary || input.subject.slice(0, 200);
  const kbContext = await buildKbContextForArticles(articles.map((a) => a.articleId)).catch(() => '');

  // Agent 3 (strategist) depends on the first two.
  const strategy = await runStrategist(input, triageSummary, kbContext);

  // Drafting agent — reuse the existing reply assistant with the gathered context.
  const draftReply = await generateTicketReplyDraft({
    subject: input.subject,
    description: input.description,
    clientName: input.clientName,
    category: triage?.category || input.category,
    priority: triage?.priority || input.priority,
    history: input.history,
    kbContext,
  }).catch(() => '');

  const steps: AgentStep[] = [
    {
      agent: 'triage',
      title: 'Triage agent',
      detail: triage
        ? `Classified as ${categoryLabel(triage.category)} · ${triage.priority} priority · ${triage.sentiment} sentiment. ${triageSummary}`
        : 'Triage unavailable — used the ticket subject as a summary.',
    },
    {
      agent: 'knowledge',
      title: 'Knowledge agent',
      detail: articles.length
        ? `Found ${articles.length} relevant article${articles.length > 1 ? 's' : ''}: ${articles
            .map((a) => a.title)
            .join(', ')}.`
        : 'No knowledge-base article cleared the relevance threshold for this ticket.',
    },
    {
      agent: 'strategist',
      title: 'Resolution strategist',
      detail: `${strategy.recommendation} Next: ${strategy.nextSteps.join(' → ')}.`,
    },
  ];

  return {
    recommendation: strategy.recommendation,
    confidence: strategy.confidence,
    canAutoResolve: strategy.canAutoResolve,
    draftReply,
    steps,
    articles,
  };
}
