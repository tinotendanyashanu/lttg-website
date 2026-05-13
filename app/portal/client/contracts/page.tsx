import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  draft:        { label: 'Draft',        color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',            dot: 'bg-gray-400' },
  sent:         { label: 'Awaiting Signature', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',    dot: 'bg-blue-500' },
  under_review: { label: 'Under Review', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',  dot: 'bg-yellow-500' },
  signed:       { label: 'Signed',       color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  active:       { label: 'Active',       color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',      dot: 'bg-green-500' },
  expired:      { label: 'Expired',      color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',            dot: 'bg-gray-400' },
  terminated:   { label: 'Terminated',   color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',              dot: 'bg-red-500' },
};

async function getContracts(clientId: string) {
  try {
    await dbConnect();
    const { ClientContract } = await import('@/models/ClientContract');
    const contracts = await ClientContract.find({ clientId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(contracts));
  } catch (_) {
    return [];
  }
}

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const contracts = await getContracts(session.user.id);
  const pendingSign = contracts.filter((c: any) => ['sent', 'under_review'].includes(c.status));
  const signed      = contracts.filter((c: any) => c.status === 'signed');
  const active      = contracts.filter((c: any) => c.status === 'active');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contracts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          View and sign your agreements with us.
        </p>
      </div>

      {/* Action required banner */}
      {pendingSign.length > 0 && (
        <div className="bg-blue-600 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-icons-outlined text-white text-[20px]">draw</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {pendingSign.length === 1
                ? '1 contract awaiting your signature'
                : `${pendingSign.length} contracts awaiting your signature`}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              Please review and sign to activate your agreement.
            </p>
          </div>
          <Link
            href={`/portal/client/contracts/${pendingSign[0]._id}`}
            className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shrink-0"
          >
            Review &amp; Sign
            <span className="material-icons-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Stats pills */}
      {contracts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',   value: contracts.length,    color: 'text-gray-700 dark:text-gray-300' },
            { label: 'Active',  value: active.length,       color: 'text-green-600 dark:text-green-400' },
            { label: 'Signed',  value: signed.length,       color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Pending', value: pendingSign.length,  color: 'text-blue-600 dark:text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-soft">
              <span className={`text-base font-extrabold ${color}`}>{value}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contract list */}
      {contracts.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-icons-outlined text-gray-400 dark:text-gray-600 text-[30px]">description</span>
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No contracts on file</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            Contracts issued by our team will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: any) => {
            const meta = STATUS_META[c.status] ?? STATUS_META.draft;
            const canSign = ['sent', 'under_review'].includes(c.status);
            const isSigned = c.status === 'signed';

            return (
              <div
                key={c._id}
                className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              >
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    canSign ? 'bg-blue-50 dark:bg-blue-900/20' :
                    isSigned ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <span className={`material-icons-outlined text-[18px] ${
                      canSign ? 'text-blue-500' :
                      isSigned ? 'text-emerald-500' :
                      'text-gray-400'
                    }`}>
                      {isSigned ? 'verified' : canSign ? 'draw' : 'description'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link
                          href={`/portal/client/contracts/${c._id}`}
                          className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-primary dark:hover:text-brand-primary transition-colors line-clamp-1"
                        >
                          {c.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                            {c.contractNumber}
                          </span>
                          {c.type && (
                            <>
                              <span className="text-gray-300 dark:text-gray-700">·</span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">{c.type}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${meta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {c.value && (
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: c.currency || 'USD' }).format(c.value)}
                        </span>
                      )}
                      {c.startDate && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          From {new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {c.endDate && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Until {new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {isSigned && c.signedAt && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Signed {new Date(c.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0">
                    {canSign ? (
                      <Link
                        href={`/portal/client/contracts/${c._id}`}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-colors shadow-sm"
                      >
                        <span className="material-icons-outlined text-[14px]">draw</span>
                        Sign
                      </Link>
                    ) : (
                      <Link
                        href={`/portal/client/contracts/${c._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors px-2 py-1"
                      >
                        View
                        <span className="material-icons-outlined text-[13px]">arrow_forward</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Signing alert strip */}
                {canSign && (
                  <div className="px-5 py-2.5 border-t border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-b-2xl">
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">
                      <span className="material-icons-outlined text-[12px] align-text-bottom mr-1">schedule</span>
                      {c.signingTokenExpiresAt
                        ? `Signing link expires ${new Date(c.signingTokenExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : 'Action required — please review and sign this contract.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
