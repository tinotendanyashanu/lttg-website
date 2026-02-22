'use client';

import { Shield, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CommissionForecastPanel({
  isEligible,
  reasons,
  approvedBalance,
  pendingCommission
}: {
  isEligible: boolean;
  reasons: string[];
  approvedBalance: number;
  pendingCommission: number;
}) {
  const nextDate = new Date();
  // If today is after the 5th, next payout is next month's 5th
  if (nextDate.getDate() > 5) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  nextDate.setDate(5);
  
  const formattedDate = nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
            Estimated Next Payout
          </h3>
          <p className="text-sm text-slate-500 mt-1">Status and forecast for <span className="font-bold text-slate-800">{formattedDate}</span></p>
        </div>
        <Link href="/partner/dashboard/settings" className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
          Payout Settings
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-500 mb-1">Approved Balance</p>
          <p className={`text-xl sm:text-2xl font-bold ${approvedBalance >= 50 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(approvedBalance)}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-500 mb-1">Pending Amount</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pendingCommission)}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-500 mb-1">Minimum Threshold</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">$50.00</p>
        </div>
      </div>

      {!isEligible ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Shield className="h-5 w-5 mr-3 shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
          <div className="flex flex-col">
            <p className="font-bold mb-1">Not eligible for next payout:</p>
            <ul className="list-disc pl-5 space-y-1">
              {reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-start sm:items-center p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="h-5 w-5 mr-3 shrink-0 text-emerald-600 mt-0.5 sm:mt-0" />
          <p><strong>Eligible for Payout:</strong> Your approved balance meets requirements. Expect processing on {formattedDate}.</p>
        </div>
      )}
    </div>
  );
}
