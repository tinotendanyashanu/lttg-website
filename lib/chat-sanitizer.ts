// Final safety layer between the bot (AI or fallback) and the customer.
// Knowledge articles, prompts, and internal docs are reasoning material ONLY —
// they must never reach a visitor verbatim. This is the single chokepoint that
// guarantees it, regardless of what the model or KB layer produced.

const SAFE_FALLBACK =
  "I want to make sure I get this exactly right for you. Could you tell me a bit more about what you're looking for? I can also connect you with a member of our team.";

// Hard-block signals: the reply is a raw retrieval chunk, a leaked system prompt,
// editor JSON, or debug output. These can't be safely scrubbed, so the whole
// message is discarded and replaced with a neutral, helpful reply.
const RAW_LEAK_SIGNALS: RegExp[] = [
  /\[internal guidance/i, // our own retrieval marker
  /"(?:id|props|backgroundColor|textAlignment|children|blockType)"\s*:/i, // BlockNote/editor JSON
  /\b(?:YOUR PERSONALITY|YOUR MISSION|SALES RULES|FIELD GUIDE|PRICING POLICY|ESCALATION:|CONFIDENTIALITY)\b/, // our prompt section headers
  /You are Leo, the AI sales assistant/i, // verbatim system prompt
  /\b(?:responseMimeType|systemInstruction|generationConfig|maxOutputTokens)\b/, // SDK/config leakage
  /"(?:response|confidence|shouldEscalate|leadScore|detectedGap)"\s*:/i, // our raw JSON schema
  /\bas an ai language model\b/i, // generic model self-reference
  /-----BEGIN [A-Z ]+-----/, // keys/certs
  /<\|[a-z_]+\|>/i, // chat template tokens
];

// Soft-scrub: internal terminology that should never be spoken to a customer.
// Removed in-place; surrounding text is preserved.
const BANNED_PHRASES: RegExp[] = [
  /according to (?:our |the )?internal (?:documentation|knowledge base|docs?)[,:]?\s*/gi,
  /as (?:stated|outlined|described|mentioned|noted) in (?:our |the )?(?:internal )?(?:knowledge base|documentation|playbook|sop)[^.,;]*[,.:]?\s*/gi,
  /\b(?:our |the )?internal knowledge base\b/gi,
  /\bknowledge base article\b/gi,
  /\bknowledge base\b/gi,
  /\bsales pricing guide\b/gi,
  /\bpricing (?:sheet|guide)\b/gi,
  /\bfor internal use(?: only)?\b/gi,
  /\binternal documentation\b/gi,
  /\b(?:standard operating procedure|sop)s?\b/gi,
];

function looksLikeRawLeak(text: string): boolean {
  return RAW_LEAK_SIGNALS.some(re => re.test(text));
}

function tidy(text: string): string {
  return text
    .replace(/\[[^\]]*internal[^\]]*\]/gi, "") // strip any bracketed internal tags
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\s,.;:]+/, "")
    .trim();
}

/**
 * Sanitize a bot reply before it is persisted or sent to the visitor.
 * Returns a polished, customer-safe string — never raw documents, prompts, or debug output.
 */
export function sanitizeBotReply(input: unknown): string {
  let text = typeof input === "string" ? input.trim() : "";
  if (!text) return SAFE_FALLBACK;

  // 1. Discard anything that is a raw dump rather than a conversational reply.
  if (looksLikeRawLeak(text)) return SAFE_FALLBACK;

  // 2. Scrub internal terminology that slipped into otherwise-normal prose.
  for (const re of BANNED_PHRASES) text = text.replace(re, "");

  // 3. Clean up artifacts left by the scrub.
  text = tidy(text);

  // 4. If scrubbing gutted the message, fall back to something safe.
  if (text.length < 2) return SAFE_FALLBACK;

  return text;
}

export { SAFE_FALLBACK };
