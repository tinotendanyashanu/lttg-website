import React from 'react';
import { IRegionalGuideline } from '@/models/CommercialPlaybookConfig';
import { Globe } from 'lucide-react';

interface RegionalAdjustmentCardProps {
  data: IRegionalGuideline;
}

export default function RegionalAdjustmentCard({ data }: RegionalAdjustmentCardProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Regional Adjustment Guide</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tier 1</div>
          <div className="font-semibold text-slate-800">{data.tier1}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tier 2</div>
          <div className="font-semibold text-slate-800">{data.tier2}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tier 3</div>
          <div className="font-semibold text-slate-800">{data.tier3}</div>
        </div>
      </div>

      <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg text-sm border border-amber-100 flex items-start">
        <span className="font-semibold mr-1">Note:</span>
        {data.adjustmentExplanation}
      </div>
    </div>
  );
}
