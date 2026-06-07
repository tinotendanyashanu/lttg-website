/**
 * Shared knowledge-base constants — single source of truth reused by the
 * KnowledgeArticle model, the unified retriever (lib/services/knowledge-retrieval.ts),
 * the AI & Knowledge dashboard, and the KB admin editor.
 *
 * Server-safe (no 'use client', no runtime side effects) so it can be imported by
 * both server components and server actions.
 */

import { services as SERVICE_DEFS } from '@/data/services';
import type { RoleVisibility } from '@/models/KnowledgeArticle';

// ── Audiences ───────────────────────────────────────────────────────────────────
// The KB already gates access through `roleVisibility`. "public" maps to the
// existing `all` visibility; the rest map 1:1 to platform roles.
export const KB_AUDIENCES = ['public', 'client', 'employee', 'admin'] as const;
export type KbAudience = (typeof KB_AUDIENCES)[number];

/** Translate a logical audience to the roleVisibility values that satisfy it. */
export function audienceToRoles(audience: KbAudience): RoleVisibility[] {
  switch (audience) {
    case 'public':
      // Matches the existing public-chatbot RAG scope (all + client), further
      // narrowed by isClientSafeArticle so internal material never leaks.
      return ['all', 'client'];
    case 'client':
      return ['all', 'client'];
    case 'employee':
      return ['all', 'employee', 'intern'];
    case 'admin':
      // Admins can see everything.
      return ['all', 'client', 'employee', 'intern', 'admin'];
    default:
      return ['all'];
  }
}

// ── Knowledge kinds ───────────────────────────────────────────────────────────────
export const KB_KINDS = [
  'sales',
  'pricing',
  'support',
  'sop',
  'onboarding',
  'legal',
  'marketing',
  'affiliate',
] as const;
export type KbKind = (typeof KB_KINDS)[number];

export const KB_KIND_LABELS: Record<KbKind, string> = {
  sales: 'Sales',
  pricing: 'Pricing',
  support: 'Support',
  sop: 'SOP',
  onboarding: 'Onboarding',
  legal: 'Legal',
  marketing: 'Marketing',
  affiliate: 'Affiliate',
};

export const KB_KIND_ICONS: Record<KbKind, string> = {
  sales: 'trending_up',
  pricing: 'sell',
  support: 'support_agent',
  sop: 'checklist',
  onboarding: 'rocket_launch',
  legal: 'gavel',
  marketing: 'campaign',
  affiliate: 'handshake',
};

export function kbKindLabel(value?: string): string {
  return value && value in KB_KIND_LABELS ? KB_KIND_LABELS[value as KbKind] : (value || '—');
}

// ── Services & regions (for service/region-based filtering) ───────────────────────
// Services are derived from the canonical service catalogue so the KB stays in sync
// with what the business actually offers.
export const KB_SERVICES: { value: string; label: string }[] = SERVICE_DEFS.map((s) => ({
  value: s.id,
  label: s.title,
}));

export const KB_SERVICE_VALUES = KB_SERVICES.map((s) => s.value);

// Coarse regions used for region-scoped pricing/guidance. Matched against
// ChatSession.detectedCountry / article.regions (case-insensitive contains).
export const KB_REGIONS = [
  'global',
  'europe',
  'uk',
  'north_america',
  'africa',
  'zimbabwe',
  'south_africa',
  'middle_east',
  'asia',
] as const;
export type KbRegion = (typeof KB_REGIONS)[number];

export const KB_REGION_LABELS: Record<KbRegion, string> = {
  global: 'Global',
  europe: 'Europe',
  uk: 'United Kingdom',
  north_america: 'North America',
  africa: 'Africa',
  zimbabwe: 'Zimbabwe',
  south_africa: 'South Africa',
  middle_east: 'Middle East',
  asia: 'Asia',
};

// ── Retrieval tuning ──────────────────────────────────────────────────────────────
// Promoted from the magic numbers previously inlined in lib/rag.ts so the retriever,
// the model and analytics all agree on what "confident" means.
export const SIMILARITY_THRESHOLD = 0.45; // floor for a candidate to count at all
export const RETRIEVAL_CONFIDENCE = { high: 0.62, low: 0.45 } as const;
export type RetrievalConfidence = 'high' | 'medium' | 'low';

/** Map a blended top score to a confidence band. */
export function confidenceFromScore(topScore: number): RetrievalConfidence {
  if (topScore >= RETRIEVAL_CONFIDENCE.high) return 'high';
  if (topScore >= RETRIEVAL_CONFIDENCE.low) return 'medium';
  return 'low';
}

export const RERANK_TOP_N = 3;
export const HYBRID_VECTOR_WEIGHT = 0.7;
export const HYBRID_KEYWORD_WEIGHT = 0.3;
// Region/country match nudges region-specific guidance above generic material.
export const COUNTRY_MATCH_BOOST = 0.2;
