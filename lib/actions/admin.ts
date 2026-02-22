'use server';

// All payout eligibility decisions must go through evaluatePartnerPayoutEligibility().
// Do not implement payout rules anywhere else.

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';
import AuditLog from '@/models/AuditLog';
import AffiliateRiskFlag from '@/models/AffiliateRiskFlag';
import PartnerNotification from '@/models/PartnerNotification';
import { revalidatePath } from 'next/cache';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { evaluatePartnerPayoutEligibility } from '@/lib/actions/payouts';
import { updateDealState } from '@/lib/actions/dealState';
import { recordLedgerEntry } from '@/lib/services/ledger';

// Middleware check helper
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

// Helper: Check and Upgrade Tier (auto)
async function checkAndUpgradeTier(partnerId: string) {
    const partner = await Partner.findById(partnerId);
    if (!partner) return;

    // ── GOVERNANCE GUARD ──────────────────────────────────────────────────────
    // If an admin has manually overridden or locked this tier, the system must
    // never auto-change it. Silent exit — no error, no downgrade.
    if (partner.tierOverride || partner.tierLocked) {
        return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const totalRevenue = partner.stats.totalReferredRevenue;
    let newTier = partner.tier;

    // Tier thresholds:
    // Referral: < $10k
    // Agency:   $10k – $50k
    // Enterprise: > $50k
    if (totalRevenue >= 50000 && partner.tier !== 'enterprise') {
        newTier = 'enterprise';
    } else if (totalRevenue >= 10000 && partner.tier === 'referral') {
        newTier = 'agency';
    }

    if (newTier !== partner.tier) {
        const oldTier = partner.tier;
        await Partner.findByIdAndUpdate(partnerId, {
            tier: newTier,
            tierLastChangedAt: new Date(),
            tierLastChangedBy: 'system',
        });

        // Audit trail for auto-upgrade
        await AuditLog.create({
            entityType: 'partner',
            entityId: partnerId,
            action: 'tier_auto_upgraded',
            performedBy: 'system',
            details: { newTier, oldTier },
            metadata: {
                oldTier,
                newTier,
                reason: `Auto threshold reached (revenue: $${totalRevenue})`,
                causedByRevenue: totalRevenue,
            }
        });

        // Notify Partner
        await sendEmail({
            to: partner.email,
            subject: 'Congratulations! You\'ve been upgraded!',
            html: EmailTemplates.tierUpgrade(partner.name, newTier),
        });

        await PartnerNotification.create({
            partnerId,
            type: 'tier_upgraded',
            message: `Congratulations! Your tier has been upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}.`,
        });
    }
}

// ── MANUAL TIER CONTROL ───────────────────────────────────────────────────────
// Admin-only. Supports upgrades, downgrades, override flag, and lock flag.
// All changes are fully audited and respect the lock guard.
export async function updatePartnerTier(
    partnerId: string,
    newTier: 'referral' | 'agency' | 'enterprise' | 'creator',
    tierOverride: boolean,
    tierLocked: boolean,
    reason: string
) {
    const admin = await checkAdmin();
    await dbConnect();

    const partner = await Partner.findById(partnerId);
    if (!partner) throw new Error('Partner not found');

    // ── LOCK GUARD ────────────────────────────────────────────────────────────
    // A locked tier cannot change unless the admin is explicitly unlocking it
    // (i.e. setting tierLocked = false in this very request).
    if (partner.tierLocked && tierLocked !== false) {
        throw new Error(
            'This tier is locked. Set "Unlock Tier" first to make any changes.'
        );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const oldTier = partner.tier;

    await Partner.findByIdAndUpdate(partnerId, {
        tier: newTier,
        tierOverride,
        tierLocked,
        tierOverrideReason: reason?.trim() || undefined,
        tierLastChangedAt: new Date(),
        tierLastChangedBy: admin.id,
    });

    await AuditLog.create({
        entityType: 'partner',
        entityId: partnerId,
        action: 'tier_manual_change',
        performedBy: admin.id,
        details: { newTier, oldTier, tierOverride, tierLocked },
        metadata: {
            oldTier,
            newTier,
            tierOverride,
            tierLocked,
            reason: reason?.trim() || 'No reason provided',
        },
    });

    revalidatePath('/admin/partners');
    revalidatePath(`/admin/partners/${partnerId}`);
}
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePartnerStatus(partnerId: string, status: 'active' | 'suspended', tier?: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const partner = await Partner.findByIdAndUpdate(partnerId, { status, tier }, { new: true });
  
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  if (status === 'active') {
      await sendEmail({
          to: partner.email,
          subject: 'Welcome to Leo Systems Partner Network',
          html: EmailTemplates.partnerApproved(partner.name),
      });
  }

  await AuditLog.create({
    entityType: 'partner',
    entityId: partnerId,
    action: `partner_status_update_${status}`,
    performedBy: admin.id,
    details: { status, tier },
    metadata: { status, tier },
  });

  revalidatePath('/admin/partners');
}

export async function forceVerifyPartnerEmail(partnerId: string) {
    const admin = await checkAdmin();
    await dbConnect();
    
    const partner = await Partner.findById(partnerId);
    if (!partner) throw new Error('Partner not found');

    await Partner.findByIdAndUpdate(partnerId, {
        emailVerified: true,
        $unset: { verificationToken: "", verificationTokenExpiry: "" }
    });

    await AuditLog.create({
        entityType: 'partner',
        entityId: partnerId,
        action: 'admin_force_verified_email',
        performedBy: admin.id,
        details: { partnerEmail: partner.email },
        metadata: { partnerEmail: partner.email },
    });

    revalidatePath('/admin/partners');
    revalidatePath(`/admin/partners/${partnerId}`);
}

export async function updateDealStatus(
  dealId: string, 
  status: string, 
  finalValue?: number, 
  commissionRate?: number,
  paymentStatus?: string
) {
  const admin = await checkAdmin();
  await dbConnect();

  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found');

  const updates: Record<string, unknown> = { dealStatus: status };
  
  // Logic for payment status
  if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      if (paymentStatus === 'received' && deal.paymentStatus !== 'received') {
          updates.paymentReceivedAt = new Date();
          
          await PartnerNotification.create({
              partnerId: deal.partnerId,
              type: 'payment_received',
              message: `Client payment received for your deal: ${deal.clientName}.`,
          });
      }
  }

  // Logic when specific statuses are set
  if (status === 'approved') {
      if (finalValue) updates.finalValue = finalValue;
      if (commissionRate) updates.commissionRate = commissionRate;
      
      const val = finalValue ?? deal.estimatedValue;
      const rate = commissionRate ?? deal.commissionRate;
      updates.commissionAmount = val * rate;
      updates.commissionStatus = 'Pending';
  }
  
  if (status === 'closed') {
      updates.closedAt = new Date();
      updates.saleDate = new Date();
      updates.commissionStatus = 'Pending';
      // When closed, add to Partner's Pending Commission and Total Revenue
      // But only if it wasn't already closed. 
      if (deal.dealStatus !== 'closed') {
           const finalAmt = deal.commissionAmount || 0; // Should be set during approval
           const finalRev = deal.finalValue || deal.estimatedValue;
           
           await Partner.findByIdAndUpdate(deal.partnerId, {
               $inc: { 
                   'stats.totalReferredRevenue': finalRev
               }
           });
           
           if (finalAmt > 0) {
               await recordLedgerEntry({
                   partnerId: deal.partnerId.toString(),
                   type: 'commission_earned',
                   amount: finalAmt,
                   relatedDealId: deal._id.toString()
               });
           }
           
           // Check Tier after Revenue Update
           await checkAndUpgradeTier(deal.partnerId.toString());
      }
  }

  const updatedDeal = await updateDealState(dealId, updates);

  await AuditLog.create({
    entityType: 'deal',
    entityId: dealId,
    action: `deal_status_update_${status}`,
    performedBy: admin.id,
    details: { status, finalValue, commissionRate },
    metadata: { status, finalValue, commissionRate },
  });
  
  // Notify partner
  const partner = await Partner.findById(updatedDeal?.partnerId);
  if (partner) {
       await sendEmail({
          to: partner.email,
          subject: `Deal Update: ${updatedDeal?.clientName}`,
          html: `<p>Your deal for <strong>${updatedDeal?.clientName}</strong> has been updated to <strong>${status.replace('_', ' ')}</strong>.</p>`,
      });
  }

  revalidatePath('/admin/deals');
  revalidatePath('/partner/dashboard/deals');
  revalidatePath('/partner/dashboard'); // For stats
}

export async function recordCommissionPayment(dealId: string, amount: number, method: string, reference: string) {
    const admin = await checkAdmin();
    await dbConnect();

    const deal = await Deal.findById(dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.commissionStatus === 'Paid') throw new Error("Commission already paid");

    const partner = await Partner.findById(deal.partnerId);
    if (!partner) throw new Error("Partner not found");

    const eligibility = await evaluatePartnerPayoutEligibility(partner._id.toString());

    if (!eligibility.isEligible) {
      throw new Error(eligibility.reasons.join(", "));
    }

    // Create Payout Record
    const payout = await Payout.create({
        partnerId: deal.partnerId,
        amount,
        status: 'paid', 
        method,
        reference,
        processedAt: new Date(),
    });

    // Update Deal via central state handler
    await updateDealState(dealId, {
        paymentStatus: 'received',
        commissionStatus: 'Paid',
        commissionAmount: amount, // Ensure match
    });

    // Update Partner Stats
    // Move from Pending to Paid
    // And Reset "Paid Deals Since Last Payout" counter
    
    // Logic: If this payout covers all pending, we reset? 
    // Or do we just reset it whenever ANY payout works?
    // The requirement is "payout after every 2 paid customers".
    // So if we pay out, we assume we are clearing the balance for those 2+ customers.
    // Let's just create a ledger entry instead of mutating directly.
    await recordLedgerEntry({
        partnerId: deal.partnerId.toString(),
        type: 'commission_paid',
        amount: amount,
        relatedDealId: deal._id.toString()
    });

    await AuditLog.create({
        entityType: 'payout',
        entityId: payout._id,
        action: 'commission_paid_manual',
        performedBy: admin.id,
        details: { dealId, amount, method, reference },
        metadata: { dealId, amount, method, reference },
    });
    
    // Notify Partner
    const partnerToNotify = await Partner.findById(deal.partnerId);
    if (partnerToNotify) {
        await sendEmail({
            to: partnerToNotify.email,
            subject: 'Commission Paid',
            html: EmailTemplates.commissionPaid(partnerToNotify.name, deal.clientName, amount),
        });
        
        await PartnerNotification.create({
            partnerId: deal.partnerId,
            type: 'commission_paid',
            message: `Your commission of $${amount} for ${deal.clientName} has been paid via ${method}.`,
        });
    }

    revalidatePath('/admin/payouts');
    revalidatePath('/admin/deals');
    revalidatePath('/partner/dashboard/earnings');
    revalidatePath('/partner/dashboard/deals');
    revalidatePath('/partner/dashboard');
}

export async function deletePartner(partnerId: string) {
     await checkAdmin();
     await dbConnect();
     await Partner.findByIdAndDelete(partnerId);
     revalidatePath('/admin/partners');
}

export async function resolveRiskFlag(flagId: string, resolutionNotes: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const flag = await AffiliateRiskFlag.findByIdAndUpdate(
    flagId,
    {
      resolved: true,
      resolvedAt: new Date(),
      resolutionNotes: resolutionNotes?.trim() || undefined,
    },
    { new: true }
  );

  if (!flag) throw new Error('Risk flag not found');

  await AuditLog.create({
    entityType: 'risk_flag',
    entityId: flagId,
    action: 'risk_flag_resolved',
    performedBy: admin.id,
    details: { type: flag.type, action: 'resolved' },
    metadata: { flagId, type: flag.type, resolutionNotes },
  });

  revalidatePath('/admin/deals');
  revalidatePath('/admin/partners');
}

