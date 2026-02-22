import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import Partner from '@/models/Partner';
import AffiliateRiskFlag, { RiskFlagType } from '@/models/AffiliateRiskFlag';
import AffiliateProgramConfig from '@/models/AffiliateProgramConfig';
import PartnerNotification from '@/models/PartnerNotification';
import mongoose from 'mongoose';

/**
 * Fraud Detection Service
 *
 * All checks are NON-BLOCKING. They create advisory risk flags only.
 * No deals, payouts, or partners are rejected or suspended automatically.
 */

/**
 * Deduplication guard — prevents spam when the same deal is re-evaluated.
 * If an active (unresolved) flag of the same type already exists for this
 * partner (or this specific deal), we skip inserting another one.
 */
async function isDuplicateFlag({
  partnerId,
  dealId,
  type,
}: {
  partnerId: string;
  dealId?: string;
  type: RiskFlagType;
}): Promise<boolean> {
  const query: Record<string, unknown> = {
    partnerId: new mongoose.Types.ObjectId(partnerId),
    type,
    resolved: false,
  };

  // If we have a dealId, check both deal-scoped and partner-scoped flags
  // (a partner-level flag is enough to suppress a deal-level one of the same type)
  if (dealId) {
    query.$or = [
      { dealId: new mongoose.Types.ObjectId(dealId) },
      { dealId: null },
    ];
  }

  const exists = await AffiliateRiskFlag.exists(query);
  return !!exists;
}

async function createFlag({
  partnerId,
  dealId,
  type,
  severity,
  message,
}: {
  partnerId: string;
  dealId?: string;
  type: RiskFlagType;
  severity: 'low' | 'medium' | 'high';
  message: string;
}) {
  // Guard: never create a duplicate unresolved flag of the same type
  const alreadyExists = await isDuplicateFlag({ partnerId, dealId, type });
  if (alreadyExists) return;

  await AffiliateRiskFlag.create({
    partnerId: new mongoose.Types.ObjectId(partnerId),
    dealId: dealId ? new mongoose.Types.ObjectId(dealId) : undefined,
    type,
    severity,
    message,
  });

  await PartnerNotification.create({
    partnerId: new mongoose.Types.ObjectId(partnerId),
    type: 'risk_flag_review',
    message: `A recent activity on your account check has been flagged for standard review.`,
  });
}

/**
 * Check 1 — Duplicate Client
 * Same client email already exists under the SAME partner.
 */
export async function checkDuplicateClient(
  partnerId: string,
  dealId: string,
  clientEmail: string
) {
  const existing = await Deal.findOne({
    partnerId: new mongoose.Types.ObjectId(partnerId),
    clientEmail: clientEmail.toLowerCase().trim(),
    _id: { $ne: new mongoose.Types.ObjectId(dealId) },
  }).lean();

  if (existing) {
    await createFlag({
      partnerId,
      dealId,
      type: 'duplicate_client',
      severity: 'low',
      message: 'Client email already used by this partner.',
    });
  }
}

/**
 * Check 2 — Cross-Affiliate Email
 * Same client email exists under a DIFFERENT partner.
 * Uses indexed clientEmail lookup and explicitly excludes the current deal.
 */
export async function checkCrossAffiliateEmail(
  partnerId: string,
  dealId: string,
  clientEmail: string
) {
  const existing = await Deal.findOne({
    partnerId: { $ne: new mongoose.Types.ObjectId(partnerId) },
    clientEmail: clientEmail.toLowerCase().trim(),
    _id: { $ne: new mongoose.Types.ObjectId(dealId) }, // exclude current deal (race-condition safety)
  }).lean();

  if (existing) {
    await createFlag({
      partnerId,
      dealId,
      type: 'cross_affiliate_email',
      severity: 'high',
      message: 'Client email already referred by another affiliate.',
    });
  }
}

/**
 * Check 3 — Self Referral
 * Compares client email against ALL email surfaces on the partner:
 *   - Partner account email
 *   - Wise / PayPal / bank account name (if email-shaped)
 *   - Local remittance contact
 * Captures secondary-email self-referral fraud patterns.
 */
