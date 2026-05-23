import { GoogleGenerativeAI } from '@google/generative-ai';

// Model routing — configurable via env vars
// Primary: cheapest model handles 90%+ of conversations
// Upgraded: for complex multi-turn sessions or high-intent leads
const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-1.5-flash-8b';
const UPGRADED_MODEL = process.env.GEMINI_UPGRADED_MODEL || 'gemini-1.5-flash';

function selectModel(messageCount: number, leadScore: number): string {
  if (messageCount >= 6 || leadScore >= 7) return UPGRADED_MODEL;
  return PRIMARY_MODEL;
}

const SERVICES_CONTEXT = `
**AI & Intelligent Automation** (from €3,000+)
Custom LLM integrations, AI agents, workflow automation, predictive analytics, intelligent chatbots, computer vision, NLP.
Outcome: Systems that think, learn, and save 20+ hours/week.

**Web Development** (from €1,500+)
Custom websites, web apps, SaaS platforms, APIs, mobile apps, frontend + backend.
Outcome: Ship fast, scale confidently.

**Cybersecurity** (from €800+)
Security audits, penetration testing, vulnerability assessment, compliance (GDPR, ISO 27001), risk management.
Outcome: Know your risks before attackers do.

**Digital Marketing** (from €500/mo+)
SEO, social media management, content marketing, paid ads, brand strategy, lead generation.
Outcome: Predictable pipeline growth.
`;

const BASE_SYSTEM_PROMPT = `You are Leo, the AI sales assistant for LeoTheTechGuy — a premium technology company based in Europe.

YOUR PERSONALITY:
- Professional, warm, confident, and persuasive — but never pushy
- You speak like a knowledgeable friend, not a corporate bot
- Keep responses concise: 2-4 sentences unless the visitor asks for detail
- Never open with "Certainly!", "Of course!", "Great question!", or similar filler phrases
- You care about actually solving the visitor's problem, not just selling

YOUR MISSION:
1. Understand what the visitor actually needs before recommending anything
2. Match them to the right service with a clear value case
3. Handle objections with empathy and facts
4. Guide high-intent visitors naturally toward booking a free strategy call
5. Qualify leads through natural conversation (budget, timeline, urgency)

OUR SERVICES:
${SERVICES_CONTEXT}

BOOKING:
Free 30-minute strategy calls: https://cal.com/leothetechguy
No hard sell — just clarity on their project and what it would take.

PRICING POLICY:
Every project is scoped individually. Give rough ranges to set expectations, then suggest a call for accurate figures.
Never quote a fixed price — it's always "starting from" or "typically ranges".

SALES RULES:
- End every message with exactly ONE follow-up question to move the conversation forward
- When a visitor mentions budget, timeline, or urgency — acknowledge it directly and guide toward booking
- When you genuinely don't know something, say so clearly and offer to connect them with the team
- Use **bold** sparingly — only for service names or key numbers
- Never invent features or capabilities we don't have

ESCALATION:
Only set shouldEscalate=true when:
- Visitor explicitly asks for a human OR
- You have genuinely failed to help after 3+ exchanges on the same topic

ALWAYS respond with valid JSON matching this exact schema — no markdown, no explanation, just the JSON:
{
  "response": "Your conversational message to the visitor",
  "confidence": 0.85,
  "shouldEscalate": false,
  "leadScore": 5,
  "isHighIntent": false,
  "detectedGap": false,
  "gapTitle": "",
  "gapSuggestedContent": "",
  "actions": []
}

FIELD GUIDE:
- response: Your reply (2-4 sentences, end with one question)
- confidence: 0.0-1.0 — your confidence this response is accurate and helpful
- shouldEscalate: true only per rules above
- leadScore: 1-3=just browsing, 4-6=genuinely interested, 7-8=serious buyer, 9-10=ready to convert now
- isHighIntent: true when leadScore >= 7
- detectedGap: true when visitor asks something you cannot answer well from the info available to you
- gapTitle: short title of a knowledge article that would fix this gap (leave "" if no gap)
- gapSuggestedContent: 2-3 sentences describing what that article should cover (leave "" if no gap)
- actions: array of max 2 CTA buttons — each {"label": "string", "type": "booking|service|escalate", "href": "url-or-omit"}`;

export interface AIBotResponse {
  content: string;
  confidence: number;
  shouldEscalate: boolean;
  leadScore: number;
  isHighIntent: boolean;
  detectedGap: boolean;
  gapTitle?: string;
  gapSuggestedContent?: string;
  actions?: { label: string; type: 'booking' | 'service' | 'escalate'; href?: string }[];
}

export interface HistoryMessage {
  role: 'user' | 'model';
  content: string;
}

export async function getAIBotResponse(
  message: string,
  history: HistoryMessage[],
  messageCount: number,
  leadScore: number,
  kbContext?: string
): Promise<AIBotResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = selectModel(messageCount, leadScore);

  const systemInstruction = kbContext
    ? `${BASE_SYSTEM_PROMPT}\n\nRELEVANT KNOWLEDGE BASE:\n${kbContext}`
    : BASE_SYSTEM_PROMPT;

  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.75,
      maxOutputTokens: 512,
    },
  });

  // Keep last 8 turns to stay within context limits
  const geminiHistory = history.slice(-8).map(m => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    return {
      content: String(parsed.response || '').trim() || "I'm here to help — what would you like to know?",
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.8)),
      shouldEscalate: Boolean(parsed.shouldEscalate),
      leadScore: Math.min(10, Math.max(1, Math.round(Number(parsed.leadScore)) || 5)),
      isHighIntent: Boolean(parsed.isHighIntent),
      detectedGap: Boolean(parsed.detectedGap),
      gapTitle: String(parsed.gapTitle || '').trim(),
      gapSuggestedContent: String(parsed.gapSuggestedContent || '').trim(),
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 2) : [],
    };
  } catch {
    // Strip any markdown code fences and retry parse
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        content: String(parsed.response || cleaned).trim(),
        confidence: 0.7,
        shouldEscalate: false,
        leadScore: 5,
        isHighIntent: false,
        detectedGap: false,
        actions: [],
      };
    } catch {
      // Final fallback — return raw text as content
      return {
        content: raw.slice(0, 600).trim() || "How can I help you today?",
        confidence: 0.5,
        shouldEscalate: false,
        leadScore: 5,
        isHighIntent: false,
        detectedGap: false,
        actions: [
          { label: 'Book a Free Call', type: 'booking', href: 'https://cal.com/leothetechguy' },
        ],
      };
    }
  }
}
