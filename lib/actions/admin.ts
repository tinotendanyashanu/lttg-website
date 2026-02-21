'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';
import AuditLog from '@/models/AuditLog';
import { revalidatePath } from 'next/cache';
import { sendEmail, EmailTemplates } from '@/lib/email';

// Middleware check helper
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

// Helper: Check and Upgrade Tier
async function checkAndUpgradeTier(partnerId: string) {
    const partner = await Partner.findById(partnerId);
    if (!partner) return;

    const totalRevenue = partner.stats.totalReferredRevenue;
    let newTier = partner.tier;

    // Tier Logic
    // Referral: < $10k
    // Agency: $10k - $50k
    // Enterprise: > $50k
    // These thresholds can be adjusted.
    
    if (totalRevenue >= 50000 && partner.tier !== 'enterprise') {
        newTier = 'enterprise';
    } else if (totalRevenue >= 10000 && partner.tier === 'referral') { // Only upgrade from referral
        newTier = 'agency';
    }

    if (newTier !== partner.tier) {
        await Partner.findByIdAndUpdate(partnerId, { tier: newTier });
        
        // Log Tier Upgrade
        await AuditLog.create({
            entityType: 'partner',
            entityId: partnerId,
            action: 'tier_upgrade',
            performedBy: 'system',
            metadata: { oldTier: partner.tier, newTier, causedByRevenue: totalRevenue }
        });

        // Notify Partner
        await sendEmail({
            to: partner.email,
            subject: 'Congratulations! You\'ve been upgraded!',
            html: EmailTemplates.tierUpgrade(partner.name, newTier),
        });
    }
}

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
    metadata: { status, tier },
  });

  revalidatePath('/admin/partners');
}

export async function updateDealStatus(dealId: string, status: string, finalValue?: number, commissionRate?: number) {
  const admin = await checkAdmin();
  await dbConnect();

  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found');

  const updates: Record<string, unknown> = { dealStatus: status };
  
  // Logic when specific statuses are set
  if (status === 'approved') {
      if (finalValue) updates.finalValue = finalValue;
      if (commissionRate) updates.commissionRate = commissionRate;
      
      // Calculate commission amount based on (New Value ?? Old Value) * (New Rate ?? Old Rate)
      const val = finalValue ?? deal.estimatedValue;
      const rate = commissionRate ?? deal.commissionRate;
      updates.commissionAmount = val * rate;
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
                   'stats.totalReferredRevenue': finalRev,
                   'stats.pendingCommission': finalAmt,
                   'stats.paidDealsSinceLastPayout': 1 // Increment payout counter
               }
           });
           
           // Check Tier after Revenue Update
           await checkAndUpgradeTier(deal.partnerId.toString());
      }
  }

  const updatedDeal = await Deal.findByIdAndUpdate(dealId, updates, { new: true });

  await AuditLog.create({
    entityType: 'deal',
    entityId: dealId,
    action: `deal_status_update_${status}`,
    performedBy: admin.id,
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
    if (deal.paymentStatus === 'commission_paid') throw new Error("Commission already paid");

    const partner = await Partner.findById(deal.partnerId);
    if (!partner) throw new Error("Partner not found");

    // Enforce Payout Rule: Every 2 Paid Customers
    // if (partner.stats.paidDealsSinceLastPayout < 2) {
    //    throw new Error(`Payout Policy: Partner must have at least 2 paid deals since last payout. Current: ${partner.stats.paidDealsSinceLastPayout}`);
    // }
    // NOTE: Commenting out strict enforcement to allow admin override if flexible, 
    // or un-comment if strict. User said "update payout rules", suggesting enforcement.
    // I will enable it but maybe as a warning in UI? 
    // For now, I'll enforce it as requested to "update rules".
    
    if (partner.stats.paidDealsSinceLastPayout < 2) {
         throw new Error(`Payout Policy Violation: Partner requires 2 paid deals to trigger payout. Current count: ${partner.stats.paidDealsSinceLastPayout}`);
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

    // Update Deal
    await Deal.findByIdAndUpdate(dealId, {
        paymentStatus: 'commission_paid',
        dealStatus: 'commission_paid', // Sync status
        commissionAmount: amount, // Ensure match
    });

    // Update Partner Stats
    // Move from Pending to Paid
    // And Reset "Paid Deals Since Last Payout" counter
    
    // Logic: If this payout covers all pending, we reset? 
    // Or do we just reset it whenever ANY payout works?
    // The requirement is "payout after every 2 paid customers".
    // So if we pay out, we assume we are clearing the balance for those 2+ customers.
    
    await Partner.findByIdAndUpdate(deal.partnerId, {
        $inc: {
            'stats.totalCommissionEarned': amount,
            'stats.paidCommission': amount,
            'stats.pendingCommission': -amount, 
        },
        $set: {
            'stats.paidDealsSinceLastPayout': 0 
        }
    });

    await AuditLog.create({
        entityType: 'payout',
        entityId: payout._id,
        action: 'commission_paid_manual',
        performedBy: admin.id,
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
