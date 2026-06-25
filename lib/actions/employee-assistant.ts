'use server';

/**
 * Employee AI Assistant (Phase B, spec §5).
 *
 * An internal RAG assistant over the knowledge base (SOPs, pricing, playbooks,
 * contracts, workflows). Reuses the unified retriever (audience-scoped, so a user
 * never sees content above their role) and the same AI answer-with-context
 * pattern as the public chatbot — but answers from internal knowledge only and
 * never hallucinates: on low confidence it says so and points to the right team.
 *
 * RBAC: employee/admin/intern only. Conversations are owned by the asker.
 */

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { getAccountByEmail } from '@/lib/data/account';
import { AIProvider } from '@/lib/ai/provider';
import type { KbAudience } from '@/lib/knowledge/constants';


const ASSISTANT_SYSTEM = `You are the internal AI assistant for the LeoTheTechGuy team. You help staff (employees, interns, admins) get fast, accurate answers from the company's internal knowledge base — SOPs, pricing guidance, sales playbooks, contracts, and workflows.

RULES:
- Answer ONLY from the INTERNAL KNOWLEDGE provided. Do not invent policies, prices, steps, or facts.
- If the knowledge provided does not contain the answer, say clearly that it is not documented yet and suggest who to ask or that a knowledge article should be created. Never guess.
- Be concise and practical. Use short paragraphs or numbered steps. British English.
- You are talking to staff, so internal detail is fine — but never fabricate.
- Do not mention "the context", "the documents", or that a knowledge base was injected — just answer naturally as a knowledgeable colleague.
- Output plain text only (light markdown allowed). No JSON.`;

interface AskResult {
  success: boolean;
  conversationId: string;
  answer: string;
  confidence: string;
  sources: { title: string; slug?: string; articleId?: string }[];
  error?: string;
}

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee' && role !== 'intern') {
    throw new Error('Unauthorized');
  }
  if (!session?.user?.email) throw new Error('Unauthorized');
  const account = await getAccountByEmail(session.user.email);
  if (!account) throw new Error('Account not found');
  return { account, role };
}

function audienceForRole(role?: string): KbAudience {
  if (role === 'admin') return 'admin';
  return 'employee'; // employees + interns share the internal scope
}

const LOW_CONFIDENCE_ANSWER =
  "I couldn't find this in our internal knowledge base yet. It may not be documented — check with your team lead, and consider adding a knowledge article so the next person gets an instant answer.";

/**
 * Ask the assistant a question. Creates a new conversation when conversationId is
 * empty, otherwise appends to an existing (owned) one. Never throws to the UI for
 * AI failures — returns a safe message instead.
 */
