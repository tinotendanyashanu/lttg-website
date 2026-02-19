'use client';

import { useState } from 'react';
import { updateDealStatus, recordCommissionPayment } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

import { Deal } from '@/types';

export default function DealActionForm({ deal, partnerName }: { deal: Deal, partnerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [finalValue, setFinalValue] = useState(deal.finalValue || deal.estimatedValue);
  const [commissionRate, setCommissionRate] = useState(deal.commissionRate || 0.10);
  const [status, setStatus] = useState(deal.dealStatus);
  
  // Feedback state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment recording state
  const [paymentAmount, setPaymentAmount] = useState(deal.commissionAmount || (deal.finalValue || deal.estimatedValue) * deal.commissionRate);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');

  const handleStatusUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
          await updateDealStatus(deal._id, status, Number(finalValue), Number(commissionRate));
          setSuccess('Deal status updated successfully');
          router.refresh();
      } catch (err: unknown) {
          console.error(err);
          if (err instanceof Error) {
            setError(err.message || 'Failed to update status');
          } else {
            setError('Failed to update status');
          }
      } finally {
          setLoading(false);
      }
  };

  const handleCommissionPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
          await recordCommissionPayment(deal._id, Number(paymentAmount), paymentMethod, paymentRef);
          setSuccess('Commission payment recorded successfully');
          router.refresh();
      } catch (err: unknown) {
          console.error(err);
          if (err instanceof Error) {
             setError(err.message || 'Failed to record payment');
          } else {
             setError('Failed to record payment');
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8">
      {/* Feedback Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700">
            <XCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
                <h4 className="font-bold text-sm">Action Failed</h4>
                <p className="text-sm">{error}</p>
            </div>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-emerald-700">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
                <h4 className="font-bold text-sm">Success</h4>
                <p className="text-sm">{success}</p>
            </div>
        </div>
      )}

      {/* Status Update Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Update Deal Status</h3>
        <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as Deal['dealStatus'])}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="registered">Registered</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed (Won)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Final Deal Value ($)</label>
                <input 
                    type="number" 
                    value={finalValue} 
                    onChange={(e) => setFinalValue(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commission Rate (0.10 = 10%)</label>
                <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="1"
                    value={commissionRate} 
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Status & Value'}
            </button>
        </form>
      </div>

      {/* Commission Payment Card - Only if closed/approved */}
      {['approved', 'closed'].includes(deal.dealStatus) && deal.paymentStatus !== 'commission_paid' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Commission Payment</h3>
            <p className="text-sm text-slate-500 mb-4">
                Record that you have paid <strong>{partnerName}</strong> their commission. This will generate a payout record.
            </p>
            <form onSubmit={handleCommissionPayment} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Commission Amount ($)</label>
                    <input 
                        type="number" 
                        value={paymentAmount} 
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                        <select 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="stripe">Stripe</option>
                            <option value="cash">Cash / Check</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reference ID</label>
                        <input 
                            type="text" 
                            value={paymentRef} 
                            onChange={(e) => setPaymentRef(e.target.value)}
                            placeholder="Txn ID"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Record Payment'}
                </button>
            </form>
          </div>
      )}
      
       {deal.paymentStatus === 'commission_paid' && (
           <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-700">
               <span className="font-bold mr-2">✓ Commission Paid</span>
               <span>on {new Date().toLocaleDateString()} (Check Audit Logs for details)</span>
           </div>
       )}
    </div>
  );
}
