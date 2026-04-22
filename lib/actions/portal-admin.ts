'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { CaseCommission } from '@/models/CaseCommission';
import { CommissionAllocation } from '@/models/CommissionAllocation';
import Commission from '@/models/Commission';
import { Account } from '@/models/Account';
import { ActivityLog } from '@/models/ActivityLog';
import Lead from '@/models/Lead';
import Payout from '@/models/Payout';
import { recordLedgerEntry } from '@/lib/services/ledger';
import { revalidatePath } from 'next/cache';

export async function getAdminDashboardStats() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  // Total active cases (not closed)
  const activeCasesCount = await Case.countDocuments({ status: { $ne: 'closed' } });

  // Cases grouped by status
  const casesByStatus = await Case.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Total closed revenue (sum of dealValue for closed cases)
  const closedCases = await Case.aggregate([
    { $match: { status: 'closed' } },
    { $group: { _id: null, sum: { $sum: '$dealValue' } } }
  ]);
  const totalClosedRevenue = closedCases.length > 0 ? closedCases[0].sum : 0;

  // Commissions (using CaseCommission or Commission based on further inspection, for now let's use CaseCommission)
  const commissions = await CaseCommission.aggregate([
    { $group: { _id: '$status', sum: { $sum: '$totalCommission' } } }
  ]);
  const pendingCommissionLiability = commissions.find((c: any) => c._id === 'pending')?.sum || 0;
  const totalPaidCommission = commissions.find((c: any) => c._id === 'paid')?.sum || 0;

  // Users
  const totalActiveUsers = await Account.countDocuments({ isActive: true });
  const internCount = await Account.countDocuments({ roles: 'intern', isActive: true });
  const employeeCount = await Account.countDocuments({ roles: 'employee', isActive: true });

  // Recent activity feed (latest 10)
  const recentActivity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actorAccountId', 'email fullName')
    .lean();

  return {
    success: true,
    data: {
      activeCasesCount,
      casesByStatus: casesByStatus.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
      totalClosedRevenue,
      pendingCommissionLiability,
      totalPaidCommission,
      totalActiveUsers,
      internCount,
      employeeCount,
      recentActivity: JSON.parse(JSON.stringify(recentActivity)),
    }
  };
}

export async function getAdminCases() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const cases = await Case.find()
    .populate('ownerId', 'email fullName')
    .populate('participants', 'email fullName')
    .sort({ createdAt: -1 })
    .lean();
    
  // Fetch all users to populate participant dropdowns
  const users = await Account.find({ isActive: true }).select('email fullName roles _id').lean();

  return { success: true, cases: JSON.parse(JSON.stringify(cases)), users: JSON.parse(JSON.stringify(users)) };
}

export async function updateAdminCaseStatus(caseId: string, status: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId);
  if (!existingCase) throw new Error('Case not found');
  if (existingCase.status === 'closed') throw new Error('Cannot edit a closed case');

  const oldStatus = existingCase.status;
  existingCase.status = status as any;
  await existingCase.save();

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_status_update',
    previousValue: oldStatus,
    newValue: status,
  });

  return { success: true };
}

export async function updateAdminCaseDealValue(caseId: string, dealValue: number) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId);
  if (!existingCase) throw new Error('Case not found');
  if (existingCase.status === 'closed') throw new Error('Cannot edit a closed case');

  const oldDealValue = existingCase.dealValue;
  existingCase.dealValue = dealValue;
  await existingCase.save();

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_dealvalue_update',
    previousValue: oldDealValue?.toString() || '0',
    newValue: dealValue.toString(),
  });

  return { success: true };
}

export async function updateAdminCaseParticipants(caseId: string, participants: string[]) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId);
  if (!existingCase) throw new Error('Case not found');
  if (existingCase.status === 'closed') throw new Error('Cannot edit a closed case');

  const oldParticipants = existingCase.participants.map(p => p.toString()).join(',');
  existingCase.participants = participants as any;
  await existingCase.save();

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_participants_update',
    previousValue: oldParticipants,
    newValue: participants.join(','),
  });

  return { success: true };
}

