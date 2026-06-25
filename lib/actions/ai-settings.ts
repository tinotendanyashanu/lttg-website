'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { getAIProviderConfigForAdmin } from '@/lib/ai/provider';

const TASK_KEYS = [
  'general',
  'chatbot',
  'reasoning',
  'coding',
  'classification',
  'support',
  'sales',
  'quotation',
  'employee_assistant',
  'executive',
  'knowledge_draft',
] as const;

const FEATURE_KEYS = [
  'rag',
  'ticketTriage',
  'replyGeneration',
  'knowledgeGaps',
  'leadQualification',
  'quotationGeneration',
  'executiveSummaries',
  'employeeAssistant',
  'whatsappAI',
  'automationAgents',
] as const;

type AvgLatencyRow = { avg?: number };
type TaskMetricRow = { _id?: string; count?: number; failures?: number };
type FailureRow = {
  taskType?: string;
  selectedModel?: string;
  error?: string;
  createdAt?: Date | string;
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session;
}

function cleanModel(value: FormDataEntryValue | null): string | undefined {
  const text = String(value || '').trim();
  return text ? text.slice(0, 100) : undefined;
}

function cleanNumber(value: FormDataEntryValue | null, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function getAISettingsDashboard() {
  await requireAdmin();
  await dbConnect();
  const { AICallLog } = await import('@/models/AICallLog');
  const config = await getAIProviderConfigForAdmin();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [totalCalls, failedCalls, fallbackCalls, avgLatencyAgg, byTaskAgg, recentFailures] = await Promise.all([
    AICallLog.countDocuments({ createdAt: { $gte: since } }),
    AICallLog.countDocuments({ status: 'failure', createdAt: { $gte: since } }),
    AICallLog.countDocuments({ fallbackUsed: true, createdAt: { $gte: since } }),
    AICallLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, avg: { $avg: '$latencyMs' } } },
    ]),
    AICallLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$taskType', count: { $sum: 1 }, failures: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    AICallLog.find({ status: 'failure' })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('taskType selectedModel error createdAt')
      .lean(),
  ]);

  return {
    config,
    taskKeys: TASK_KEYS,
    featureKeys: FEATURE_KEYS,
    metrics: {
      totalCalls,
      failedCalls,
      fallbackCalls,
      failureRate: totalCalls ? failedCalls / totalCalls : 0,
      avgLatencyMs: Math.round((avgLatencyAgg as AvgLatencyRow[])[0]?.avg || 0),
      byTask: (byTaskAgg as TaskMetricRow[]).map((row) => ({ task: row._id || 'unknown', count: row.count || 0, failures: row.failures || 0 })),
      recentFailures: (recentFailures as FailureRow[]).map((row) => ({
        task: row.taskType,
        selectedModel: row.selectedModel,
        error: row.error,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      })),
    },
  };
}

export async function updateAISettings(formData: FormData) {
  const session = await requireAdmin();
  await dbConnect();
  const { AISettings } = await import('@/models/AISettings');

  const taskModels: Record<string, string> = {};
  for (const key of TASK_KEYS) {
    const model = cleanModel(formData.get(`model_${key}`));
    if (model) taskModels[key] = model;
  }

  const featureToggles: Record<string, boolean> = {};
  for (const key of FEATURE_KEYS) {
    featureToggles[key] = formData.get(`feature_${key}`) === 'on';
  }

  await AISettings.findOneAndUpdate(
    { key: 'default' },
    {
      $set: {
        key: 'default',
        defaultProvider: 'ollama_cloud',
        defaultModel: cleanModel(formData.get('defaultModel')) || 'qwen3',
        embeddingModel: cleanModel(formData.get('embeddingModel')) || 'nomic-embed-text',
        taskModels,
        temperature: cleanNumber(formData.get('temperature'), 0.35, 0, 2),
        maxTokens: cleanNumber(formData.get('maxTokens'), 800, 64, 8000),
        timeoutMs: cleanNumber(formData.get('timeoutMs'), 30000, 1000, 120000),
        retryCount: cleanNumber(formData.get('retryCount'), 1, 0, 3),
        featureToggles,
        updatedBy: session.user?.email,
      },
    },
    { upsert: true, new: true },
  );

  revalidatePath('/admin/ai-settings');
}
