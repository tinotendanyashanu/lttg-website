'use client';

import { useState } from 'react';
import { completePayoutBatch } from '@/lib/actions/payouts';
import { CheckCircle, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BatchActionsClient({ batchId }: { batchId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkPaid = async () => {
    const reference = prompt('Enter payment reference number (optional):');
    if (reference === null) return; // User cancelled

    if (!confirm(`Mark this batch as Paid with reference: ${reference || 'None'}? This will finalize all payout statuses.`)) return;
    
    setLoading(true);
    try {
      await completePayoutBatch(batchId, reference);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete batch.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Basic CSV export logic would go here. For MVP, we'll alert.
    alert('Export CSV feature will download the list of affiliates, amounts, and payout methods.');
  };

  return (
    <div className="flex gap-2">
       <button 
         onClick={handleExportCSV}
         className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-200 transition"
       >
         <Download className="h-3 w-3 mr-1" />
         Export CSV
       </button>
       <button 
         onClick={handleMarkPaid}
         disabled={loading}
         className="flex items-center px-3 py-1.5 bg-emerald-600 text-white font-medium text-xs rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
       >
         <CheckCircle className="h-3 w-3 mr-1" />
         Mark as Paid
       </button>
    </div>
  );
}
