import dbConnect from '@/lib/mongodb';
import AuditLog, { IAuditLog } from '@/models/AuditLog';
import { IPartner } from '@/models/Partner';

type PopulatedAuditLog = Omit<IAuditLog, 'performedBy'> & { performedBy: IPartner | null };

async function getAuditLogs() {
  await dbConnect();
  return AuditLog.find()
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(50) // Cap at 50 for now
    .lean() as unknown as PopulatedAuditLog[];
}

export default async function AuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
          <p className="text-slate-500">Security trail of all sensitive events.</p>
        </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Actor</th>
                        <th className="px-6 py-4">Entity</th>
                        <th className="px-6 py-4">Metadata</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length > 0 ? (
                        logs.map((log: PopulatedAuditLog) => (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            <tr key={(log._id as any).toString()} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-purple-700">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{log.performedBy?.name || 'System'}</div>
                                    <div className="text-xs text-slate-400">{log.performedBy?.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{log.entityType}</span>
                                    <span className="ml-2 font-mono text-xs text-slate-400">{log.entityId.toString().slice(-6)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <pre className="text-xs text-slate-500 bg-slate-50 p-2 rounded max-w-xs overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                No logs found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
