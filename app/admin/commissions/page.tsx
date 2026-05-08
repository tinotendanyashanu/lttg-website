import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CommissionManagerClient from '@/app/portal/employee/admin/manage-commissions/CommissionManagerClient';
import { getAdminCommissionOverview } from '@/lib/actions/portal-admin';
import dbConnect from '@/lib/mongodb';
import { CaseCommission } from '@/models/CaseCommission';
import { CommissionAllocation } from '@/models/CommissionAllocation';

export const metadata = { title: 'Commissions | Admin' };

export default async function AdminCommissionsPage() {
  let caseCommissions: any[] = [];
  let allocations: any[] = [];
  let internalComms: any[] = [];

  try {
    await dbConnect();
    const [rawCommissions, rawAllocations] = await Promise.all([
      CaseCommission.find()
        .populate('caseId', 'businessName closedAt')
        .sort({ createdAt: -1 })
        .lean(),
      CommissionAllocation.find()
        .populate('accountId', 'email fullName roles')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    caseCommissions = JSON.parse(JSON.stringify(rawCommissions));
    allocations = JSON.parse(JSON.stringify(rawAllocations));

    const { commissions } = await getAdminCommissionOverview();
    internalComms = commissions ?? [];
  } catch {
    // render with empty data rather than crashing
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="monetization_on"
        title="Commission Control"
        description="View and manage all system commissions and allocation breakdowns."
      />
      <CommissionManagerClient
        initialCommissions={caseCommissions}
        initialAllocations={allocations}
        internalCommissions={internalComms}
      />
    </div>
  );
}
