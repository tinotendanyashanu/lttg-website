'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Commission from '@/models/Commission';
import InternProfile from '@/models/InternProfile';
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
        // Find InternProfile to get commission rate
        const internProfile = await InternProfile.findOne({ accountId: lead.accountId });
        
        // Only create commission if InternProfile exists
        if (internProfile) {
          const dealValue = lead.dealValue || 0;
          const commissionAmount = dealValue * internProfile.commissionRate;
          
          await Commission.create({
            accountId: lead.accountId,
            leadId: lead._id,
            amount: commissionAmount,
            status: 'pending'
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
