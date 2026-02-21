'use client';

import { useState, useTransition, useRef } from 'react';
import { resolveRiskFlag } from '@/lib/actions/admin';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, Clock, Info } from 'lucide-react';

type RiskFlagType = 'duplicate_client' | 'cross_affiliate_email' | 'self_referral' | 'deal_value_spike';
type Severity = 'low' | 'medium' | 'high';

export interface RiskFlag {
  _id: string;
  type: RiskFlagType;
  severity: Severity;
  message: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

interface RiskFlagsPanelProps {
  flags: RiskFlag[];
  title?: string;
}

const FLAG_LABELS: Record<RiskFlagType, string> = {
  duplicate_client: 'Duplicate Client',
  cross_affiliate_email: 'Cross-Affiliate Email',
  self_referral: 'Self-Referral',
  deal_value_spike: 'Deal Value Spike',
};

const SEVERITY_CONFIG: Record<Severity, {
  bg: string; border: string; text: string; badge: string; icon: typeof AlertTriangle;
}> = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-600 text-white',
    icon: ShieldAlert,
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-500 text-white',
    icon: AlertTriangle,
  },
  low: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    badge: 'bg-slate-400 text-white',
    icon: Info,
  },
};

function FlagCard({ flag }: { flag: RiskFlag }) {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localResolved, setLocalResolved] = useState(flag.resolved);
  const formRef = useRef<HTMLFormElement>(null);

  const cfg = SEVERITY_CONFIG[flag.severity];
  const Icon = cfg.icon;

  const handleResolve = () => {
    startTransition(async () => {
      await resolveRiskFlag(flag._id, notes);
      setLocalResolved(true);
      setShowResolveForm(false);
    });
  };

  return (
    <div className={`rounded-xl border p-4 ${localResolved ? 'bg-slate-50 border-slate-100 opacity-70' : `${cfg.bg} ${cfg.border}`}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {localResolved ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${cfg.text}`} />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${localResolved ? 'bg-emerald-100 text-emerald-700' : cfg.badge}`}>
                {localResolved ? 'Resolved' : flag.severity}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {FLAG_LABELS[flag.type]}
              </span>
            </div>
            <p className={`text-sm ${localResolved ? 'text-slate-500' : cfg.text}`}>
              {flag.message}
            </p>
            {localResolved && flag.resolutionNotes && (
              <p className="mt-1 text-xs text-slate-400 italic">Note: {flag.resolutionNotes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {new Date(flag.createdAt).toLocaleDateString()}
          </div>
          {!localResolved && (
            <button
              onClick={() => setShowResolveForm((v) => !v)}
              className="text-xs px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors font-medium"
            >
              {showResolveForm ? 'Cancel' : 'Mark Resolved'}
            </button>
          )}
        </div>
      </div>

      {showResolveForm && !localResolved && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Resolution Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Describe how this flag was investigated or resolved..."
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleResolve}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isPending ? 'Saving…' : 'Confirm Resolved'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiskFlagsPanel({ flags, title = 'Risk Flags' }: RiskFlagsPanelProps) {
  const unresolvedFlags = flags.filter((f) => !f.resolved);
  const resolvedFlags = flags.filter((f) => f.resolved);

  // Sort by severity: high → medium → low
  const severityOrder: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  const sortedUnresolved = [...unresolvedFlags].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  if (flags.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {unresolvedFlags.some((f) => f.severity === 'high') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
              <ShieldAlert className="h-3 w-3" />
              {unresolvedFlags.filter((f) => f.severity === 'high').length} High
            </span>
          )}
          {unresolvedFlags.some((f) => f.severity === 'medium') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              <AlertTriangle className="h-3 w-3" />
              {unresolvedFlags.filter((f) => f.severity === 'medium').length} Medium
            </span>
          )}
          {unresolvedFlags.some((f) => f.severity === 'low') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {unresolvedFlags.filter((f) => f.severity === 'low').length} Low
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {sortedUnresolved.map((flag) => (
          <FlagCard key={flag._id} flag={flag} />
        ))}

        {resolvedFlags.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 font-medium py-1 list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block text-slate-300">▶</span>
              {resolvedFlags.length} resolved flag{resolvedFlags.length !== 1 ? 's' : ''}
            </summary>
            <div className="mt-2 space-y-2">
              {resolvedFlags.map((flag) => (
                <FlagCard key={flag._id} flag={flag} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
