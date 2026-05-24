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
  /\bpricing (?:sheet|guide|table)\b/gi,
  /\b(?:rate card|price list)\b/gi,
  /\bfor internal use(?: only)?\b/gi,
  /\binternal documentation\b/gi,
  /\b(?:standard operating procedure|sop)s?\b/gi,
];

// Pricing is never quoted in chat — a human gives the actual, region-specific
// quote. Any monetary figure that slips through (symbol-, code-, or word-tagged)
// is stripped here as a backstop. Optional pricing lead-ins ("from", "around",
// "starting at"…) are consumed with the amount so the sentence doesn't read
// "...starts from ." afterwards. Bare numbers (timelines, "20+ hours", "ISO 27001")
// are left untouched — only amounts attached to a currency are removed.
const PRICING_LEAD_IN =
  "(?:\\b(?:from|starting\\s+(?:at|from)|typically\\s+(?:ranges?(?:\\s+from)?|costs?|starts?\\s+(?:at|from))|ranges?\\s+from|around|approximately|about|roughly|only|just|up\\s+to|as\\s+low\\s+as|costs?|priced\\s+at|price(?:d)?(?:\\s+(?:is|at))?|budget\\s+of|investment\\s+of)\\b[\\s:]*)*";

const PRICING_PATTERNS: RegExp[] = [
  // symbol-prefixed: €1,500  $500  £800  €1.5k  €3,000+  €500/mo
  new RegExp(
    `${PRICING_LEAD_IN}[€£$₤¥₹]\\s?\\d[\\d.,]*\\s*(?:k|m)?\\+?(?:\\s?/\\s?(?:mo|month|hr|hour|yr|year))?`,
    "gi"
  ),
  // amount + currency code/word: 1500 EUR  500 dollars  1,500 PLN  5000 zloty
  new RegExp(
    `${PRICING_LEAD_IN}\\b\\d[\\d.,]*\\s?(?:k|m)?\\+?\\s?(?:eur|usd|gbp|pln|zwl|zar|ngn|kes|chf|euros?|dollars?|pounds?|z[łl]oty)\\b`,
    "gi"
  ),
  // currency code-prefixed: EUR 1500  PLN 1,500  ZWL 5000
  /\b(?:eur|usd|gbp|pln|zwl|zar|ngn|kes|chf)\s?\d[\d.,]*\s*(?:k|m)?\+?/gi,
];

function stripPricing(text: string): string {
  let out = text;
  for (const re of PRICING_PATTERNS) out = out.replace(re, "");
  return out;
}

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

  // 2b. Strip any monetary figure — pricing is never quoted in chat.
  text = stripPricing(text);

  // 3. Clean up artifacts left by the scrub.
  text = tidy(text);

  // 4. If scrubbing gutted the message, fall back to something safe.
  if (text.length < 2) return SAFE_FALLBACK;

  return text;
}

export { SAFE_FALLBACK };
