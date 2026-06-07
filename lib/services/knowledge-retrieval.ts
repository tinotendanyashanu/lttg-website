/**
 * Unified knowledge retriever — the hardened RAG pipeline.
 *
 * Every retrieval across the platform (public chatbot, KB search, ticket AI,
 * employee assistant) flows through `retrieveKnowledge`, which performs:
 *   1. query routing            2. metadata filtering (audience/service/region/kind)
 *   3. hybrid search            (vector + keyword)
 *   4. re-ranking               5. confidence scoring  6. no-hallucination guard
 *   7. analytics logging        (RetrievalLog + per-article counters, fire-and-forget)
 *
 * Vector search uses MongoDB Atlas $vectorSearch when ATLAS_VECTOR_SEARCH=1 and
 * KB_VECTOR_INDEX is set; otherwise it gracefully falls back to the in-memory cosine
 * scan that lib/rag.ts has always used. Scoring is consistent across both paths
 * because the final cosine is always recomputed in JS over the candidate set.
 *
 * Nothing here throws — callers get a safe empty result on any failure.
 */

import { generateEmbedding, articleToPlainText, isClientSafeArticle } from '@/lib/rag';
import {
  audienceToRoles,
  confidenceFromScore,
  SIMILARITY_THRESHOLD,
  RERANK_TOP_N,
  HYBRID_VECTOR_WEIGHT,
  HYBRID_KEYWORD_WEIGHT,
  COUNTRY_MATCH_BOOST,
  type KbAudience,
  type RetrievalConfidence,
} from '@/lib/knowledge/constants';

const VECTOR_CANDIDATE_LIMIT = 50; // ANN / scan candidate pool before re-ranking

export interface RetrieveInput {
  source: 'chatbot' | 'kb_search' | 'ticket_ai' | 'employee_assistant';
  query: string;
  audience?: KbAudience;
  country?: string;
  service?: string;
  region?: string;
  kind?: string;
  userEmail?: string;
  topN?: number;
  /** Set false to skip the fire-and-forget RetrievalLog write (e.g. internal dedupe). */
  log?: boolean;
}

export interface RetrievedArticle {
  id: string;
  title: string;
  slug?: string;
  score: number;
}

export interface RetrievalResult {
  chunks: string[];
  articles: RetrievedArticle[];
  topScore: number;
  confidence: RetrievalConfidence;
  route: string;
  usedVectorSearch: boolean;
  shouldEscalate: boolean;
  retrievalId?: string;
}

