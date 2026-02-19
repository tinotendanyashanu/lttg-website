import React from 'react';
import { IPricingTier } from '@/models/CommercialPlaybookConfig';

interface PricingMatrixTableProps {
  data: IPricingTier[];
}

export default function PricingMatrixTable({ data }: PricingMatrixTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-700">Service Level</th>
            <th className="px-6 py-4 font-semibold text-slate-700">Tier 1</th>
            <th className="px-6 py-4 font-semibold text-slate-700">Tier 2</th>
            <th className="px-6 py-4 font-semibold text-slate-700">Tier 3</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">{row.serviceLevel}</td>
              <td className="px-6 py-4 text-slate-600">{row.tier1}</td>
              <td className="px-6 py-4 text-slate-600">{row.tier2}</td>
              <td className="px-6 py-4 text-slate-600">{row.tier3}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium text-center">
        Final investment confirmed after structured review.
      </div>
    </div>
  );
}
