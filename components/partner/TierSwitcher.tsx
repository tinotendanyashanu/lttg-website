'use client';

import { useState } from 'react';
import { Award, MousePointer2, Info, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { switchTier } from '@/lib/actions/partner';
import { useRouter } from 'next/navigation';

export default function TierSwitcher({ 
  currentTier,
  isLocked
}: { 
  currentTier: 'referral' | 'agency' | 'enterprise' | 'creator';
  isLocked: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetTier, setTargetTier] = useState<'referral' | 'creator' | null>(null);
  const router = useRouter();

  const handleSwitch = async (tier: 'referral' | 'creator') => {
    if (tier === currentTier) return;
    setTargetTier(tier);
    setShowConfirm(true);
  };

  const confirmSwitch = async () => {
    if (!targetTier) return;
    
    setLoading(true);
    setMessage(null);
    setShowConfirm(false);

    try {
      const result = await switchTier(targetTier);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!['referral', 'creator'].includes(currentTier)) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 flex items-center mb-2">
          <Award className="h-5 w-5 mr-2 text-emerald-500" />
          Partner Tier
        </h3>
        <p className="text-sm text-slate-500">
          You are currently an <span className="font-bold text-slate-900 capitalize">{currentTier} Partner</span>. 
          Advanced tiers cannot be manually downgraded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-slate-400" />
              Manage Your Tier
            </h3>
            <p className="text-sm text-slate-500 mt-1">Switch between our two starter models to fit your business style.</p>
          </div>
          {isLocked && (
            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-amber-100">
              <AlertCircle className="h-3 w-3 mr-1" />
              Tier Locked
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Creator Option */}
          <button
            onClick={() => handleSwitch('creator')}
            disabled={loading || isLocked || currentTier === 'creator'}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
              currentTier === 'creator' 
                ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10' 
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
            } ${loading || isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {currentTier === 'creator' && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-xl mr-4 ${currentTier === 'creator' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                <MousePointer2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Creator Partner</h4>
                <p className="text-xs text-slate-500 font-medium">8% Commission • Link Based</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>Automated tracking via unique link</span>
              </li>
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>No need to register deals manually</span>
              </li>
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>Perfect for social & blog sharing</span>
              </li>
            </ul>
          </button>

          {/* Referral Option */}
          <button
            onClick={() => handleSwitch('referral')}
            disabled={loading || isLocked || currentTier === 'referral'}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
              currentTier === 'referral' 
                ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10' 
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
            } ${loading || isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {currentTier === 'referral' && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-xl mr-4 ${currentTier === 'referral' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Referral Partner</h4>
                <p className="text-xs text-slate-500 font-medium">10% Commission • Manual Approval</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>Higher standard commission rate</span>
              </li>
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>Register specific client opportunities</span>
              </li>
              <li className="flex items-center text-xs text-slate-600">
                <Check className="h-3 w-3 mr-2 text-emerald-500 shrink-0" />
                <span>Personalized relationship model</span>
              </li>
            </ul>
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl flex items-start ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            <Info className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {showConfirm && (
          <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
            <h5 className="font-bold mb-2">Switch to {targetTier === 'creator' ? 'Creator' : 'Referral'} Tier?</h5>
            <p className="text-sm text-slate-400 mb-6">
              Your commission rate and tracking method will change immediately. This will be logged on your account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmSwitch}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors flex items-center"
              >
                {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Change
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