export async function askEmployeeAssistant(
  conversationId: string | null,
  message: string,
): Promise<AskResult> {
  const { account, role } = await requireStaff();
  const trimmed = (message || '').trim().slice(0, 2000);
  if (!trimmed) throw new Error('Message cannot be empty');

  await dbConnect();
  const { AssistantConversation } = await import('@/models/AssistantConversation');

  // Load or create the conversation (ownership enforced).
  let convo;
  if (conversationId) {
    convo = await AssistantConversation.findOne({ _id: conversationId, accountId: account._id });
    if (!convo) throw new Error('Conversation not found');
  } else {
    convo = await AssistantConversation.create({
      accountId: account._id,
      accountEmail: account.email,
      role,
      title: trimmed.slice(0, 60),
      messages: [],
    });
  }

  convo.messages.push({ role: 'user', content: trimmed, createdAt: new Date() } as any);

  // Retrieve internal knowledge scoped to the asker's role.
  let confidence = 'low';
  let sources: { title: string; slug?: string; articleId?: string }[] = [];
  let answer = LOW_CONFIDENCE_ANSWER;

  try {
    const { retrieveKnowledge } = await import('@/lib/services/knowledge-retrieval');
    const retrieval = await retrieveKnowledge({
      source: 'employee_assistant',
      query: trimmed,
      audience: audienceForRole(role),
      userEmail: account.email,
      topN: 4,
    });
    confidence = retrieval.confidence;
    sources = retrieval.articles.map((a) => ({ title: a.title, slug: a.slug, articleId: a.id }));

    if (!retrieval.shouldEscalate && retrieval.chunks.length ) {
      const history = convo.messages
        .slice(-9, -1)
        .filter((m: any) => m.content)
        .map((m: any) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }));

      const result = await AIProvider.generate({
        task: 'employee_assistant',
        messages: [
          {
            role: 'system',
            content: ASSISTANT_SYSTEM + String.fromCharCode(10) + String.fromCharCode(10) + 'INTERNAL KNOWLEDGE:' + String.fromCharCode(10) + retrieval.chunks.join(String.fromCharCode(10) + String.fromCharCode(10) + '---' + String.fromCharCode(10) + String.fromCharCode(10)),
          },
          ...history,
          { role: 'user', content: trimmed },
        ],
        temperature: 0.3,
        maxTokens: 800,
        fallbackText: LOW_CONFIDENCE_ANSWER,
      });
      const text = result.text.trim();
      if (text) answer = text;
    } else {
      // Low confidence / no context / provider unavailable → no-hallucination fallback.
      answer = LOW_CONFIDENCE_ANSWER;
      sources = []; // don't imply weak matches answered the question
    }
  } catch {
    answer = LOW_CONFIDENCE_ANSWER;
  }

  convo.messages.push({
    role: 'assistant',
    content: answer,
    sources: sources.length
      ? sources.map((s) => ({ title: s.title, slug: s.slug, articleId: s.articleId as any }))
      : undefined,
    confidence,
    createdAt: new Date(),
  } as any);

  await convo.save();
  revalidatePath('/portal/employee/assistant');

  return {
    success: true,
    conversationId: String(convo._id),
    answer,
    confidence,
    sources,
  };
}

export interface AssistantConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

/** List the current user's conversations (most recent first). */
export async function getAssistantConversations(): Promise<AssistantConversationSummary[]> {
  const { account } = await requireStaff();
  await dbConnect();
  const { AssistantConversation } = await import('@/models/AssistantConversation');
  const convos = await AssistantConversation.find({ accountId: account._id })
    .select('title updatedAt messages')
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();
  return (convos as any[]).map((c) => ({
    id: String(c._id),
    title: c.title || 'Conversation',
    updatedAt: new Date(c.updatedAt).toISOString(),
    messageCount: c.messages?.length || 0,
  }));
}

export interface AssistantMessageView {
  role: string;
  content: string;
  sources?: { title: string; slug?: string; articleId?: string }[];
  confidence?: string;
}

/** Load a single conversation's messages (ownership enforced). */
export async function getAssistantConversation(
  conversationId: string,
): Promise<{ id: string; title: string; messages: AssistantMessageView[] } | null> {
  const { account } = await requireStaff();
  await dbConnect();
  const { AssistantConversation } = await import('@/models/AssistantConversation');
  const convo = await AssistantConversation.findOne({
    _id: conversationId,
    accountId: account._id,
  }).lean();
  if (!convo) return null;
  const c = convo as any;
  return {
    id: String(c._id),
    title: c.title,
    messages: (c.messages || []).map((m: any) => ({
      role: m.role,
      content: m.content,
      sources: m.sources?.map((s: any) => ({
        title: s.title,
        slug: s.slug,
        articleId: s.articleId ? String(s.articleId) : undefined,
      })),
      confidence: m.confidence,
    })),
  };
}

/** Delete one of the current user's conversations. */
export async function deleteAssistantConversation(conversationId: string) {
  const { account } = await requireStaff();
  await dbConnect();
  const { AssistantConversation } = await import('@/models/AssistantConversation');
  await AssistantConversation.deleteOne({ _id: conversationId, accountId: account._id });
  revalidatePath('/portal/employee/assistant');
  return { success: true };
}
