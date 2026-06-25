/**
 * AI Quotation Generator (Phase C, spec §7).
 *
 * Drafts a quotation (scope, deliverables as line items, timeline, indicative
 * pricing) from a free-text requirement, the visitor's region and project
 * complexity. Pricing context comes from the knowledge base via the unified
 * retriever (kind: 'pricing', region-scoped) so figures stay aligned with the
 * region-specific pricing the team has documented.
 *
 * IMPORTANT: this only produces a DRAFT for a staff member to review, adjust and
 * approve. Nothing is sent to a client from here — sending stays behind the
 * existing staff-gated quotation flow.
 */

import { z } from 'zod';
import { AIProvider } from '@/lib/ai/provider';
import { KB_REGION_LABELS, type KbRegion } from '@/lib/knowledge/constants';


export type QuotationComplexity = 'simple' | 'standard' | 'complex';

export interface QuotationDraftInput {
  requirements: string;
  region?: string;
  currency?: string;
  complexity?: QuotationComplexity;
}

export interface DraftLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuotationDraft {
  description: string;
  lineItems: DraftLineItem[];
  notes: string;
  timeline?: string;
  currency: string;
  usedPricingKnowledge: boolean;
  pricingSources: string[];
}

const DRAFT_SYSTEM = `You are a senior solutions consultant at LeoTheTechGuy, a premium technology company. You draft an internal quotation that a staff member will REVIEW and adjust before sending to a client. You are realistic and never over-promise.

You receive: the client's requirements, their region, the project complexity, the quotation currency, and (optionally) INTERNAL PRICING GUIDANCE from our knowledge base.

RULES:
- Break the work into clear, sensible deliverables — each becomes a line item with a quantity and a unit price in the requested currency.
- If INTERNAL PRICING GUIDANCE is provided, base your figures on it and the stated region. If it is NOT provided, give reasonable indicative figures and note that pricing must be confirmed.
- Higher complexity → more deliverables and higher effort. Keep totals coherent.
- Never invent guarantees, SLAs, or features beyond the requirements.
- "timeline" is a short human estimate (e.g. "4-6 weeks").

Respond with valid JSON ONLY, matching exactly:
{"description":"one-line summary of the engagement","timeline":"e.g. 4-6 weeks","lineItems":[{"description":"deliverable","quantity":1,"unitPrice":0}],"notes":"assumptions, exclusions, and that pricing is indicative pending review"}`;

const QuotationDraftSchema = z.object({
  description: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  lineItems: z.array(z.object({
    description: z.string().optional().default(""),
    quantity: z.number().optional().default(1),
    unitPrice: z.number().optional().default(0),
  })).optional().default([]),
  notes: z.string().optional().default(""),
});

function sanitizeLineItems(raw: unknown): DraftLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 20)
    .map((item) => {
      const r = (item || {}) as Record<string, unknown>;
      const description = String(r.description || '').trim().slice(0, 200);
      const quantity = Math.max(1, Math.round(Number(r.quantity) || 1));
      const unitPrice = Math.max(0, Math.round((Number(r.unitPrice) || 0) * 100) / 100);
      return { description, quantity, unitPrice, total: Math.round(quantity * unitPrice * 100) / 100 };
    })
    .filter((i) => i.description.length > 0);
}

/**
 * Generate a quotation draft. Never throws — returns a minimal safe draft on
 * failure so the staff member can still build the quotation manually.
 */
export async function generateQuotationDraft(input: QuotationDraftInput): Promise<QuotationDraft> {
  const currency = (input.currency || 'USD').toUpperCase().slice(0, 4);
  const requirements = (input.requirements || '').trim().slice(0, 4000);
  const complexity: QuotationComplexity = input.complexity || 'standard';
  const regionLabel = input.region ? KB_REGION_LABELS[input.region as KbRegion] || input.region : undefined;

  const safe: QuotationDraft = {
    description: '',
    lineItems: [],
    notes: 'Pricing is indicative and must be confirmed by a team member before sending.',
    currency,
    usedPricingKnowledge: false,
    pricingSources: [],
  };

  if (!requirements) return safe;

  // Pull region-scoped pricing guidance from the KB (internal/admin scope).
  let pricingContext = '';
  const pricingSources: string[] = [];
  try {
    const { retrieveKnowledge } = await import('@/lib/services/knowledge-retrieval');
    const retrieval = await retrieveKnowledge({
      source: 'kb_search',
      query: requirements,
      audience: 'admin',
      kind: 'pricing',
      region: input.region,
      log: false,
    });
    if (retrieval.chunks.length) {
      pricingContext = retrieval.chunks.join('\n\n---\n\n');
      for (const a of retrieval.articles) pricingSources.push(a.title);
    }
  } catch {
    /* pricing context is optional */
  }

  try {
    const prompt = [
      `REQUIREMENTS:\n${requirements}`,
      `\nREGION: ${regionLabel || 'not specified'}`,
      `COMPLEXITY: ${complexity}`,
      `CURRENCY: ${currency}`,
      pricingContext ? `\nINTERNAL PRICING GUIDANCE (do not quote verbatim, use it to inform figures):\n${pricingContext}` : '\n(No internal pricing guidance found — give indicative figures and flag for review.)',
      `\nDraft the quotation now.`,
    ].join('\n');

    const parsed = await AIProvider.extractJSON({
      task: 'quotation',
      system: DRAFT_SYSTEM,
      prompt,
      temperature: 0.4,
      maxTokens: 1400,
      schema: QuotationDraftSchema,
      fallback: { description: '', timeline: '', lineItems: [], notes: safe.notes },
    });

    const lineItems = sanitizeLineItems(parsed.lineItems);
    return {
      description: String(parsed.description || '').trim().slice(0, 300),
      lineItems,
      notes: String(parsed.notes || '').trim().slice(0, 1000) || safe.notes,
      timeline: String(parsed.timeline || '').trim().slice(0, 100) || undefined,
      currency,
      usedPricingKnowledge: Boolean(pricingContext),
      pricingSources,
    };
  } catch {
    return { ...safe, usedPricingKnowledge: Boolean(pricingContext), pricingSources };
  }
}
