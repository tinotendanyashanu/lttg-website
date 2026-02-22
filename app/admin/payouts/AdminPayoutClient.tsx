'use client';

import { useState } from 'react';
import { generateMonthlyPayoutBatch, processCommissionApprovals } from '@/lib/actions/payouts';
import { CheckCircle, AlertCircle, Play, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPayoutClient({ 
  eligibleCount, 
}: { 
  eligibleCount: number, 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleProcessApprovals = async () => {
    setLoading(true);
    setMessage('');
    setError(false);
    try {
      const res = await processCommissionApprovals();
      setMessage(`Successfully approved ${res.count} commissions.`);
      router.refresh();
    } catch (err: unknown) {
      setError(true);
      setMessage(err instanceof Error ? err.message : 'Failed to process approvals.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (!confirm('Are you sure you want to generate the monthly payout batch for all eligible affiliates?')) return;
    
    setLoading(true);
    setMessage('');
    setError(false);
    try {
      const res = await generateMonthlyPayoutBatch();
      if (res.success) {
         setMessage(`Successfully generated batch. Included ${res.dealsCount} deals for $${res.totalAmount}.`);
         router.refresh();
      } else {
         setError(true);
         setMessage(res.message || 'Failed to generate batch.');
      }
    } catch (err: unknown) {
      setError(true);
      setMessage(err instanceof Error ? err.message : 'Failed to generate batch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
       <h3 className="text-lg font-bold text-slate-900 mb-2">Monthly Processing Actions</h3>
       
       {message && (
          <div className={`flex items-center p-4 rounded-xl text-sm font-medium ${
            !error ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {!error ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
            {message}
          </div>
       )}

       <div className="flex flex-wrap gap-4">
          <button 
             onClick={handleProcessApprovals}
             disabled={loading}
             className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
             <CheckSquare className="h-4 w-4 mr-2" />
             Process Approvals (14-Day Hold)
          </button>
          
          <button 
             onClick={handleGenerateBatch}
             disabled={loading || eligibleCount === 0}
             className="flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Play className="h-4 w-4 mr-2" />
             Generate Monthly Payout Batch ({eligibleCount} Eligible)
          </button>
       </div>
       <p className="text-sm text-slate-500 mt-4">
         * You must process approvals first to ensure all eligible commissions past the 14-day hold are added to affiliate balances.
       </p>
    </div>
  );
}
