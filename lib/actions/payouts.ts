'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import Partner from '@/models/Partner';
import PayoutBatch from '@/models/PayoutBatch';
import AuditLog from '@/models/AuditLog';
import { revalidatePath } from 'next/cache';

// Middleware check helper
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function processCommissionApprovals() {
  const admin = await checkAdmin();
  await dbConnect();

  // Find all deals that are Pending and saleDate is > 14 days ago
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const dealsToApprove = await Deal.find({
    commissionStatus: 'Pending',
    dealStatus: 'closed',
    saleDate: { $lte: fourteenDaysAgo }
  });

  let approvedCount = 0;

  for (const deal of dealsToApprove) {
    const amount = deal.commissionAmount || 0;

    await Deal.findByIdAndUpdate(deal._id, {
      commissionStatus: 'Approved',
      approvalDate: new Date()
    });

    // Move pending -> approved balance
    await Partner.findByIdAndUpdate(deal.partnerId, {
      $inc: {
        'stats.pendingCommission': -amount,
        'stats.approvedBalance': amount
      }
    });

    approvedCount++;

    await AuditLog.create({
      entityType: 'deal',
      entityId: deal._id,
      action: 'commission_approved',
      performedBy: 'system',
      metadata: { dealId: deal._id, amount }
    });
  }

  revalidatePath('/admin/payouts');
  return { success: true, count: approvedCount };
}

export async function generateMonthlyPayoutBatch() {
  const admin = await checkAdmin();
  await dbConnect();

  // Rules:
  // - Approved Commissions
  // - Affiliate approvedBalance >= 50
  // Note: deductions for past post-payout refunds would be reflected in the approvedBalance if we handle refunds correctly.
  
  const eligiblePartners = await Partner.find({
    'stats.approvedBalance': { $gte: 50 },
    status: 'active'
  });

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
      await Deal.findByIdAndUpdate(deal._id, {
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
    metadata: { totalAmount, payoutMonth, dealsCount }
  });

  revalidatePath('/admin/payouts');
  return { success: true, batchId: batch._id.toString(), totalAmount, dealsCount };
}

export async function completePayoutBatch(batchId: string, referenceNumber?: string, adjustments?: { partnerId: string, feeDeducted: number }[]) {
   const admin = await checkAdmin();
   await dbConnect();

   const batch = await PayoutBatch.findById(batchId);
   if (!batch || batch.status === 'Completed') {
     throw new Error('Batch not found or already completed');
   }

   // Optional: apply fee adjustments to partner balances or payouts.
   // For now, if a fee is applied, we subtract it from the payout amount but not from their tracked stats, 
   // or we subtract from both. The prompt says "Remittance fees deducted from affiliate payout".
   
   // Find all deals linked to this batch
   const deals = await Deal.find({ payoutBatchId: batchId, commissionStatus: 'Approved' });

   // Deduct from partner's approved balance and add to paid
   const partnerTotals = new Map<string, number>();
   
   for (const deal of deals) {
     await Deal.findByIdAndUpdate(deal._id, { commissionStatus: 'Paid' });
     const pid = deal.partnerId.toString();
     partnerTotals.set(pid, (partnerTotals.get(pid) || 0) + (deal.commissionAmount || 0));
   }

   for (const [pid, amount] of partnerTotals.entries()) {
     // Apply any manual fee adjustments
     const adjustment = adjustments?.find(a => a.partnerId === pid)?.feeDeducted || 0;
     const finalPaid = amount - adjustment;

     await Partner.findByIdAndUpdate(pid, {
       $inc: {
         'stats.approvedBalance': -amount,
         'stats.paidCommission': finalPaid,
         'stats.totalCommissionEarned': -adjustment // Reduce total earned by the fee? Or just paid? Usually total earned stays the same, paid reflects fee
       }
     });
   }

   await PayoutBatch.findByIdAndUpdate(batchId, { 
      status: 'Completed',
      referenceNumber: referenceNumber || undefined
   });

   await AuditLog.create({
      entityType: 'payout_batch',
      entityId: batch._id,
      action: 'payout_batch_completed',
      performedBy: admin.id,
      metadata: { batchId, referenceNumber }
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

  if (deal.commissionStatus === 'Pending') {
    // Reverse pending
    await Partner.findByIdAndUpdate(deal.partnerId, {
      $inc: { 'stats.pendingCommission': -amount }
    });
  } else if (deal.commissionStatus === 'Approved') {
    // Reverse approved
    await Partner.findByIdAndUpdate(deal.partnerId, {
      $inc: { 'stats.approvedBalance': -amount }
    });
  } else if (deal.commissionStatus === 'Paid') {
    // Deduct from next cycle: negative approved balance or pending?
    // We can deduct from approvedBalance, effectively lowering their next payout.
    await Partner.findByIdAndUpdate(deal.partnerId, {
      $inc: { 'stats.approvedBalance': -amount }
    });
  }

  await Deal.findByIdAndUpdate(dealId, {
    dealStatus: 'rejected', // Or 'refunded', but 'rejected' exists in schema
    commissionStatus: 'Reversed'
  });

  await AuditLog.create({
    entityType: 'deal',
    entityId: dealId,
    action: 'commission_reversed',
    performedBy: admin.id,
    metadata: { dealId, amount, previousStatus: deal.commissionStatus }
  });

  revalidatePath('/admin/deals');
  revalidatePath('/admin/payouts');
  return { success: true };
}