export async function closeAdminCase(caseId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId).populate('participants', 'roles _id email fullName');
  if (!existingCase) throw new Error('Case not found');
  if (existingCase.status === 'closed') throw new Error('Case is already closed');

  // ── PAYMENT GATE ──────────────────────────────────────────────────────────
  // A case can only be closed once the client has paid in full.
  if (existingCase.paymentStatus !== 'received') {
    throw new Error('Cannot close case: client payment has not been received in full.');
  }
  // ──────────────────────────────────────────────────────────────────────────

  existingCase.status = 'closed';
  existingCase.closedAt = new Date();
  await existingCase.save();

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_closed',
    previousValue: 'active',
    newValue: 'closed',
  });

  // ── COMMISSION TRIGGER ────────────────────────────────────────────────────
  // Calculate and create commissions for all participants.
  const dealValue = existingCase.dealValue || 0;
  if (dealValue > 0 && existingCase.participants?.length > 0) {
    const DEFAULT_RATES: Record<string, number> = {
      intern: 0.10,   // 10%
      employee: 0.20, // 20%
    };

    let totalCommission = 0;
    const allocationData: { accountId: string; amount: number }[] = [];

    for (const participant of existingCase.participants as any[]) {
      // Determine primary commission role
      let commissionRole: 'intern' | 'employee' | null = null;
      if (participant.roles?.includes('intern')) commissionRole = 'intern';
      else if (participant.roles?.includes('employee')) commissionRole = 'employee';
      // Admins do not earn commission this way
      if (!commissionRole) continue;

      // Use account-specific rate if available (stored as 0-100), otherwise fallback to role default
      // We need to fetch the full account because participants might be partial
      const accountForRate = await Account.findById(participant._id);
      let rate = accountForRate?.commissionRate ? accountForRate.commissionRate / 100 : DEFAULT_RATES[commissionRole];
      
      const commissionAmount = parseFloat((dealValue * rate).toFixed(2));

      // Create individual Commission record
      await Commission.create({
        accountId: participant._id,
        caseId: existingCase._id,
        commissionRate: rate,
        role: commissionRole,
        amount: commissionAmount,
        status: 'pending',
      });

      // Record ledger entry (commission_earned)
      await recordLedgerEntry({
        accountId: participant._id.toString(),
        type: 'commission_earned',
        amount: commissionAmount,
        relatedCaseId: existingCase._id.toString(),
      });

      // Increment Account.commissionStats
      await Account.findByIdAndUpdate(participant._id, {
        $inc: {
          'commissionStats.pendingCommission': commissionAmount,
          'commissionStats.totalEarned': commissionAmount,
        },
      });

      allocationData.push({ accountId: participant._id.toString(), amount: commissionAmount });
      totalCommission += commissionAmount;
    }

    if (allocationData.length > 0) {
      // Create CaseCommission summary
      const caseCommission = await CaseCommission.create({
        caseId: existingCase._id,
        totalCommission,
        status: 'pending',
      });

      // Create CommissionAllocation per participant
      for (const alloc of allocationData) {
        await CommissionAllocation.create({
          caseCommissionId: caseCommission._id,
          accountId: alloc.accountId,
          allocatedAmount: alloc.amount,
          status: 'pending',
        });
      }

      await ActivityLog.create({
        caseId: existingCase._id,
        actorAccountId: account._id,
        actionType: 'commission_created',
        newValue: `Total commission $${totalCommission} distributed to ${allocationData.length} participant(s)`,
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  revalidatePath('/portal/admin/case-management');
  return { success: true };
}

export async function addAdminCaseNote(caseId: string, note: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId);
  if (!existingCase) throw new Error('Case not found');

  const timestamp = new Date().toLocaleString();
  const noteEntry = `\n[${timestamp} - ${account.fullName}]: ${note}`;
  
  await Case.findByIdAndUpdate(caseId, { $set: { notes: (existingCase.notes || '') + noteEntry } });

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_note_added',
    newValue: note,
  });

  return { success: true };
}

export async function getAdminCaseCommissions(caseId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const caseCommission = await CaseCommission.findOne({ caseId }).lean();
  if (!caseCommission) return { success: true, commissions: null };

  const allocations = await CommissionAllocation.find({ caseCommissionId: caseCommission._id })
    .populate('accountId', 'fullName email')
    .lean();

  return { 
    success: true, 
    commissions: JSON.parse(JSON.stringify(caseCommission)),
    allocations: JSON.parse(JSON.stringify(allocations))
  };
}

export async function updateAdminCasePaymentStatus(caseId: string, paymentStatus: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const existingCase = await Case.findById(caseId);
  if (!existingCase) throw new Error('Case not found');
  if (existingCase.status === 'closed') throw new Error('Cannot edit payment status of a closed case');

  const oldStatus = existingCase.paymentStatus;
  
  const updates: any = { paymentStatus };
  if (paymentStatus === 'received' && oldStatus !== 'received') {
    updates.paymentReceivedAt = new Date();
  }

  await Case.findByIdAndUpdate(caseId, updates);

  await ActivityLog.create({
    caseId: existingCase._id,
    actorAccountId: account._id,
    actionType: 'case_payment_update',
    previousValue: oldStatus || 'pending',
    newValue: paymentStatus,
  });

  revalidatePath(`/portal/admin/case-management/${caseId}`);
  return { success: true };
}

// ── INTERNAL COMMISSION MANAGEMENT (INTERNS / EMPLOYEES) ──────────────────────

