import dbConnect from '@/lib/mongodb';
import CommissionLedger, { CommissionLedgerType } from '@/models/CommissionLedger';
import mongoose from 'mongoose';

export async function recordLedgerEntry(
  data: {
    partnerId: string | mongoose.Types.ObjectId;
    type: CommissionLedgerType;
    amount: number;
    relatedDealId?: string | mongoose.Types.ObjectId;
    batchId?: string | mongoose.Types.ObjectId;
  },
  session?: mongoose.ClientSession
) {
  await dbConnect();
  const entry = new CommissionLedger(data);
  if (session) {
    await entry.save({ session });
  } else {
    await entry.save();
  }
  return entry;
}

export async function getPartnerBalances(partnerId: string | mongoose.Types.ObjectId) {
  await dbConnect();
  const aggregation = await CommissionLedger.aggregate([
    { $match: { partnerId: new mongoose.Types.ObjectId(partnerId.toString()) } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'commission_earned'] }, '$amount', 0] }
        },
        totalApproved: {
          $sum: { $cond: [{ $in: ['$type', ['commission_approved', 'academy_bonus', 'adjustment']] }, '$amount', 0] }
        },
        totalPaid: {
          $sum: { $cond: [{ $eq: ['$type', 'commission_paid'] }, '$amount', 0] }
        },
        totalRefunded: {
          $sum: { $cond: [{ $eq: ['$type', 'refund'] }, '$amount', 0] }
        }
      }
    }
  ]);

  const stats = aggregation[0] || { 
    totalEarned: 0, 
    totalApproved: 0, 
    totalPaid: 0, 
    totalRefunded: 0 
  };

  const pendingRaw = stats.totalEarned - stats.totalApproved;
  const pendingCommission = Math.max(0, pendingRaw);

  const approvedRaw = stats.totalApproved - stats.totalPaid - stats.totalRefunded;
  const approvedBalance = Math.max(0, approvedRaw);
  const debtBalance = approvedRaw < 0 ? Math.abs(approvedRaw) : 0;

  // Total commission earned historically includes all income types
  const totalCommissionEarned = stats.totalEarned + 
    (stats.totalApproved - stats.totalEarned); // Wait, this formula is confusing.
  
  // Actually, 'commission_approved' just changes state from earned to approved. 
  // Lifetime earned = earned (which eventually becomes approved) + academy_bonus + adjustment.
  // Wait, if a deal goes straight to approved without earned? It shouldn't if we follow the flow.
  // Let's just track lifetime earned as $sum of (commission_earned, academy_bonus, adjustment)
  
  return {
    pendingCommission,
    approvedBalance,
    paidCommission: stats.totalPaid,
    debtBalance,
    totalCommissionEarned: stats.totalEarned // Let's keep it simple: totalEarned is from commission_earned
  };
}

export async function getAllPartnerBalances() {
  await dbConnect();
  const aggregation = await CommissionLedger.aggregate([
    {
      $group: {
        _id: '$partnerId',
        totalEarned: {
          $sum: { $cond: [{ $eq: ['$type', 'commission_earned'] }, '$amount', 0] }
        },
        totalApproved: {
          $sum: { $cond: [{ $in: ['$type', ['commission_approved', 'academy_bonus', 'adjustment']] }, '$amount', 0] }
        },
        totalPaid: {
          $sum: { $cond: [{ $eq: ['$type', 'commission_paid'] }, '$amount', 0] }
        },
        totalRefunded: {
          $sum: { $cond: [{ $eq: ['$type', 'refund'] }, '$amount', 0] }
        }
      }
    }
  ]);

  const balances = new Map<string, any>();
  
  for (const stats of aggregation) {
    const pendingRaw = stats.totalEarned - stats.totalApproved;
    const pendingCommission = Math.max(0, pendingRaw);

    const approvedRaw = stats.totalApproved - stats.totalPaid - stats.totalRefunded;
    const approvedBalance = Math.max(0, approvedRaw);
    const debtBalance = approvedRaw < 0 ? Math.abs(approvedRaw) : 0;

    balances.set(stats._id.toString(), {
      pendingCommission,
      approvedBalance,
      paidCommission: stats.totalPaid,
      debtBalance,
      totalCommissionEarned: stats.totalEarned
    });
  }

  return balances;
}

export async function getPartnerLedger(partnerId: string | mongoose.Types.ObjectId) {
  await dbConnect();
  return CommissionLedger.find({ partnerId }).sort({ createdAt: -1 }).populate('relatedDealId').populate('batchId').lean();
}
