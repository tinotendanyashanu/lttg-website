'use client';

import { useState } from 'react';
import { completePayoutBatch, getBatchSummary } from '@/lib/actions/payouts';
import { CheckCircle, Download, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BatchActionsClient({ batchId }: { batchId: string }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setSummaryLoading(true);
    setTransactionReference('');
    setPassword('');
    try {
      const data = await getBatchSummary(batchId);
      setSummary(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load batch summary.');
      setIsModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleConfirmPayout = async () => {
    if (!transactionReference.trim()) {
      alert('Transaction reference is required');
      return;
    }
    if (!password.trim()) {
      alert('Admin password is required');
      return;
    }

    setLoading(true);
    try {
      await completePayoutBatch(batchId, {
        transactionReference,
        password,
      });
      setIsModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete batch.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    alert('Export CSV feature will download the list of affiliates, amounts, and payout methods.');
  };

  return (
    <>
      <div className="flex gap-2">
         <button 
           onClick={handleExportCSV}
           className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-200 transition"
         >
           <Download className="h-3 w-3 mr-1" />
           Export CSV
         </button>
         <button 
           onClick={handleOpenModal}
           className="flex items-center px-3 py-1.5 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition"
         >
           <CheckCircle className="h-3 w-3 mr-1" />
           Mark as Paid
         </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Payout Batch
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {summaryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : summary ? (
                <>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100">
                    <p className="font-semibold mb-1">You are about to mark this batch as completed.</p>
                    <p className="opacity-90">This action cannot be undone and will finalize all associated commission entries.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Payout</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.totalAmount)}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium uppercase mb-1">Details</p>
                      <p className="text-sm font-bold text-slate-900">{summary.totalPartners} Partners</p>
                      <p className="text-xs text-slate-500">{summary.totalEntries} Commission Entries</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Transaction Reference <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        placeholder="e.g. WISE-123456789"
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                      />
                      <p className="mt-1.5 text-xs text-slate-500">Required: Traceability to bank/Wise/PayPal transaction.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                        Admin Password <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password to confirm"
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-red-500">
                  Failed to load summary details.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayout}
                disabled={loading || summaryLoading || !summary || !transactionReference || !password}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
