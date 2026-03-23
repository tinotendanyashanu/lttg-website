import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminContract } from '@/lib/actions/admin-contracts';
import ContractActionPanel from '@/components/admin/ContractActionPanel';
import { isHtmlContent } from '@/lib/contract-utils';

const STATUS_STYLES: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  sent:         'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  under_review: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  signed:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  active:       'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  expired:      'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
  terminated:   'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

export default async function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/admin/login');

  const { contractId } = await params;
  const data = await getAdminContract(contractId);
  if (!data) notFound();

  const { contract, client } = data;
  const isHtml = contract.isHtml || isHtmlContent(contract.content || '');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contracts"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-icons-outlined text-[18px]">arrow_back</span>
            All Contracts
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {contract.contractNumber}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata card */}
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

            {/* Client info */}
            {client && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.fullName}</p>
                <p className="text-xs text-gray-400">{client.email}</p>
              </div>
            )}

            {/* Dates & value */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              {contract.startDate && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Start Date</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(contract.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}
              {contract.endDate && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">End Date</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(contract.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Created</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(contract.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Contract content */}
          {contract.content && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Contract Content
                </h2>
                {isHtml && (
                  <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                    HTML
                  </span>
                )}
              </div>
              {isHtml ? (
                <div
                  className="contract-body prose prose-sm dark:prose-invert max-w-none border border-gray-100 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/30"
                  dangerouslySetInnerHTML={{ __html: contract.content }}
                />
              ) : (
                <div className="whitespace-pre-wrap font-mono text-[13px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {contract.content}
                </div>
              )}
            </div>
          )}

          {/* Signature card */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Signature Status
            </h2>
            {contract.status === 'signed' ? (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl px-5 py-4">
                <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400 text-[26px]">verified</span>
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Signed</p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                    By <strong>{contract.signerName}</strong> on{' '}
                    {new Date(contract.signedAt).toLocaleString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
                    })}
                  </p>
                  {contract.signerIp && (
                    <p className="text-[11px] font-mono text-emerald-500/70 mt-1">IP: {contract.signerIp}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Awaiting signature — status is currently <strong>{contract.status.replace(/_/g, ' ')}</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Right column — action panel */}
        <div className="space-y-4">
          <ContractActionPanel
            contractId={contractId}
            currentStatus={contract.status}
            contractNumber={contract.contractNumber}
            signingTokenExpiresAt={contract.signingTokenExpiresAt}
            clientEmail={client?.email}
            notes={contract.notes}
          />
        </div>
      </div>
    </div>
  );
}
