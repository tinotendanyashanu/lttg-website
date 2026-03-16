'use client';

import { useEffect, useState } from 'react';
import { getCaseActivityLog } from '@/lib/actions/portal-admin';

const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  case_created:          { label: 'Case Created',       icon: 'add_circle',       color: 'text-blue-500' },
  status_changed:        { label: 'Status Changed',     icon: 'swap_horiz',       color: 'text-amber-500' },
  staff_assigned:        { label: 'Staff Assigned',     icon: 'person_add',       color: 'text-purple-500' },
  case_closed:           { label: 'Case Closed',        icon: 'check_circle',     color: 'text-emerald-500' },
  invoice_created:       { label: 'Invoice Created',    icon: 'receipt_long',     color: 'text-indigo-500' },
  payment_received:      { label: 'Payment Received',   icon: 'payments',         color: 'text-emerald-600' },
  client_message:        { label: 'Client Message',     icon: 'chat',             color: 'text-sky-500' },
  internal_note:         { label: 'Note Added',         icon: 'sticky_note_2',    color: 'text-yellow-500' },
  internal_commission_paid: { label: 'Commission Paid', icon: 'monetization_on',  color: 'text-green-500' },
};

function getConfig(actionType: string) {
  return ACTION_CONFIG[actionType] ?? { label: actionType.replace(/_/g, ' '), icon: 'history', color: 'text-gray-400' };
}

interface ActivityLogEntry {
  _id: string;
  actionType: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
  actorAccountId?: { fullName?: string; email?: string };
}

interface Props {
  caseId: string;
  maxItems?: number;
}

export default function CaseActivityTimeline({ caseId, maxItems = 50 }: Props) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCaseActivityLog(caseId)
      .then((res) => {
        setLogs(res.logs.slice(0, maxItems));
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load activity.');
        setLoading(false);
      });
  }, [caseId, maxItems]);

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
        <span className="material-icons-outlined text-[18px] animate-spin">autorenew</span>
        Loading activity…
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-xs text-red-500">{error}</p>;
  }

  if (logs.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400 dark:text-gray-600 text-sm">
        <span className="material-icons-outlined text-2xl block mb-1">history</span>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800" />

      <div className="space-y-4">
        {logs.map((log) => {
          const cfg = getConfig(log.actionType);
          const actor = log.actorAccountId?.fullName || log.actorAccountId?.email || 'System';
          return (
            <div key={log._id} className="relative flex items-start gap-3">
              {/* Dot */}
              <div className={`absolute -left-[18px] w-5 h-5 rounded-full bg-white dark:bg-[#27272a] border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center`}>
                <span className={`material-icons-outlined text-[11px] ${cfg.color}`}>{cfg.icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">{cfg.label}</span>
                  <span className="text-[11px] text-gray-400">by {actor}</span>
                </div>

                {(log.previousValue || log.newValue) && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {log.previousValue && (
                      <span className="text-[11px] text-gray-400 line-through">{log.previousValue}</span>
                    )}
                    {log.previousValue && log.newValue && (
                      <span className="material-icons-outlined text-[11px] text-gray-300">arrow_forward</span>
                    )}
                    {log.newValue && (
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{log.newValue}</span>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">
                  {new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
