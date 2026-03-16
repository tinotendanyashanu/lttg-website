/**
 * Smart Client Matching Service
 *
 * Searches for an existing client record before creating a new one.
 * Match priority: email (exact) → phone (exact) → business name (fuzzy).
 *
 * Returns the best matching client Lead document, or null if none found.
 */

import dbConnect from '@/lib/mongodb';

export interface ClientMatchInput {
  email?: string;
  phone?: string;
  businessName?: string;
}

export interface ClientMatchResult {
  _id: string;
  businessName?: string;
  contactName?: string;
  clientEmail?: string;
  phone?: string;
  status?: string;
  accountId?: { _id: string; email: string } | null;
  matchReason: 'email' | 'phone' | 'business_name';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Normalise a phone number to digits only for comparison.
 */
function normalisePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Simple token-based similarity score (0–1) between two strings.
 * Splits both strings into words and counts matching tokens.
 */
function nameSimilarity(a: string, b: string): number {
  const tokensA = a.toLowerCase().split(/\s+/).filter(Boolean);
  const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (tokensA.length === 0) return 0;
  const matches = tokensA.filter(t => tokensB.has(t)).length;
  return matches / Math.max(tokensA.length, tokensB.size);
}

export async function findMatchingClient(
  input: ClientMatchInput,
): Promise<ClientMatchResult | null> {
  await dbConnect();
  const Lead = (await import('@/models/Lead')).default;

  const { email, phone, businessName } = input;

  // 1. Email match (exact, case-insensitive) — highest confidence
  if (email?.trim()) {
    const emailRegex = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const match = await Lead.findOne({ clientEmail: emailRegex }).lean();
    if (match) {
      return {
        ...(match as any),
        _id: String((match as any)._id),
        matchReason: 'email',
        confidence: 'high',
      };
    }
  }

  // 2. Phone match (normalised digits) — high confidence
  if (phone?.trim()) {
    const digitsOnly = normalisePhone(phone.trim());
    if (digitsOnly.length >= 7) {
      // We fetch candidates and normalise in JS because we can't use a regex on computed value
      const candidates = await Lead.find(
        { phone: { $exists: true, $ne: '' } },
        '_id businessName contactName clientEmail phone status accountId',
      ).lean();

      const match = (candidates as any[]).find(
        (c) => normalisePhone(c.phone || '') === digitsOnly,
      );
      if (match) {
        return {
          ...match,
          _id: String(match._id),
          matchReason: 'phone',
          confidence: 'high',
        };
      }
    }
  }

  // 3. Business name fuzzy match — medium/low confidence
  if (businessName?.trim()) {
    const candidates = await Lead.find(
      { businessName: { $exists: true, $ne: '' } },
      '_id businessName contactName clientEmail phone status accountId',
    ).limit(200).lean();

    let bestScore = 0;
    let bestMatch: any = null;

    for (const c of candidates as any[]) {
      const score = nameSimilarity(businessName.trim(), c.businessName || '');
      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }

    if (bestScore >= 0.8 && bestMatch) {
      return {
        ...bestMatch,
        _id: String(bestMatch._id),
        matchReason: 'business_name',
        confidence: bestScore >= 0.95 ? 'high' : bestScore >= 0.8 ? 'medium' : 'low',
      };
    }
  }

  return null;
}

/**
 * Convenience: check for duplicates when creating a new client.
 * Returns an array of potential duplicates (up to 3) ordered by confidence.
 */
export async function findPotentialDuplicates(input: ClientMatchInput): Promise<ClientMatchResult[]> {
  await dbConnect();
  const Lead = (await import('@/models/Lead')).default;
  const results: ClientMatchResult[] = [];

  const { email, phone, businessName } = input;

  // Email
  if (email?.trim()) {
    const emailRegex = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const match = await Lead.findOne({ clientEmail: emailRegex }).lean();
    if (match) results.push({ ...(match as any), _id: String((match as any)._id), matchReason: 'email', confidence: 'high' });
  }

  // Phone
  if (phone?.trim()) {
    const digitsOnly = normalisePhone(phone.trim());
    if (digitsOnly.length >= 7) {
      const candidates = await Lead.find({ phone: { $exists: true, $ne: '' } }, '_id businessName contactName clientEmail phone status accountId').lean();
      const match = (candidates as any[]).find(c => normalisePhone(c.phone || '') === digitsOnly);
      if (match && !results.some(r => r._id === String(match._id))) {
        results.push({ ...match, _id: String(match._id), matchReason: 'phone', confidence: 'high' });
      }
    }
  }

  // Business name (top 2 fuzzy matches ≥ 0.7)
  if (businessName?.trim() && results.length < 3) {
    const candidates = await Lead.find({ businessName: { $exists: true, $ne: '' } }, '_id businessName contactName clientEmail phone status accountId').limit(200).lean();
    const scored = (candidates as any[])
      .map(c => ({ ...c, _id: String(c._id), score: nameSimilarity(businessName.trim(), c.businessName || '') }))
      .filter(c => c.score >= 0.7 && !results.some(r => r._id === c._id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    for (const c of scored) {
      results.push({ ...c, matchReason: 'business_name', confidence: c.score >= 0.9 ? 'high' : 'medium' });
    }
  }

  return results.slice(0, 3);
}
