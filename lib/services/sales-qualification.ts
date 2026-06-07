/**
 * Sales automation — chatbot → qualified lead (Phase C, spec §6).
 *
 * When a visitor conversation shows real buying intent, this turns it into a CRM
 * Lead: service interest, country, an AI summary, lead score and the transcript —
 * so the team picks up where the bot left off. It reuses the existing Lead model
 * and admin lead surfaces; nothing about the chatbot UX changes.
 *
 * Guardrails:
 *  - Fire-and-forget: never throws, never blocks the chat response.
 *  - Idempotent per session (won't create duplicate leads on later turns).
 *  - Only fires on genuine intent (lead score threshold) with some way to follow up.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL =
  process.env.GEMINI_SALES_MODEL || process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.5-flash';

// Lead score at/above which we consider the visitor a qualified lead.
const QUALIFY_SCORE = 7;

export interface ChatSessionForLead {
  sessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  detectedCountry?: string;
  leadScore?: number;
  leadSummary?: string;
  messages: { role: string; content: string }[];
}

interface QualifiedLead {
  serviceInterest?: string;
  summary: string;
  estimatedBudget?: number;
  contactName?: string;
}

const SUMMARY_SYSTEM = `You read a sales chat between a website visitor and "Leo" (an AI assistant) for LeoTheTechGuy, a technology company. You produce a concise CRM lead summary for the sales team.

Respond with valid JSON ONLY, matching exactly:
{"serviceInterest":"short label of what they want (e.g. 'Web development', 'AI automation', 'Cybersecurity', 'Digital marketing') or ''","summary":"2-3 sentence summary of who they are, what they need, country, timeline and urgency — facts only, no fluff","estimatedBudget":0,"contactName":"their name if stated, else ''"}

Rules: never invent details the chat does not contain. estimatedBudget is a number in their currency if they stated one, else 0.`;

function buildTranscript(messages: { role: string; content: string }[]): string {
  return messages
    .filter((m) => m.role === 'visitor' || m.role === 'bot')
    .map((m) => `${m.role === 'visitor' ? 'Visitor' : 'Leo'}: ${m.content}`)
    .join('\n')
    .slice(0, 6000);
}

async function summariseLead(transcript: string, fallbackSummary?: string): Promise<QualifiedLead> {
  const fallback: QualifiedLead = { summary: fallbackSummary || 'Qualified via chat.', estimatedBudget: 0 };
  if (!process.env.GOOGLE_AI_API_KEY) return fallback;
  try {
    const model = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY).getGenerativeModel({
      model: MODEL,
      systemInstruction: SUMMARY_SYSTEM,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 400 },
    });
    const result = await model.generateContent(`CHAT TRANSCRIPT:\n${transcript}`);
    const parsed = JSON.parse(result.response.text().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim());
    return {
      serviceInterest: String(parsed.serviceInterest || '').trim().slice(0, 80) || undefined,
      summary: String(parsed.summary || '').trim().slice(0, 800) || fallback.summary,
      estimatedBudget: Number(parsed.estimatedBudget) > 0 ? Number(parsed.estimatedBudget) : undefined,
      contactName: String(parsed.contactName || '').trim().slice(0, 80) || undefined,
    };
  } catch {
    return fallback;
  }
}

/**
 * Create a CRM lead from a qualifying chat session. Returns the new lead id, or
 * null when skipped (below threshold, no contact path, already converted, error).
 */
export async function maybeCreateLeadFromChat(session: ChatSessionForLead): Promise<string | null> {
  try {
    const score = session.leadScore ?? 0;
    if (score < QUALIFY_SCORE) return null;

    // Need at least one way to identify/follow up.
    const hasContact = Boolean(session.visitorEmail || session.visitorName);
    if (!hasContact) return null;

    const { default: dbConnect } = await import('@/lib/mongodb');
    const Lead = (await import('@/models/Lead')).default;
    await dbConnect();

    // Idempotency — one chatbot lead per session.
    const marker = `chat:${session.sessionId}`;
    const existing = await Lead.findOne({ notes: new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })
      .select('_id')
      .lean();
    if (existing) return null;

    const transcript = buildTranscript(session.messages);
    const enriched = await summariseLead(transcript, session.leadSummary);

    const contactName = session.visitorName || enriched.contactName;
    const notes = [
      enriched.summary,
      session.detectedCountry ? `Country: ${session.detectedCountry}` : '',
      `Lead score: ${score}/10`,
      `[${marker}]`,
      '',
      '--- Transcript ---',
      transcript,
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 8000);

    const lead = await Lead.create({
      source: 'chatbot',
      status: session.visitorEmail ? 'qualified' : 'new',
      clientName: contactName,
      contactName,
      clientEmail: session.visitorEmail,
      businessName: undefined,
      serviceInterest: enriched.serviceInterest,
      dealValue: enriched.estimatedBudget,
      notes,
    });

    // Best-effort audit.
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        entityType: 'lead',
        entityId: lead._id,
        action: 'lead_created_from_chat',
        performedBy: 'chatbot',
        details: { sessionId: session.sessionId, leadScore: score, serviceInterest: enriched.serviceInterest },
        metadata: { source: 'chatbot' },
      });
    } catch {
      /* non-blocking */
    }

    return String(lead._id);
  } catch {
    return null;
  }
}
