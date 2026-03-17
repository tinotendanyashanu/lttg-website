import dbConnect from '@/lib/mongodb';
import AuditLog, { IAuditLog } from '@/models/AuditLog';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import AuditLogClient from './AuditLogClient';

async function getAuditLogs() {
  await dbConnect();
  const logs = await AuditLog.find()
    .populate('performedBy', 'fullName name email')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return JSON.parse(JSON.stringify(logs));
}

export default async function AuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="security"
        title="Audit Trail"
        description="Security trail of all sensitive system events."
      />
      <AuditLogClient logs={logs} />
    </div>
  );
}
