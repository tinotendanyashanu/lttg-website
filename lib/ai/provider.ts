import { z } from 'zod';

export type AITaskType =
  | 'general'
  | 'chatbot'
  | 'reasoning'
  | 'coding'
  | 'classification'
  | 'embedding'
  | 'summary'
  | 'json'
  | 'support'
  | 'sales'
  | 'quotation'
  | 'employee_assistant'
  | 'executive'
  | 'knowledge_draft';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface AIGenerateInput {
  task: AITaskType;
  system?: string;
  prompt?: string;
  messages?: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  confidence?: number;
  fallbackText?: string;
}

export interface AIGenerateResult {
  text: string;
  provider: 'ollama_cloud' | 'rule_based';
  selectedModel: string;
  fallbackUsed: boolean;
  confidence?: number;
  latencyMs: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
}

export interface AIJSONInput<T> extends Omit<AIGenerateInput, 'fallbackText'> {
  schema?: z.ZodType<T>;
  fallback: T;
}

interface RuntimeAIConfig {
  defaultProvider: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel: string;
  secondaryModel: string;
  embeddingModel: string;
  taskModels: Record<string, string>;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retryCount: number;
  featureToggles: Record<string, boolean>;
  allowLocalOllama: boolean;
}

const PROVIDER = 'ollama_cloud';

const DEFAULT_MODELS: Record<string, string> = {
  general: 'qwen3',
  chatbot: 'qwen3',
  reasoning: 'deepseek-r1',
  coding: 'qwen-coder',
  classification: 'qwen3',
  embedding: 'nomic-embed-text',
  summary: 'qwen3',
  json: 'qwen3',
  support: 'qwen3',
  sales: 'qwen3',
  quotation: 'qwen3',
  employee_assistant: 'qwen3',
  executive: 'qwen3',
  knowledge_draft: 'qwen3',
};

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

function stripJsonFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function normalizeBaseUrl(baseUrl: string, allowLocal: boolean): string {
  const clean = baseUrl.replace(/\/+$/, '');
  if (!clean) throw new Error('OLLAMA_CLOUD_BASE_URL is not configured');
  const url = new URL(clean);
  const localHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (!allowLocal && localHosts.includes(url.hostname)) {
    throw new Error('Local Ollama endpoints are disabled. Configure OLLAMA_CLOUD_BASE_URL.');
  }
  return clean;
}

function envTaskModels(defaultModel: string, embeddingModel: string): Record<string, string> {
  return {
    general: env('OLLAMA_MODEL_GENERAL') || defaultModel,
    chatbot: env('OLLAMA_MODEL_CHATBOT') || env('OLLAMA_MODEL_GENERAL') || defaultModel,
    reasoning: env('OLLAMA_MODEL_REASONING') || 'deepseek-r1',
    coding: env('OLLAMA_MODEL_CODING') || 'qwen-coder',
    classification: env('OLLAMA_MODEL_CLASSIFICATION') || env('OLLAMA_SMALL_MODEL') || defaultModel,
    embedding: embeddingModel,
    summary: env('OLLAMA_MODEL_SUMMARY') || defaultModel,
    json: env('OLLAMA_MODEL_JSON') || defaultModel,
    support: env('OLLAMA_MODEL_SUPPORT') || defaultModel,
    sales: env('OLLAMA_MODEL_SALES') || defaultModel,
    quotation: env('OLLAMA_MODEL_QUOTATION') || defaultModel,
    employee_assistant: env('OLLAMA_MODEL_ASSISTANT') || defaultModel,
    executive: env('OLLAMA_MODEL_EXECUTIVE') || defaultModel,
    knowledge_draft: env('OLLAMA_MODEL_KNOWLEDGE_DRAFT') || defaultModel,
  };
}

function mapToObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  if (typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

async function getRuntimeConfig(): Promise<RuntimeAIConfig> {
  const defaultModel = env('OLLAMA_DEFAULT_MODEL') || DEFAULT_MODELS.general;
  const embeddingModel = env('OLLAMA_EMBEDDING_MODEL') || DEFAULT_MODELS.embedding;
  const allowLocalOllama = process.env.AI_ENABLE_LOCAL_OLLAMA_FALLBACK === 'true';

  const config: RuntimeAIConfig = {
    defaultProvider: env('AI_DEFAULT_PROVIDER') || PROVIDER,
    baseUrl: normalizeBaseUrl(env('OLLAMA_CLOUD_BASE_URL') || '', allowLocalOllama),
    apiKey: env('OLLAMA_CLOUD_API_KEY'),
    defaultModel,
    secondaryModel: env('OLLAMA_SECONDARY_MODEL') || 'llama3.1',
    embeddingModel,
    taskModels: envTaskModels(defaultModel, embeddingModel),
    temperature: Number(env('AI_TEMPERATURE')) || 0.35,
    maxTokens: Number(env('AI_MAX_TOKENS')) || 800,
    timeoutMs: Number(env('AI_TIMEOUT_MS')) || 30000,
    retryCount: Number(env('AI_RETRY_COUNT')) || 1,
    featureToggles: {},
    allowLocalOllama,
  };

  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { AISettings } = await import('@/models/AISettings');
    await dbConnect();
    const settings = await AISettings.findOne({ key: 'default' }).lean();
    if (settings) {
      const settingsRecord = settings as {
        defaultProvider?: string;
        defaultModel?: string;
        embeddingModel?: string;
        temperature?: number;
        maxTokens?: number;
        timeoutMs?: number;
        retryCount?: number;
        taskModels?: unknown;
        featureToggles?: unknown;
      };
      const taskModels = Object.fromEntries(
        Object.entries(mapToObject(settingsRecord.taskModels)).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      );
      config.defaultProvider = settingsRecord.defaultProvider || config.defaultProvider;
      config.defaultModel = settingsRecord.defaultModel || config.defaultModel;
      config.embeddingModel = settingsRecord.embeddingModel || config.embeddingModel;
      config.temperature = Number(settingsRecord.temperature ?? config.temperature);
      config.maxTokens = Number(settingsRecord.maxTokens ?? config.maxTokens);
      config.timeoutMs = Number(settingsRecord.timeoutMs ?? config.timeoutMs);
      config.retryCount = Number(settingsRecord.retryCount ?? config.retryCount);
      config.taskModels = { ...config.taskModels, ...taskModels };
      config.featureToggles = mapToObject(settingsRecord.featureToggles) as Record<string, boolean>;
    }
  } catch {
    // Env-only config is valid. DB settings must never block AI calls.
  }

  config.taskModels.embedding = config.embeddingModel;
  return config;
}

async function logAICall(input: {
  provider: string;
  taskType: string;
  selectedModel: string;
  latencyMs: number;
  status: 'success' | 'failure';
  fallbackUsed?: boolean;
  fallbackStage?: string;
  confidence?: number;
  jsonParsingErrors?: number;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
  error?: string;
}) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { AICallLog } = await import('@/models/AICallLog');
    await dbConnect();
    await AICallLog.create({
      provider: input.provider,
      taskType: input.taskType,
      selectedModel: input.selectedModel,
      latencyMs: input.latencyMs,
      status: input.status,
      fallbackUsed: Boolean(input.fallbackUsed),
      fallbackStage: input.fallbackStage,
      confidence: input.confidence,
      jsonParsingErrors: input.jsonParsingErrors || 0,
      estimatedInputTokens: input.estimatedInputTokens || 0,
      estimatedOutputTokens: input.estimatedOutputTokens || 0,
      error: input.error?.slice(0, 500),
    });
  } catch {
    /* logging is best-effort */
  }
}

function buildMessages(input: AIGenerateInput): AIMessage[] {
  if (input.messages?.length) return input.messages;
  const messages: AIMessage[] = [];
  if (input.system) messages.push({ role: 'system', content: input.system });
  if (input.prompt) messages.push({ role: 'user', content: input.prompt });
  return messages;
}

