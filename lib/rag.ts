import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

export const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const TOP_K = 3;
const SIMILARITY_THRESHOLD = 0.45;

interface KnowledgeArticleVector {
  title?: string;
  category?: string;
  tags?: string[];
  roleVisibility?: string[];
  content?: unknown;
  embedding?: number[];
}

const INTERNAL_KB_TERMS = [
  "playbook",
  "qualification",
  "discovery",
  "objection",
  "closing",
  "employee",
  "admin",
  "internal",
  "handbook",
  "commission",
];

function getGenAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
}

function collectBlockText(value: unknown, parts: string[]) {
  if (!value) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) parts.push(trimmed);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectBlockText(item, parts);
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  if (typeof record.text === "string") {
    const trimmed = record.text.trim();
    if (trimmed) parts.push(trimmed);
  }

  collectBlockText(record.content, parts);
  collectBlockText(record.children, parts);
}

function looksLikeEditorJson(text: string) {
  return /"(id|props|backgroundColor|textAlignment|children)"\s*:/.test(text) || /\b(type|props|styles):/.test(text);
}

export function articleToPlainText(rawContent: unknown, maxLen = 1500): string {
  const raw = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    const parts: string[] = [];
    collectBlockText(parsed, parts);
    return parts.join("\n").replace(/\s{3,}/g, " ").slice(0, maxLen).trim();
  } catch {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) return "";
    if (looksLikeEditorJson(trimmed)) return "";
    return trimmed.replace(/\s{2,}/g, " ").slice(0, maxLen).trim();
  }
}

export function isClientSafeArticle(article: {
  title?: string;
  category?: string;
  tags?: string[];
  roleVisibility?: string[];
}) {
  const roles = article.roleVisibility || [];
  if (roles.includes("admin") || roles.includes("employee") || roles.includes("intern")) return false;

  const haystack = [article.title, article.category, ...(article.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return !INTERNAL_KB_TERMS.some(term => haystack.includes(term));
}

export function buildArticleText(article: { title: string; subtitle?: string; tags?: string[]; content: unknown }): string {
  const parts = [
    article.title,
    article.subtitle ?? "",
    (article.tags ?? []).join(" "),
    articleToPlainText(article.content, 1500),
  ];
  return parts.filter(Boolean).join("\n").trim();
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

export async function generateEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text: text.slice(0, 8000) }], role: "user" },
    taskType: TaskType[taskType],
  });
  return result.embedding.values;
}

export async function getRAGContext(query: string): Promise<string> {
  try {
    const { default: dbConnect } = await import("./mongodb");
    const { KnowledgeArticle } = await import("@/models/KnowledgeArticle");
    await dbConnect();

    const articles = await KnowledgeArticle.find(
      {
        status: "published",
        $or: [{ roleVisibility: "all" }, { roleVisibility: "client" }],
        embedding: { $exists: true, $not: { $size: 0 } },
      },
      { title: 1, subtitle: 1, category: 1, tags: 1, roleVisibility: 1, content: 1, embedding: 1 }
    ).lean();

    const safeArticles = (articles as KnowledgeArticleVector[]).filter(isClientSafeArticle);
    if (!safeArticles.length) return "";

    const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");

    const scored = safeArticles
      .filter(a => Array.isArray(a.embedding) && a.embedding.length > 0)
      .map(a => ({ article: a, score: cosineSimilarity(queryEmbedding, a.embedding!) }))
      .filter(({ score }) => score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    if (!scored.length) return "";

    return scored
      .map(({ article }) => {
        const text = articleToPlainText(article.content, 700);
        return text ? `[INTERNAL GUIDANCE - do not mention the source]\n${text}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return "";
  }
}
