'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { runMultiAgentWorkup } from '@/lib/actions/support-center';

interface AgentStep {
  agent: string;
  title: string;
  detail: string;
}

export interface AgentWorkup {
  recommendation?: string;
  confidence?: number;
  canAutoResolve?: boolean;
  draftReply?: string;
  steps?: AgentStep[];
  updatedAt?: string;
}

const AGENT_ICONS: Record<string, string> = {
  triage: 'fact_check',
  knowledge: 'menu_book',
  strategist: 'psychology',
};

/**
 * Multi-agent AI workup. Runs a small team of specialized agents (triage →
 * knowledge → strategist → drafting) over the ticket and shows their combined
 * recommendation, confidence and per-agent reasoning. The persisted result is
 * passed in; the button re-runs the orchestration on demand.
 */
export default function AgentWorkupPanel({
  ticketId,
  workup,
}: {
  ticketId: string;
  workup?: AgentWorkup | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState<AgentWorkup | null>(workup || null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  function run() {
    setError('');
    startTransition(async () => {
      try {
        const res = await runMultiAgentWorkup(ticketId);
        setCurrent(res.workup as AgentWorkup);
        router.refresh();
      } catch (e) {
        setError((e as Error).message || 'Failed to run AI agents');
      }
    });
  }

  function copyDraft() {
    if (!current?.draftReply) return;
    navigator.clipboard?.writeText(current.draftReply).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const confidencePct =
    current?.confidence != null ? Math.round(current.confidence * 100) : null;

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-icons-outlined text-[15px] text-brand-primary">groups</span>
          AI Agent Team
        </h3>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="text-xs font-semibold text-brand-primary hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <span className={`material-icons-outlined text-[14px] ${pending ? 'animate-spin' : ''}`}>
            {pending ? 'autorenew' : 'auto_awesome'}
          </span>
          {pending ? 'Running…' : current ? 'Re-run' : 'Run agents'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {!current ? (
        <p className="text-xs text-gray-400">
          Run a coordinated triage → knowledge → strategist pass to get a recommendation and a draft reply.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {confidencePct != null && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary">
                {confidencePct}% confidence
              </span>
            )}
            {current.canAutoResolve ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                Auto-resolvable
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                Needs human
              </span>
            )}
          </div>

          {current.recommendation && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {current.recommendation}
            </p>
          )}

          {current.steps && current.steps.length > 0 && (
            <ul className="space-y-2 pt-1">
              {current.steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="material-icons-outlined text-[15px] text-gray-400 mt-0.5 shrink-0">
                    {AGENT_ICONS[s.agent] || 'smart_toy'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{s.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {current.draftReply && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggested Draft</p>
                <button
                  type="button"
                  onClick={copyDraft}
                  className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-icons-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/40 rounded-lg p-3 max-h-40 overflow-y-auto">
                {current.draftReply}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
