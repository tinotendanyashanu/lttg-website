'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { CaseCommission } from '@/models/CaseCommission';
import { CommissionAllocation } from '@/models/CommissionAllocation';
import { ActivityLog } from '@/models/ActivityLog';
import { revalidatePath } from 'next/cache';



export async function markCommissionPaid(allocationId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const allocation = await CommissionAllocation.findByIdAndUpdate(
    allocationId,
    { status: 'paid', paidAt: new Date() },
    { new: true }
  ).populate('caseCommissionId');

  if (!allocation) throw new Error('Allocation not found');

  // Check if all allocations for this case commission are now paid
  if (allocation.caseCommissionId) {
    const allAllocations = await CommissionAllocation.find({ caseCommissionId: allocation.caseCommissionId });
    const allPaid = allAllocations.every(a => a.status === 'paid');
    
    if (allPaid) {
       await CaseCommission.findByIdAndUpdate(
          allocation.caseCommissionId,
          { status: 'paid', paidAt: new Date() }
       );
    }
  }

  // Log activity
  // Using 'as any' since Typescript doesn't know it was populated or we can just pass the string ID
  await ActivityLog.create({
    caseId: (allocation.caseCommissionId as any)?.caseId || null,
    actorAccountId: account._id,
    actionType: 'commission_paid',
    newValue: `Allocation ID ${allocationId} marked as paid`,
  });

  revalidatePath('/portal/admin/manage-commissions');
  return { success: true };
}