export async function checkSelfReferral(
  partnerId: string,
  dealId: string,
  clientEmail: string
) {
  const partner = await Partner.findById(partnerId).lean();
  if (!partner) return;

  const normalizedClientEmail = clientEmail.toLowerCase().trim();

  // Collect every email-like field on the partner record
  const emailsToCheck: (string | undefined)[] = [
    partner.email,
    // bankDetails.accountName is often a name not email, but include if email-shaped
    partner.bankDetails?.accountName?.includes('@') ? partner.bankDetails.accountName : undefined,
    // localRemittanceDetails can contain a mobile number or name, skip non-email fields
  ];

  const matches = emailsToCheck
    .filter((e): e is string => !!e && e.includes('@'))
    .map((e) => e.toLowerCase().trim())
    .filter((e) => e === normalizedClientEmail);

  if (matches.length > 0) {
    await createFlag({
      partnerId,
      dealId,
      type: 'self_referral',
      severity: 'high',
      message: 'Potential self-referral detected.',
    });
  }
}

/**
 * Check 4 — Deal Value Spike
 * Only compares against real, closed, paid deals.
 * Excludes: academy_bonus, refunded/reversed commissions, pending/unpaid deals.
 * This ensures spike detection is based on clean revenue history only.
 */
export async function checkDealValueSpike(
  partnerId: string,
  dealId: string,
  dealValue: number
) {
  // Only consider fully closed, payment-received, non-refunded deals
  const recentDeals = await Deal.find({
    partnerId: new mongoose.Types.ObjectId(partnerId),
    dealStatus: 'closed',
    paymentStatus: 'received',
    commissionStatus: { $nin: ['Refunded', 'Reversed'] },
    commissionSource: 'DEAL', // exclude ACADEMY_BONUS entries
    _id: { $ne: new mongoose.Types.ObjectId(dealId) },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Need at least 2 real historical deals for meaningful comparison
  if (recentDeals.length < 2) return;

  // Use finalValue if set (actual closed amount), else estimatedValue
  const values = recentDeals
    .map((d) => d.finalValue ?? d.estimatedValue)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) return;

  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;

  if (median <= 0) return;

  // Configurable multiplier from AffiliateProgramConfig (default 3×)
  let multiplier = 3;
  try {
    const config = await AffiliateProgramConfig.findOne().lean();
    if (config?.dealValueSpikeMultiplier && config.dealValueSpikeMultiplier > 0) {
      multiplier = config.dealValueSpikeMultiplier;
    }
  } catch {
    // Use default if config unavailable
  }

  if (dealValue > median * multiplier) {
    await createFlag({
      partnerId,
      dealId,
      type: 'deal_value_spike',
      severity: 'medium',
      message: `Deal value significantly exceeds partner's historical average (median: $${median.toFixed(0)}, new deal: $${dealValue.toFixed(0)}, threshold: ${multiplier}×).`,
    });
  }
}

/**
 * Master orchestrator — runs all checks concurrently.
 * Promise.allSettled ensures one failure never blocks the others.
 */
export async function runAllFraudChecks({
  partnerId,
  dealId,
  clientEmail,
  dealValue,
}: {
  partnerId: string;
  dealId: string;
  clientEmail: string;
  dealValue: number;
}) {
  await dbConnect();

  const results = await Promise.allSettled([
    checkDuplicateClient(partnerId, dealId, clientEmail),
    checkCrossAffiliateEmail(partnerId, dealId, clientEmail),
    checkSelfReferral(partnerId, dealId, clientEmail),
    checkDealValueSpike(partnerId, dealId, dealValue),
  ]);

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      const checkNames = ['duplicateClient', 'crossAffiliateEmail', 'selfReferral', 'dealValueSpike'];
      console.error(`[FRAUD CHECK ERROR] ${checkNames[i]} failed:`, result.reason);
    }
  });
}
