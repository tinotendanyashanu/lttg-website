'use client';

import { useState, useTransition } from 'react';
import { updatePartnerTier } from '@/lib/actions/admin';
import { Lock, ShieldCheck, ShieldOff, ChevronDown, AlertTriangle, CheckCircle2, Unlock } from 'lucide-react';

type Tier = 'referral' | 'agency' | 'enterprise' | 'creator';

interface TierControlPanelProps {
  partnerId: string;
  currentTier: Tier;
  tierOverride: boolean;
  tierLocked: boolean;
  tierOverrideReason?: string;
  tierLastChangedAt?: string;
  tierLastChangedBy?: string;
}

const TIER_OPTIONS: { value: Tier; label: string; description: string }[] = [
  { value: 'referral', label: 'Referral', description: '< $10k revenue' },
  { value: 'agency', label: 'Agency', description: '$10k – $50k revenue' },
  { value: 'enterprise', label: 'Enterprise', description: '> $50k revenue' },
  { value: 'creator', label: 'Creator', description: 'Creator program' },
];

const TIER_COLORS: Record<Tier, string> = {
  referral: 'bg-slate-100 text-slate-700',
  agency: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
  creator: 'bg-amber-100 text-amber-700',
};

export default function TierControlPanel({
  partnerId,
  currentTier,
  tierOverride,
  tierLocked,
  tierOverrideReason,
  tierLastChangedAt,
  tierLastChangedBy,
}: TierControlPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedTier, setSelectedTier] = useState<Tier>(currentTier);
  const [override, setOverride] = useState(tierOverride);
  const [locked, setLocked] = useState(tierLocked);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isDowngrade = TIER_OPTIONS.findIndex(t => t.value === selectedTier) < TIER_OPTIONS.findIndex(t => t.value === currentTier);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'A reason is required for all tier changes.' });
      return;
    }

    startTransition(async () => {
      try {
        await updatePartnerTier(partnerId, selectedTier, override, locked, reason.trim());
        setReason('');
        setFeedback({
          type: 'success',
          message: `Tier ${selectedTier === currentTier ? 'settings updated' : `changed to ${selectedTier}`} successfully. Audit log entry created.`,
        });
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'An unknown error occurred.',
        });
      }
    });
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-purple-600" />
        Tier Governance
      </h3>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${TIER_COLORS[currentTier]}`}>
          {currentTier} Tier
        </span>
        {tierLocked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700">
            <Lock className="h-3 w-3" />
            Locked
          </span>
        )}
        {tierOverride && !tierLocked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
            <ShieldOff className="h-3 w-3" />
            Override Active
          </span>
        )}
        {!tierOverride && !tierLocked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Auto-Managed
          </span>
        )}
      </div>

      {/* Last Changed Info */}
      {tierLastChangedAt && (
        <p className="text-xs text-slate-400 mb-5 bg-slate-50 px-3 py-2 rounded-lg">
          Last changed {new Date(tierLastChangedAt).toLocaleString()} by{' '}
          <span className="font-medium text-slate-600">
            {tierLastChangedBy === 'system' ? 'System (auto-upgrade)' : 'Admin'}
          </span>
          {tierOverrideReason && (
            <> &mdash; <span className="italic">&ldquo;{tierOverrideReason}&rdquo;</span></>
          )}
        </p>
      )}

      {/* Lock warning banner */}
      {tierLocked && (
        <div className="flex items-start gap-3 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            <strong>Tier is locked.</strong> Uncheck &ldquo;Lock Tier&rdquo; below and provide a reason to unlock and make changes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tier Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tier
          </label>
          <div className="relative">
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value as Tier)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {TIER_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {isDowngrade && (
            <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              This is a downgrade. Consider locking to prevent re-upgrade.
            </p>
          )}
        </div>

        {/* Governance Checkboxes */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={override}
              onChange={e => setOverride(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">Manual Override</p>
              <p className="text-xs text-slate-500">Disables automatic tier upgrades. Manual changes remain possible.</p>
            </div>
          </label>
          <div className="border-t border-slate-200" />
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={locked}
              onChange={e => setLocked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                {locked ? <Lock className="h-3.5 w-3.5 text-red-500" /> : <Unlock className="h-3.5 w-3.5 text-slate-400" />}
                Lock Tier
              </p>
              <p className="text-xs text-slate-500">Prevents ALL tier changes (auto or manual) without explicitly unlocking.</p>
            </div>
          </label>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Fraud suspected — downgrading and locking pending investigation."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder:text-slate-400"
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <p>{feedback.message}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm shadow-purple-500/20"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Apply Tier Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
