'use server';

// All payout eligibility decisions must go through evaluatePartnerPayoutEligibility().
// Do not implement payout rules anywhere else.

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import Partner from '@/models/Partner';
import PayoutBatch from '@/models/PayoutBatch';
import AuditLog from '@/models/AuditLog';
import { revalidatePath } from 'next/cache';
import { updateDealState } from '@/lib/actions/dealState';
import { recordLedgerEntry } from '@/lib/services/ledger';
import PartnerNotification from '@/models/PartnerNotification';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

// Middleware check helper
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getBatchSummary(batchId: string) {
  await checkAdmin();
  await dbConnect();
  
  const batch = await PayoutBatch.findById(batchId);
  if (!batch) throw new Error('Batch not found');
  
  const deals = await Deal.find({ payoutBatchId: batchId, commissionStatus: 'Approved' });
  const partnerIds = [...new Set(deals.map(d => d.partnerId.toString()))];
  
  const partners = await Partner.find({ _id: { $in: partnerIds } });
  
  const methodCounts: Record<string, number> = {};
  partners.forEach(p => {
    const m = p.payoutMethod || 'Unknown';
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  });
  
  return {
    batchId: batch._id.toString(),
    payoutMonth: batch.payoutMonth,
    createdAt: batch.createdAt,
    totalAmount: batch.totalAmount,
    totalPartners: partnerIds.length,
    totalEntries: deals.length,
    methods: methodCounts,
    status: batch.status
  };
}

export async function evaluatePartnerPayoutEligibility(partnerId: string) {
  await dbConnect();
  const partner = await Partner.findById(partnerId);
  if (!partner) throw new Error("Partner not found");

  const reasons: string[] = [];
  const approvedBalance = partner.stats?.approvedBalance || 0;

  if (approvedBalance < 50) {
    reasons.push("Approved balance is below $50 minimum threshold.");
  }
  if (partner.status !== 'active') {
    reasons.push("Partner account is not active.");
  }
  // The prompt explicitly requires checking partner.isSuspended !== true
  if (partner.get('isSuspended') === true) {
    reasons.push("Partner account is suspended.");
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
    approvedBalance
  };
}

export async function processCommissionApprovals() {
  await checkAdmin();
  await dbConnect();

  // Find all deals that are Pending and payment has been received for at least 14 days
  // HOLD_PERIOD_DAYS = 14
  const holdExpirationDate = new Date();
  holdExpirationDate.setDate(holdExpirationDate.getDate() - 14);

  const dealsToApprove = await Deal.find({
    commissionStatus: 'Pending',
    dealStatus: 'closed',
    paymentStatus: 'received',
    paymentReceivedAt: { $lte: holdExpirationDate }
  });

  let approvedCount = 0;

  for (const deal of dealsToApprove) {
    // ---- STRICT DEFENSIVE GUARDS ----
    if (deal.paymentStatus !== 'received') {
      console.warn(`[COMMISSION GUARD] Deal ${deal._id} is missing 'received' status. Bypassing.`);
      continue;
    }

    if (!deal.paymentReceivedAt) {
      console.warn(`[COMMISSION GUARD] Deal ${deal._id} is missing paymentReceivedAt. Bypassing.`);
      continue;
    }

    const approvalDate = new Date(deal.paymentReceivedAt);
    approvalDate.setDate(approvalDate.getDate() + 14);

    if (approvalDate > new Date()) {
      console.warn(`[COMMISSION GUARD] Deal ${deal._id} hold period has not expired. Bypassing.`);
      continue;
    }
    // ---------------------------------
    
    const amount = deal.commissionAmount || 0;

    await updateDealState(deal._id.toString(), {
      commissionStatus: 'Approved',
      approvalDate: new Date()
    });

    // Record ledger entry
    await recordLedgerEntry({
      partnerId: deal.partnerId.toString(),
      type: 'commission_approved',
      amount: amount,
      relatedDealId: deal._id.toString()
    });
    
    await PartnerNotification.create({
      partnerId: deal.partnerId,
      type: 'commission_approved',
      message: `Commission of $${amount} for ${deal.clientName} has been approved.`,
    });

    approvedCount++;

    await AuditLog.create({
      entityType: 'deal',
      entityId: deal._id,
      action: 'commission_approved',
      performedBy: 'system',
      details: { dealId: deal._id, amount },
      metadata: { dealId: deal._id, amount }
    });
  }

  revalidatePath('/admin/payouts');
  return { success: true, count: approvedCount };
}

