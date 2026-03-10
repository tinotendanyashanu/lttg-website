import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import SignContractButton from '@/components/portal/client/SignContractButton';

const STATUS_STYLES: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  sent:         'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  under_review: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  signed:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  active:       'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  expired:      'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
  terminated:   'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

async function getContract(contractId: string, clientId: string) {
  try {
    await dbConnect();
    const { ClientContract } = await import('@/models/ClientContract');
    const contract = await ClientContract.findOne({ _id: contractId, clientId }).lean();
    if (!contract) return null;
    return JSON.parse(JSON.stringify(contract));
  } catch (_) {
    return null;
  }
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const { contractId } = await params;
  const contract = await getContract(contractId, session.user.id);
  if (!contract) notFound();

  const canSign = ['sent', 'under_review'].includes(contract.status);
  const isSigned = contract.status === 'signed';

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header card */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500 mb-1">
              {contract.contractNumber}
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contract.type}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
              STATUS_STYLES[contract.status] || STATUS_STYLES.draft
            }`}
          >
            {contract.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          {contract.startDate && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Start Date</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(contract.startDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}
          {contract.endDate && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">End Date</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(contract.endDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}
          {contract.value && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Value</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: contract.currency || 'USD',
                }).format(contract.value)}
              </p>
            </div>
          )}
          {isSigned && contract.signedAt && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Signed On</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {new Date(contract.signedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract content */}
      {contract.content && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Contract Terms &amp; Conditions
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-[13px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            {contract.content}
          </div>
        </div>
      )}

      {/* Signature section */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
          Signature
        </h2>

        {isSigned ? (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl px-6 py-5">
            <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400 text-[28px]">
              verified
            </span>
            <div>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Contract Signed</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                Signed by <strong>{contract.signerName}</strong> on{' '}
                {new Date(contract.signedAt).toLocaleString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                .
              </p>
            </div>
          </div>
        ) : canSign ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Please read the contract terms above carefully before signing. By signing, you
              confirm that you have read, understood, and agreed to all terms and conditions.
            </p>
            <SignContractButton
              contractId={contract._id}
              contractNumber={contract.contractNumber}
              title={contract.title}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            This contract is not currently available for signature.
          </p>
        )}
      </div>
    </div>
  );
}
