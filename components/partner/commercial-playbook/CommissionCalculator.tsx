'use client';
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';

export default function CommissionCalculator() {
  const [projectValue, setProjectValue] = useState<number>(5000);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [estimatedEarnings, setEstimatedEarnings] = useState<number>(0);

  useEffect(() => {
    setEstimatedEarnings((projectValue * commissionRate) / 100);
  }, [projectValue, commissionRate]);

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-lg text-white">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold">Commission Estimator</h3>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Calculate potential earnings based on deal size and commission structure.
        </p>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project / Deal Value ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="number"
                value={projectValue}
                onChange={(e) => setProjectValue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                min="0"
              />
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={projectValue}
              onChange={(e) => setProjectValue(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Commission Percentage (%)
            </label>
            <div className="flex items-center justify-between mb-4 bg-slate-800 p-1 rounded-lg border border-slate-700">
                {[10, 15, 20, 25].map((rate) => (
                    <button
                        key={rate}
                        onClick={() => setCommissionRate(rate)}
                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                            commissionRate === rate 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {rate}%
                    </button>
                ))}
            </div>
             <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
             <div className="text-right text-xs text-slate-400 mt-1">{commissionRate}% Selected</div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">Your Estimated Earning</div>
                <div className="text-4xl font-bold text-emerald-400 font-mono">
                    ${estimatedEarnings.toLocaleString()}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 bg-white/5 py-2 rounded-lg">
                    <TrendingUp className="h-3 w-3" />
                    <span>Based on {commissionRate}% of ${projectValue.toLocaleString()}</span>
                </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4 italic">
                *Estimates only. Actual commission subject to final deal terms and taxes.
            </p>
        </div>
      </div>
    </div>
  );
}