export async function generateMonthlyPayoutBatch() {
  const admin = await checkAdmin();
  await dbConnect();

  // Find all partners to evaluate
  const allPartners = await Partner.find({});
  
  const eligiblePartners = [];
  for (const partner of allPartners) {
    const eligibility = await evaluatePartnerPayoutEligibility(partner._id.toString());
    if (eligibility.isEligible) {
      eligiblePartners.push(partner);
    }
  }

  if (eligiblePartners.length === 0) {
    return { success: false, message: 'No eligible partners found for payout.' };
  }

  // Find the exact month, e.g., "2023-11"
  const now = new Date();
  const payoutMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let totalAmount = 0;

  // Create batch
  const batch = await PayoutBatch.create({
    payoutMonth,
    payoutDate: new Date(),
    totalAmount: 0,
    status: 'Processing'
  });

  let dealsCount = 0;

  for (const partner of eligiblePartners) {
    const amount = partner.stats.approvedBalance;

    // Get all approved deals for this partner
    const approvedDeals = await Deal.find({
      partnerId: partner._id,
      commissionStatus: 'Approved'
    });

    if (approvedDeals.length === 0) continue; // Should have deals if balance >= 50, but just in case

    totalAmount += amount;

    for (const deal of approvedDeals) {
      await updateDealState(deal._id.toString(), {
        payoutBatchId: batch._id,
        // Wait, they shouldn't be marked 'Paid' until the batch is complete?
        // Let's mark them as processing or keep them Approved but linked to the batch.
        // The prompt says: "On payout generation: ... Include only Approved commissions. ... Each commission marked Paid must link to payout_batch_id."
        // We will keep them "Approved" but linked to the batch, and when batch is completed, mark 'Paid'.
      });
      dealsCount++;
    }
  }

  // Update batch total
  await PayoutBatch.findByIdAndUpdate(batch._id, { totalAmount });

  await AuditLog.create({
    entityType: 'payout_batch',
    entityId: batch._id,
    action: 'payout_batch_generated',
    performedBy: admin.id,
    details: { totalAmount, payoutMonth, dealsCount },
    metadata: { totalAmount, payoutMonth, dealsCount }
  });

  revalidatePath('/admin/payouts');
  return { success: true, batchId: batch._id.toString(), totalAmount, dealsCount };
}

export async function completePayoutBatch(
  batchId: string, 
  payload: {
    transactionReference: string;
    password?: string;
    referenceNumber?: string;
    adjustments?: { partnerId: string, feeDeducted: number }[];
  }
) {
   const admin = await checkAdmin();
   await dbConnect();

   if (!payload.transactionReference || payload.transactionReference.trim() === '') {
     throw new Error('Transaction reference is required');
   }

   if (payload.password) {
     const adminUser = await Partner.findById(admin.id);
     if (!adminUser || !adminUser.password) {
       throw new Error('Admin authentication failed');
     }
     const passwordsMatch = await bcrypt.compare(payload.password, adminUser.password);
     if (!passwordsMatch) {
       throw new Error('Invalid password');
     }
   }

   const batch = await PayoutBatch.findById(batchId);
   if (!batch || batch.status === 'Completed') {
     throw new Error('Batch not found or already completed');
   }
   if (batch.status !== 'Processing') {
     throw new Error('Batch is not in Processing state');
   }
   
   // Find all deals linked to this batch
   const deals = await Deal.find({ payoutBatchId: batchId, commissionStatus: 'Approved' });
   if (deals.length === 0) {
     throw new Error('Batch has no valid payout entries');
   }

   // Deduct from partner's approved balance and add to paid
   const partnerTotals = new Map<string, number>();
   
   for (const deal of deals) {
     await updateDealState(deal._id.toString(), { commissionStatus: 'Paid' });
     const pid = deal.partnerId.toString();
          await recordLedgerEntry({
        partnerId: pid,
        type: 'commission_paid',
        amount: deal.commissionAmount || 0,
        relatedDealId: deal._id.toString(),
        batchId: batchId
      });
      
      await PartnerNotification.create({
        partnerId: pid,
        type: 'commission_paid',
        message: `Your commission of $${deal.commissionAmount || 0} has been paid via batch.`,
      });

      partnerTotals.set(pid, (partnerTotals.get(pid) || 0) + (deal.commissionAmount || 0));
   }

   for (const [pid, amount] of partnerTotals.entries()) {
     // Apply any manual fee adjustments
     const adjustment = payload.adjustments?.find(a => a.partnerId === pid)?.feeDeducted || 0;
     if (adjustment > 0) {
       await recordLedgerEntry({
         partnerId: pid,
         type: 'adjustment',
         amount: -adjustment,
         batchId: batchId
       });
     }
   }

   await PayoutBatch.findByIdAndUpdate(batchId, { 
      status: 'Completed',
      referenceNumber: payload.referenceNumber || undefined,
      transactionReference: payload.transactionReference
   });

   let ipAddress = 'unknown';
   try {
     const headersList = await headers();
     ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
   } catch (e) {
     // Ignore header errors during background tasks
   }

   await AuditLog.create({
      entityType: 'payout_batch',
      entityId: batch._id,
      action: 'payout_batch_completed',
      performedBy: admin.id,
      details: {
        batchId,
        referenceNumber: payload.referenceNumber,
        transactionReference: payload.transactionReference,
        totalAmount: batch.totalAmount,
        ipAddress
      },
      metadata: { 
        batchId, 
        referenceNumber: payload.referenceNumber,
        transactionReference: payload.transactionReference,
        totalAmount: batch.totalAmount,
        ipAddress 
      }
   });

   revalidatePath('/admin/payouts');
   return { success: true };
}

export async function processRefund(dealId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found');

  const amount = deal.commissionAmount || 0;

  await recordLedgerEntry({
    partnerId: deal.partnerId.toString(),
    type: 'refund',
    amount: amount,
    relatedDealId: dealId
  });

  // Next commission status based on previous
  const nextCommissionStatus = deal.commissionStatus === 'Paid' ? 'Refunded' : 'Reversed';

  await updateDealState(dealId, {
    dealStatus: 'rejected', 
    paymentStatus: 'pending',
    commissionStatus: nextCommissionStatus
  });

  await AuditLog.create({
    entityType: 'deal',
    entityId: dealId,
    action: 'commission_reversed',
    performedBy: admin.id,
    details: { dealId, amount, previousStatus: deal.commissionStatus },
    metadata: { dealId, amount, previousStatus: deal.commissionStatus }
  });

  revalidatePath('/admin/deals');
  revalidatePath('/admin/payouts');
  return { success: true };
}
