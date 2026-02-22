'use client';

import { useState } from 'react';
import { Copy, CheckCircle, MousePointer2, RefreshCcw, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { generateReferralCode } from '@/lib/actions/partner';
import { useRouter } from 'next/navigation';

export default function ReferralLinkGenerator({
  referralCode,
  clicks,
  conversions
}: {
  referralCode: string;
  clicks: number;
  conversions: number;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const link = `https://leosystems.ai/?ref=${referralCode}`;
  
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';

  const copyToClipboard = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const result = await generateReferralCode();
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden mb-8 p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-center justify-between">
      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Referral Link Generator</h3>
        <p className="text-sm text-slate-500 mb-4">
          Share your unique link anywhere. Any lead captured using this link is permanently attributed to your account.
        </p>
        
        {referralCode ? (
          <div className="flex items-center gap-2 max-w-lg">
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 font-mono text-sm text-slate-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {link}
            </div>
            <button 
              onClick={copyToClipboard}
              className={`h-11 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center shrink-0 ${copied ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate Referral Code
          </button>
        )}
      </div>
      
      <div className="flex gap-4 sm:gap-8 shrink-0 w-full lg:w-auto">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
            <MousePointer2 className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{clicks}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clicks</span>
        </div>
        
        <div className="w-px h-16 bg-slate-100 self-center hidden sm:block"></div>
        
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{conversions}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signups</span>
        </div>

        <div className="w-px h-16 bg-slate-100 self-center hidden sm:block"></div>
        
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{conversionRate}%</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conv.</span>
        </div>
      </div>
    </div>
  );
}
