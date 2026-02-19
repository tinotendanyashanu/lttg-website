'use client';
import React, { useState } from 'react';
import { IScript } from '@/models/CommercialPlaybookConfig';
import { Copy, Check, MessageSquare } from 'lucide-react';

interface InvestmentPositioningScriptsProps {
  data: IScript[];
}

export default function InvestmentPositioningScripts({ data }: InvestmentPositioningScriptsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((script, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold text-slate-800">{script.title}</h3>
             </div>
             <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-500 capitalize">
                {script.category}
             </span>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm text-slate-600 mb-4 grow italic border border-slate-100">
            "{script.content}"
          </div>

          <button
            onClick={() => copyToClipboard(script.content, index)}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              copiedIndex === index
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {copiedIndex === index ? (
              <>
                <Check className="h-4 w-4" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Script
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