async function ollamaJson<T>(
  config: RuntimeAIConfig,
  path: string,
  body: unknown,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Ollama Cloud API error (${response.status}): ${detail || response.statusText}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function callChatModel(
  config: RuntimeAIConfig,
  model: string,
  messages: AIMessage[],
  input: AIGenerateInput,
  format?: 'json',
): Promise<string> {
  const result = await ollamaJson<{ message?: { content?: string }; response?: string }>(
    config,
    '/api/chat',
    {
      model,
      messages,
      stream: false,
      ...(format ? { format } : {}),
      options: {
        temperature: input.temperature ?? config.temperature,
        num_predict: input.maxTokens ?? config.maxTokens,
      },
    },
    input.timeoutMs ?? config.timeoutMs,
  );
  return String(result.message?.content || result.response || '').trim();
}

function selectModel(config: RuntimeAIConfig, task: AITaskType, explicit?: string): string {
  if (explicit) return explicit;
  return config.taskModels[task] || DEFAULT_MODELS[task] || config.defaultModel;
}

function secondaryModel(config: RuntimeAIConfig, primary: string): string | null {
  const secondary = config.secondaryModel || config.defaultModel;
  return secondary && secondary !== primary ? secondary : null;
}

async function generate(input: AIGenerateInput): Promise<AIGenerateResult> {
  const started = Date.now();
  const messages = buildMessages(input);
  const promptText = messages.map((m) => m.content).join('\n');

  try {
    const config = await getRuntimeConfig();
    if (config.defaultProvider !== PROVIDER) {
      throw new Error(`Unsupported AI provider "${config.defaultProvider}". Expected ollama_cloud.`);
    }

    const primary = selectModel(config, input.task, input.model);
    const models = [primary, secondaryModel(config, primary)].filter(Boolean) as string[];
    let lastError: unknown;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        const text = await callChatModel(config, model, messages, input);
        if (!text) throw new Error('Ollama Cloud returned an empty response');
        const latencyMs = Date.now() - started;
        await logAICall({
          provider: PROVIDER,
          taskType: input.task,
          selectedModel: model,
          latencyMs,
          status: 'success',
          fallbackUsed: i > 0,
          fallbackStage: i > 0 ? 'secondary_ollama_cloud_model' : undefined,
          confidence: input.confidence,
          estimatedInputTokens: estimateTokens(promptText),
          estimatedOutputTokens: estimateTokens(text),
        });
        return {
          text,
          provider: PROVIDER,
          selectedModel: model,
          fallbackUsed: i > 0,
          confidence: input.confidence,
          latencyMs,
          estimatedInputTokens: estimateTokens(promptText),
          estimatedOutputTokens: estimateTokens(text),
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  } catch (error) {
    const latencyMs = Date.now() - started;
    const fallbackText = input.fallbackText;
    await logAICall({
      provider: PROVIDER,
      taskType: input.task,
      selectedModel: input.model || 'unavailable',
      latencyMs,
      status: fallbackText ? 'success' : 'failure',
      fallbackUsed: true,
      fallbackStage: fallbackText ? 'rule_based' : 'human_review',
      confidence: fallbackText ? 0 : input.confidence,
      estimatedInputTokens: estimateTokens(promptText),
      estimatedOutputTokens: estimateTokens(fallbackText || ''),
      error: error instanceof Error ? error.message : String(error),
    });
    if (fallbackText !== undefined) {
      return {
        text: fallbackText,
        provider: 'rule_based',
        selectedModel: 'rule-based',
        fallbackUsed: true,
        confidence: 0,
        latencyMs,
        estimatedInputTokens: estimateTokens(promptText),
        estimatedOutputTokens: estimateTokens(fallbackText),
      };
    }
    throw error;
  }
}

async function extractJSON<T>(input: AIJSONInput<T>): Promise<T> {
  const started = Date.now();
  const baseMessages = buildMessages(input);
  const schemaText = input.schema ? `\nThe response must validate the provided schema.` : '';
  const strictSystem = [
    'Return strictly valid JSON only. No markdown fences, comments, explanations, or trailing commas.',
    'If a field is unknown, use an empty string, 0, false, or an empty array as appropriate.',
    schemaText,
  ].join('\n');
  const messages = [{ role: 'system' as const, content: strictSystem }, ...baseMessages];
  const promptText = messages.map((m) => m.content).join('\n');
  let jsonParsingErrors = 0;
  let lastError = '';

  try {
    const config = await getRuntimeConfig();
    const primary = selectModel(config, input.task || 'json', input.model);
    const secondary = secondaryModel(config, primary);
    const attempts = [
      { model: primary, retry: false },
      { model: primary, retry: true },
      ...(secondary ? [{ model: secondary, retry: false }] : []),
    ];

    for (let index = 0; index < attempts.length; index++) {
      const attempt = attempts[index];
      try {
        const attemptMessages = attempt.retry
          ? [
              ...messages,
              {
                role: 'user' as const,
                content: 'Your previous response was not valid JSON. Return only one valid JSON object matching the requested schema.',
              },
            ]
          : messages;
        const raw = await callChatModel(config, attempt.model, attemptMessages, input, 'json');
        const parsed = JSON.parse(stripJsonFences(raw));
        const value = input.schema ? input.schema.parse(parsed) : (parsed as T);
        await logAICall({
          provider: PROVIDER,
          taskType: input.task,
          selectedModel: attempt.model,
          latencyMs: Date.now() - started,
          status: 'success',
          fallbackUsed: index > 0,
          fallbackStage: index === 1 ? 'json_retry' : index > 1 ? 'secondary_ollama_cloud_model' : undefined,
          confidence: input.confidence,
          jsonParsingErrors,
          estimatedInputTokens: estimateTokens(promptText),
          estimatedOutputTokens: estimateTokens(JSON.stringify(value)),
        });
        return value;
      } catch (error) {
        jsonParsingErrors += 1;
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
  } catch (error) {
    jsonParsingErrors += 1;
    lastError = error instanceof Error ? error.message : String(error);
  }

  await logAICall({
    provider: PROVIDER,
    taskType: input.task,
    selectedModel: input.model || 'rule-based',
    latencyMs: Date.now() - started,
    status: 'success',
    fallbackUsed: true,
    fallbackStage: 'rule_based',
    confidence: 0,
    jsonParsingErrors,
    estimatedInputTokens: estimateTokens(promptText),
    estimatedOutputTokens: estimateTokens(JSON.stringify(input.fallback)),
    error: lastError,
  });
  return input.fallback;
}

async function embed(text: string, task: AITaskType = 'embedding'): Promise<number[]> {
  const started = Date.now();
  const prompt = text.slice(0, 8000);
  let model = getAIEmbeddingModelName();
  try {
    const config = await getRuntimeConfig();
    model = selectModel(config, 'embedding');
    const result = await ollamaJson<{ embeddings?: number[][]; embedding?: number[] }>(
      config,
      '/api/embed',
      { model, input: prompt },
      config.timeoutMs,
    ).catch(() =>
      ollamaJson<{ embeddings?: number[][]; embedding?: number[] }>(
        config,
        '/api/embeddings',
        { model, prompt },
        config.timeoutMs,
      ),
    );
    const embedding = result.embedding || result.embeddings?.[0] || [];
    if (!Array.isArray(embedding) || !embedding.length) throw new Error('Ollama Cloud returned no embedding');
    await logAICall({
      provider: PROVIDER,
      taskType: task,
      selectedModel: model,
      latencyMs: Date.now() - started,
      status: 'success',
      estimatedInputTokens: estimateTokens(prompt),
      estimatedOutputTokens: embedding.length,
    });
    return embedding;
  } catch (error) {
    await logAICall({
      provider: PROVIDER,
      taskType: task,
      selectedModel: model,
      latencyMs: Date.now() - started,
      status: 'failure',
      fallbackUsed: true,
      fallbackStage: 'human_review',
      estimatedInputTokens: estimateTokens(prompt),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function classify<T>(input: AIJSONInput<T>): Promise<T> {
  return extractJSON({ ...input, task: input.task || 'classification' });
}

async function summarize(input: Omit<AIGenerateInput, 'task'>): Promise<AIGenerateResult> {
  return generate({ ...input, task: 'summary' });
}

async function healthCheck(): Promise<{ ok: boolean; provider: string; baseUrlConfigured: boolean; apiKeyConfigured: boolean; error?: string }> {
  try {
    const config = await getRuntimeConfig();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(5000, config.timeoutMs));
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
    });
    clearTimeout(timer);
    return {
      ok: response.ok,
      provider: PROVIDER,
      baseUrlConfigured: Boolean(config.baseUrl),
      apiKeyConfigured: Boolean(config.apiKey),
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      provider: PROVIDER,
      baseUrlConfigured: Boolean(env('OLLAMA_CLOUD_BASE_URL')),
      apiKeyConfigured: Boolean(env('OLLAMA_CLOUD_API_KEY')),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function getAIModelName(task: AITaskType = 'general'): string {
  const defaultModel = env('OLLAMA_DEFAULT_MODEL') || DEFAULT_MODELS.general;
  const embeddingModel = env('OLLAMA_EMBEDDING_MODEL') || DEFAULT_MODELS.embedding;
  return envTaskModels(defaultModel, embeddingModel)[task] || defaultModel;
}

export function getAIEmbeddingModelName(): string {
  return env('OLLAMA_EMBEDDING_MODEL') || DEFAULT_MODELS.embedding;
}

export async function getAIProviderConfigForAdmin() {
  const config = await getRuntimeConfig().catch(() => null);
  const health = await healthCheck();
  const fallbackModel = env('OLLAMA_DEFAULT_MODEL') || DEFAULT_MODELS.general;
  return {
    provider: config?.defaultProvider || PROVIDER,
    disableGemini: process.env.AI_DISABLE_GEMINI !== 'false',
    baseUrlConfigured: Boolean(env('OLLAMA_CLOUD_BASE_URL')),
    apiKeyConfigured: Boolean(env('OLLAMA_CLOUD_API_KEY')),
    defaultModel: config?.defaultModel || fallbackModel,
    secondaryModel: config?.secondaryModel || env('OLLAMA_SECONDARY_MODEL') || 'llama3.1',
    embeddingModel: config?.embeddingModel || env('OLLAMA_EMBEDDING_MODEL') || DEFAULT_MODELS.embedding,
    taskModels: config?.taskModels || envTaskModels(fallbackModel, env('OLLAMA_EMBEDDING_MODEL') || DEFAULT_MODELS.embedding),
    temperature: config?.temperature ?? 0.35,
    maxTokens: config?.maxTokens ?? 800,
    timeoutMs: config?.timeoutMs ?? 30000,
    retryCount: config?.retryCount ?? 1,
    featureToggles: config?.featureToggles || {},
    health,
  };
}

export const AIProvider = {
  generate,
  classify,
  embed,
  summarize,
  extractJSON,
  healthCheck,
};