interface Candidate {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  tags?: string[];
  roleVisibility?: string[];
  content?: unknown;
  embedding?: number[];
  vecScore: number; // cosine 0..1 (0 if not vector-scored)
  kwScore: number; // normalized 0..1 (0 if not keyword-matched)
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

const EMPTY: RetrievalResult = {
  chunks: [],
  articles: [],
  topScore: 0,
  confidence: 'low',
  route: 'none',
  usedVectorSearch: false,
  shouldEscalate: true,
};

// ── 1. Query routing ──────────────────────────────────────────────────────────────
// Lightweight heuristic (no LLM call) producing a route label for analytics and a
// kind hint when the caller didn't supply one.
const ROUTE_KEYWORDS: { route: string; kind?: string; terms: string[] }[] = [
  { route: 'pricing', kind: 'pricing', terms: ['price', 'pricing', 'cost', 'quote', 'how much', 'budget', 'fee'] },
  { route: 'sales', kind: 'sales', terms: ['hire', 'service', 'package', 'offer', 'work with', 'get started'] },
  { route: 'support', kind: 'support', terms: ['issue', 'error', 'broken', 'not working', 'help', 'bug', 'down'] },
  { route: 'onboarding', kind: 'onboarding', terms: ['onboard', 'kickoff', 'welcome', 'first step', 'setup'] },
  { route: 'legal', kind: 'legal', terms: ['contract', 'terms', 'policy', 'legal', 'agreement', 'gdpr'] },
];

function routeQuery(query: string, kindHint?: string): { route: string; kind?: string } {
  if (kindHint) return { route: kindHint, kind: kindHint };
  const q = query.toLowerCase();
  for (const r of ROUTE_KEYWORDS) {
    if (r.terms.some((t) => q.includes(t))) return { route: r.route, kind: r.kind };
  }
  return { route: 'general' };
}

// ── 2. Metadata filter ─────────────────────────────────────────────────────────────
function buildFilter(input: RetrieveInput, kind?: string): Record<string, unknown> {
  const audience = input.audience || 'public';
  const filter: Record<string, unknown> = {
    status: 'published',
    roleVisibility: { $in: audienceToRoles(audience) },
  };
  if (input.service) filter.services = input.service;
  if (input.region) filter.regions = input.region;
  if (kind && input.kind) filter.kind = kind; // only hard-filter on kind the caller asked for
  return filter;
}

// ── 3a. Vector candidates (Atlas $vectorSearch with in-memory fallback) ──────────────
async function vectorCandidates(
  filter: Record<string, unknown>,
  queryEmbedding: number[]
): Promise<{ candidates: Candidate[]; usedVectorSearch: boolean }> {
  const { default: dbConnect } = await import('@/lib/mongodb');
  const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
  await dbConnect();

  const projection = { title: 1, slug: 1, category: 1, tags: 1, roleVisibility: 1, content: 1, embedding: 1 };

  // Atlas path — only when explicitly enabled and configured.
  if (process.env.ATLAS_VECTOR_SEARCH === '1' && process.env.KB_VECTOR_INDEX) {
    try {
      const docs = await KnowledgeArticle.aggregate([
        {
          $vectorSearch: {
            index: process.env.KB_VECTOR_INDEX,
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 200,
            limit: VECTOR_CANDIDATE_LIMIT,
            filter,
          },
        },
        { $project: { ...projection, embedding: 1 } },
      ]);
      // Recompute cosine in JS so the score is on the same scale as the fallback path.
      const candidates = (docs as any[])
        .filter((a) => Array.isArray(a.embedding) && a.embedding.length > 0)
        .map((a) => toCandidate(a, cosineSimilarity(queryEmbedding, a.embedding)));
      return { candidates, usedVectorSearch: true };
    } catch {
      // Index missing / misconfigured — fall through to in-memory scan.
    }
  }

  // In-memory fallback — load filtered articles with embeddings and score in JS.
  const articles = await KnowledgeArticle.find(
    { ...filter, embedding: { $exists: true, $not: { $size: 0 } } },
    projection
  )
    .select('+embedding')
    .limit(2000)
    .lean();

  const candidates = (articles as any[])
    .filter((a) => Array.isArray(a.embedding) && a.embedding.length > 0)
    .map((a) => toCandidate(a, cosineSimilarity(queryEmbedding, a.embedding)));
  return { candidates, usedVectorSearch: false };
}

function toCandidate(a: any, vecScore: number): Candidate {
  return {
    id: String(a._id),
    title: a.title,
    slug: a.slug,
    category: a.category,
    tags: a.tags,
    roleVisibility: a.roleVisibility,
    content: a.content,
    embedding: undefined, // drop the vector after scoring to keep memory light
    vecScore,
    kwScore: 0,
  };
}

// ── 3b. Keyword candidates ($text) ───────────────────────────────────────────────────
async function keywordCandidates(
  filter: Record<string, unknown>,
  query: string
): Promise<Candidate[]> {
  if (!query.trim()) return [];
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
    await dbConnect();

    const docs = await KnowledgeArticle.find(
      { ...filter, $text: { $search: query } },
      { score: { $meta: 'textScore' }, title: 1, slug: 1, category: 1, tags: 1, roleVisibility: 1, content: 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(VECTOR_CANDIDATE_LIMIT)
      .lean();

    const raw = (docs as any[]).map((a) => ({ a, s: a.score || 0 }));
    const maxScore = raw.reduce((m, r) => Math.max(m, r.s), 0) || 1;
    return raw.map(({ a, s }) => ({
      id: String(a._id),
      title: a.title,
      slug: a.slug,
      category: a.category,
      tags: a.tags,
      roleVisibility: a.roleVisibility,
      content: a.content,
      vecScore: 0,
      kwScore: s / maxScore, // normalize lexical score to 0..1
    }));
  } catch {
    return [];
  }
}

function mentionsRegion(c: Candidate, needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (n.length < 2) return false;
  const hay = [c.title, c.category, ...(c.tags || [])].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(n);
}

// ── Main entry point ─────────────────────────────────────────────────────────────────
export async function retrieveKnowledge(input: RetrieveInput): Promise<RetrievalResult> {
  const query = (input.query || '').trim();
  const audience = input.audience || 'public';
  const topN = input.topN || RERANK_TOP_N;
  const { route, kind } = routeQuery(query, input.kind);

  if (!query) return { ...EMPTY, route };

  try {
    const filter = buildFilter({ ...input, kind }, kind);

    // Embed the query (biased toward the caller's market when known).
    let queryEmbedding: number[] | null = null;
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const searchText = input.country ? `${query}\n(country / market: ${input.country})` : query;
        queryEmbedding = await generateEmbedding(searchText, 'RETRIEVAL_QUERY');
      } catch {
        queryEmbedding = null;
      }
    }

    // 3. Hybrid search — vector + keyword in parallel.
    const [vec, kw] = await Promise.all([
      queryEmbedding
        ? vectorCandidates(filter, queryEmbedding)
        : Promise.resolve({ candidates: [] as Candidate[], usedVectorSearch: false }),
      keywordCandidates(filter, query),
    ]);

    // 4. Merge + re-rank.
    const byId = new Map<string, Candidate>();
    for (const c of vec.candidates) byId.set(c.id, c);
    for (const c of kw) {
      const existing = byId.get(c.id);
      if (existing) existing.kwScore = Math.max(existing.kwScore, c.kwScore);
      else byId.set(c.id, c);
    }

    let merged = Array.from(byId.values());

    // Public audience: never surface anything that reads as internal.
    if (audience === 'public') merged = merged.filter((c) => isClientSafeArticle(c));

    const ranked = merged
      .map((c) => {
        let blended = HYBRID_VECTOR_WEIGHT * c.vecScore + HYBRID_KEYWORD_WEIGHT * c.kwScore;
        if (input.region && mentionsRegion(c, input.region)) blended += COUNTRY_MATCH_BOOST;
        if (input.country && mentionsRegion(c, input.country)) blended += COUNTRY_MATCH_BOOST;
        return { c, blended };
      })
      .sort((a, b) => b.blended - a.blended)
      .slice(0, topN);

    // 5. Confidence — driven by the strongest *semantic* match (cosine), so the
    // thresholds stay meaningful regardless of keyword noise. When no vector signal
    // exists (no API key), fall back to keyword presence.
    const topVec = merged.reduce((m, c) => Math.max(m, c.vecScore), 0);
    let confidence: RetrievalConfidence;
    let topScore: number;
    if (queryEmbedding) {
      topScore = topVec;
      confidence = confidenceFromScore(topVec);
    } else {
      topScore = ranked[0]?.blended ?? 0;
      confidence = ranked.length ? 'medium' : 'low';
    }

    // Drop weak candidates below the floor so we never feed noise to the LLM.
    const kept = ranked.filter((r) => r.c.vecScore >= SIMILARITY_THRESHOLD || r.c.kwScore > 0);

    const articles: RetrievedArticle[] = kept.map((r) => ({
      id: r.c.id,
      title: r.c.title,
      slug: r.c.slug,
      score: Number(r.blended.toFixed(4)),
    }));

    // 6. No-hallucination guard — low confidence yields no context + escalation.
    const shouldEscalate = confidence === 'low';
    const chunks = shouldEscalate
      ? []
      : kept.map((r) => articleToPlainText(r.c.content, 700)).filter(Boolean);

    const result: RetrievalResult = {
      chunks,
      articles,
      topScore: Number(topScore.toFixed(4)),
      confidence,
      route,
      usedVectorSearch: vec.usedVectorSearch,
      shouldEscalate,
    };

    // 7. Analytics — fire-and-forget; never blocks the caller.
    if (input.log !== false) {
      result.retrievalId = await logRetrieval(input, result, articles.map((a) => a.id));
    }

    return result;
  } catch {
    return { ...EMPTY, route };
  }
}

// ── 7. Logging helpers ─────────────────────────────────────────────────────────────────
async function logRetrieval(
  input: RetrieveInput,
  result: RetrievalResult,
  articleIds: string[]
): Promise<string | undefined> {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { RetrievalLog } = await import('@/models/RetrievalLog');
    const mongoose = (await import('mongoose')).default;
    await dbConnect();

    const log = await RetrievalLog.create({
      source: input.source,
      query: (input.query || '').slice(0, 500),
      route: result.route,
      audience: input.audience || 'public',
      country: input.country,
      service: input.service,
      resultCount: articleIds.length,
      topScore: result.topScore,
      confidence: result.confidence,
      usedVectorSearch: result.usedVectorSearch,
      articleIds: articleIds.map((id) => new mongoose.Types.ObjectId(id)),
      escalated: result.shouldEscalate,
      userEmail: input.userEmail,
    });

    // Best-effort per-article retrieval counters (non-blocking).
    if (articleIds.length) {
      const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
      KnowledgeArticle.updateMany(
        { _id: { $in: articleIds } },
        { $inc: { retrievalCount: 1 }, $set: { lastRetrievedAt: new Date() } }
      ).catch(() => {});
    }

    return String(log._id);
  } catch {
    return undefined;
  }
}