export async function approveInternEmployeeCommissions() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  // 14-day hold
  const holdExpirationDate = new Date();
  holdExpirationDate.setDate(holdExpirationDate.getDate() - 14);

  const pendingCommissions = await Commission.find({
    status: 'pending',
    role: { $in: ['intern', 'employee'] },
    createdAt: { $lte: holdExpirationDate },
  });

  let approvedCount = 0;

  for (const comm of pendingCommissions) {
    if (!comm.accountId) continue;

    comm.status = 'approved';
    comm.approvedAt = new Date();
    await comm.save();

    // Ledger entry
    await recordLedgerEntry({
      accountId: comm.accountId.toString(),
      type: 'commission_approved',
      amount: comm.amount,
      relatedCaseId: comm.caseId?.toString(),
    });

    // Move pending to approved balance
    await Account.findByIdAndUpdate(comm.accountId, {
      $inc: {
        'commissionStats.pendingCommission': -comm.amount,
        'commissionStats.approvedBalance': comm.amount,
      },
    });

    approvedCount++;

    await ActivityLog.create({
      actorAccountId: account._id,
      actionType: 'internal_commission_approved',
      newValue: `Approved $${comm.amount} for user ID ${comm.accountId}`,
    });
  }

  revalidatePath('/portal/admin/commissions'); // Assume an admin view exists or will exist
  return { success: true, count: approvedCount };
}

export async function payInternEmployeeCommission(
  commissionId: string,
  method: string,
  reference: string
) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const adminAccount = await getAccountByEmail(session.user.email);
  if (!adminAccount || !adminAccount.roles.includes('admin')) throw new Error('Unauthorized');

  const comm = await Commission.findById(commissionId);
  if (!comm) throw new Error('Commission not found');
  if (comm.status !== 'approved') throw new Error('Commission must be approved before payout');

  const userAccount = await Account.findById(comm.accountId);
  if (!userAccount) throw new Error('Account not found');

  // Must have at least the payout amount in approved balance (though partner system uses a single $50 minimum threshold, we ensure the individual commission doesn't exceed the balance)
  const approvedBalance = userAccount.commissionStats?.approvedBalance || 0;
  if (approvedBalance < comm.amount || approvedBalance < 50) {
     throw new Error(`Insufficient approved balance. Must be at least $50. Current balance: $${approvedBalance}`);
  }

  // Record payout
  const payout = await Payout.create({
    partnerId: userAccount._id, // Payout uses partnerId, but it's an ObjectId we can map to Account
    amount: comm.amount,
    status: 'paid',
    method,
    reference,
    processedAt: new Date(),
  });

  // Update commission status
  comm.status = 'paid';
  comm.paidAt = new Date();
  await comm.save();

  // Ledger entry
  await recordLedgerEntry({
    accountId: userAccount._id.toString(),
    type: 'commission_paid',
    amount: comm.amount,
    relatedCaseId: comm.caseId?.toString(),
  });

  // Update totals
  await Account.findByIdAndUpdate(userAccount._id, {
    $inc: {
      'commissionStats.approvedBalance': -comm.amount,
      'commissionStats.paidCommission': comm.amount,
    },
  });

  await ActivityLog.create({
    actorAccountId: adminAccount._id,
    actionType: 'internal_commission_paid',
    newValue: `Paid $${comm.amount} to user ID ${userAccount._id} via ${method} (Ref: ${reference})`,
  });

  revalidatePath('/portal/admin/commissions');
  return { success: true };
}

export async function getAdminCommissionOverview() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  // Fetch all internal commissions with account and case details
  const commissions = await Commission.find({ role: { $in: ['intern', 'employee'] } })
    .populate('accountId', 'fullName email roles profileImageUrl')
    .populate('caseId', 'businessName caseId')
    .sort({ createdAt: -1 })
    .lean();

  return { success: true, commissions: JSON.parse(JSON.stringify(commissions)) };
}

// ── Case Activity Timeline ─────────────────────────────────────────────────────

export async function getCaseActivityLog(caseId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((r: string) => ['admin', 'employee', 'intern'].includes(r))) {
    throw new Error('Unauthorized');
  }

  const logs = await ActivityLog.find({ caseId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('actorAccountId', 'fullName email')
    .lean();

  return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
}

export async function getClientActivityLog(clientId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((r: string) => ['admin', 'employee', 'intern'].includes(r))) {
    throw new Error('Unauthorized');
  }

  // Find all cases for this client
  const cases = await Case.find({ $or: [{ email: account.email }, { ownerId: clientId }] }, '_id').lean();
  const caseIds = cases.map((c: any) => c._id);

  const logs = await ActivityLog.find({ caseId: { $in: caseIds } })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('actorAccountId', 'fullName email')
    .lean();

  return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
}


