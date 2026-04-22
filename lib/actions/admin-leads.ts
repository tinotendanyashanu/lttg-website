'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Commission from '@/models/Commission';
import InternProfile from '@/models/InternProfile';
import { Account } from '@/models/Account';
import { ActivityLog } from '@/models/ActivityLog';
import { getAccountByEmail } from '@/lib/data/account';
import { revalidatePath } from 'next/cache';

// Only allow specific statuses for Intern leads
export type AllowedAdminLeadStatus = 'new' | 'contacted' | 'rejected' | 'closed';

export async function updateAdminLeadStatus(leadId: string, newStatus: AllowedAdminLeadStatus) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await dbConnect();

    // Verify admin role
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) {
      return { success: false, message: 'Forbidden: Admin access required' };
    }

    // Ensure status is valid
    const allowedStatuses = ['new', 'contacted', 'rejected', 'closed'];
    if (!allowedStatuses.includes(newStatus)) {
      return { success: false, message: 'Invalid status' };
    }

    // Find lead to ensure it's an intern lead (accountId exists)
    const lead = await Lead.findOne({
      _id: leadId,
      accountId: { $exists: true }, // Only touch intern leads
    });

    if (!lead) {
      return { success: false, message: 'Lead not found or cannot be modified' };
    }

    // Phase 10: Commission Rate Integration
    // If the new status is "closed", we need to issue a commission.
    if (newStatus === 'closed' && lead.status !== 'closed') {
      const existingCommission = await Commission.findOne({ leadId: lead._id });
      if (!existingCommission) {
        // Find Account first for the new commissionRate field
        const targetAccount = await Account.findById(lead.accountId);
        let commissionRate = targetAccount?.commissionRate;

        // Fallback to InternProfile if Account commissionRate is not set (is 0 or undefined)
        if (!commissionRate) {
          const internProfile = await InternProfile.findOne({ accountId: lead.accountId });
          if (internProfile) {
            // InternProfile stores as 0.10, Account stores as 10. Normalize to 10.
            commissionRate = internProfile.commissionRate * 100;
          }
        }

        // Final fallback to role-based defaults if still 0/undefined
        if (!commissionRate && targetAccount) {
          if (targetAccount.roles.includes('employee')) commissionRate = 20;
          else if (targetAccount.roles.includes('intern')) commissionRate = 10;
        }
        
        // Only create commission if we found a rate
        if (commissionRate !== undefined && commissionRate > 0) {
          const dealValue = lead.dealValue || 0;
          const commissionAmount = dealValue * (commissionRate / 100); // UI uses 0-100, but logic might expect 0-1
          
          await Commission.create({
            accountId: lead.accountId,
            leadId: lead._id,
            amount: commissionAmount,
            status: 'pending',
            commissionRate: commissionRate // Store the rate used
          });
        }
      }
    }

    const prevStatus = lead.status;
    lead.status = newStatus;
    await lead.save();

    await ActivityLog.create({
      caseId: lead._id,
      actorAccountId: account._id,
      actionType: 'status_changed',
      previousValue: prevStatus,
      newValue: newStatus,
    });

    revalidatePath('/portal/case-management');
    revalidatePath(`/portal/case-management/${leadId}`);
    return { success: true, message: `Lead status updated to ${newStatus}` };
  } catch (error) {
    console.error('Update admin lead status error:', error);
    return { success: false, message: 'Failed to update lead status' };
  }
}
