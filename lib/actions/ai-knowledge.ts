'use server';

/**
 * AI & Knowledge dashboard data.
 *
 * Aggregates the retrieval-analytics backbone (RetrievalLog) together with KB
 * feedback, knowledge-gap suggestions and chatbot AI metrics into a single
 * admin-facing snapshot: most-searched topics, failed searches, low-confidence
 * responses, retrieval success rate, AI performance and feedback analytics.
 */

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session;
}

export interface AiKnowledgeDashboard {
  windowDays: number;
  totals: {
    retrievals: number;
    failedSearches: number;
    lowConfidence: number;
    escalations: number;
    successRate: number; // 0-100, share of high+medium confidence
    vectorShare: number; // 0-100, share served by Atlas vector search
    pendingGaps: number;
  };
  bySource: { source: string; count: number }[];
  topTopics: { query: string; count: number; lowConfidence: number }[];
  failedQueries: { query: string; source: string; confidence: string; createdAt: string }[];
  confidenceTrend: { date: string; high: number; medium: number; low: number }[];
  ai: {
    avgTopScore: number;
    avgChatConfidence: number;
    feedbackHelpful: number;
    feedbackUnhelpful: number;
  };
  worstArticles: { id: string; title: string; helpful: number; notHelpful: number; retrievals: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getAiKnowledgeDashboard(windowDays = 30): Promise<AiKnowledgeDashboard> {
  await requireAdmin();
  await dbConnect();

  const { RetrievalLog } = await import('@/models/RetrievalLog');
  const { KnowledgeArticle } = await import('@/models/KnowledgeArticle');
  const { KnowledgeGapSuggestion } = await import('@/models/KnowledgeGapSuggestion');
  const { ChatSession } = await import('@/models/ChatSession');

  const since = new Date(Date.now() - windowDays * DAY_MS);
  const sinceMatch = { createdAt: { $gte: since } };

  const [
    totalRetrievals,
    failedSearches,
    lowConfidence,
    escalations,
    vectorCount,
    confidenceCounts,
    bySourceAgg,
    topTopicsAgg,
    failedQueriesDocs,
    trendAgg,
    avgScoreAgg,
    feedbackAgg,
    pendingGaps,
    avgChatAgg,
    worstArticlesDocs,
  ] = await Promise.all([
    RetrievalLog.countDocuments(sinceMatch),
    RetrievalLog.countDocuments({ ...sinceMatch, resultCount: 0 }),
    RetrievalLog.countDocuments({ ...sinceMatch, confidence: 'low' }),
    RetrievalLog.countDocuments({ ...sinceMatch, escalated: true }),
    RetrievalLog.countDocuments({ ...sinceMatch, usedVectorSearch: true }),
    RetrievalLog.aggregate([
      { $match: sinceMatch },
      { $group: { _id: '$confidence', count: { $sum: 1 } } },
    ]),
    RetrievalLog.aggregate([
      { $match: sinceMatch },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    RetrievalLog.aggregate([
      { $match: { ...sinceMatch, query: { $ne: '' } } },
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
          lowConfidence: { $sum: { $cond: [{ $eq: ['$confidence', 'low'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    RetrievalLog.find({ ...sinceMatch, $or: [{ resultCount: 0 }, { confidence: 'low' }] })
      .select('query source confidence createdAt')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
    RetrievalLog.aggregate([
      { $match: sinceMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          high: { $sum: { $cond: [{ $eq: ['$confidence', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$confidence', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$confidence', 'low'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
    RetrievalLog.aggregate([
      { $match: sinceMatch },
      { $group: { _id: null, avg: { $avg: '$topScore' } } },
    ]),
    RetrievalLog.aggregate([
      { $match: { ...sinceMatch, feedback: { $exists: true } } },
      { $group: { _id: '$feedback', count: { $sum: 1 } } },
    ]),
    KnowledgeGapSuggestion.countDocuments({ status: 'pending' }),
    ChatSession.aggregate([
      { $match: { updatedAt: { $gte: since }, aiConfidence: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$aiConfidence' } } },
    ]),
    KnowledgeArticle.find({ notHelpfulCount: { $gt: 0 } })
      .select('title helpfulCount notHelpfulCount retrievalCount')
      .sort({ notHelpfulCount: -1 })
      .limit(8)
      .lean(),
  ]);

  const confMap: Record<string, number> = {};
  for (const c of confidenceCounts as any[]) confMap[c._id] = c.count;
  const successful = (confMap.high || 0) + (confMap.medium || 0);
  const successRate = totalRetrievals ? Math.round((successful / totalRetrievals) * 100) : 0;
  const vectorShare = totalRetrievals ? Math.round((vectorCount / totalRetrievals) * 100) : 0;

  const feedbackMap: Record<string, number> = {};
  for (const f of feedbackAgg as any[]) feedbackMap[f._id] = f.count;

  return {
    windowDays,
    totals: {
      retrievals: totalRetrievals,
      failedSearches,
      lowConfidence,
      escalations,
      successRate,
      vectorShare,
      pendingGaps,
    },
    bySource: (bySourceAgg as any[]).map((s) => ({ source: s._id, count: s.count })),
    topTopics: (topTopicsAgg as any[]).map((t) => ({
      query: t._id,
      count: t.count,
      lowConfidence: t.lowConfidence,
    })),
    failedQueries: (failedQueriesDocs as any[]).map((q) => ({
      query: q.query || '(empty)',
      source: q.source,
      confidence: q.confidence,
      createdAt: new Date(q.createdAt).toISOString(),
    })),
    confidenceTrend: (trendAgg as any[]).map((d) => ({
      date: d._id,
      high: d.high,
      medium: d.medium,
      low: d.low,
    })),
    ai: {
      avgTopScore: Number(((avgScoreAgg as any[])[0]?.avg || 0).toFixed(3)),
      avgChatConfidence: Number(((avgChatAgg as any[])[0]?.avg || 0).toFixed(3)),
      feedbackHelpful: feedbackMap.helpful || 0,
      feedbackUnhelpful: feedbackMap.unhelpful || 0,
    },
    worstArticles: (worstArticlesDocs as any[]).map((a) => ({
      id: String(a._id),
      title: a.title,
      helpful: a.helpfulCount || 0,
      notHelpful: a.notHelpfulCount || 0,
      retrievals: a.retrievalCount || 0,
    })),
  };
}
