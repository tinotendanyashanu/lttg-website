import React from 'react';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  reviewing: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  investigating: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  awaiting_client: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  resolved: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-50 text-gray-400 dark:bg-gray-900/20 dark:text-gray-500',
};

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const STATUS_ORDER = [
  'submitted',
  'reviewing',
  'investigating',
  'in_progress',
  'resolved',
];

async function getCase(clientId: string, caseId: string) {
  try {
    await dbConnect();
    const { ClientCase } = await import('@/models/ClientCase');
    const c = await ClientCase.findOne({ _id: caseId, clientId }).lean();
    return c ? JSON.parse(JSON.stringify(c)) : null;
  } catch (_) {
    return null;
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const c = await getCase(session.user.id, caseId);
  if (!c) notFound();

  const tabs = [
    { href: `/portal/client/cases/${caseId}`, label: 'Overview', icon: 'info' },
    { href: `/portal/client/cases/${caseId}/timeline`, label: 'Timeline', icon: 'timeline' },
    { href: `/portal/client/cases/${caseId}/evidence`, label: 'Evidence', icon: 'lock' },
    { href: `/portal/client/cases/${caseId}/messages`, label: 'Messages', icon: 'chat' },
  ];

  const currentStatusIdx = STATUS_ORDER.indexOf(
    c.status === 'awaiting_client' ? 'in_progress' : c.status
  );

  return (
    <div className="space-y-6">
      <Link
        href="/portal/client/cases"
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        Back to Cases
      </Link>

      {/* Case Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-400">{c.caseNumber}</span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                  STATUS_STYLES[c.status] || STATUS_STYLES.submitted
                }`}
              >
                {c.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{c.title}</h2>
            {c.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                {c.description}
              </p>
            )}
          </div>
          <Link
            href={`/portal/client/cases/${caseId}/messages`}
            className="inline-flex items-center gap-1.5 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-4 py-2 text-sm font-medium transition-colors shrink-0"
          >
            <span className="material-icons-outlined text-[14px]">chat</span>
            Message Team
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Case Type', value: c.caseType },
            {
              label: 'Priority',
              value: (
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${PRIORITY_DOT[c.priority] || PRIORITY_DOT.medium}`}
                  />
                  {c.priority}
                </span>
              ),
            },
            { label: 'Assigned Team', value: c.assignedTeam || 'Not assigned' },
            { label: 'Created', value: new Date(c.createdAt).toLocaleDateString() },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-[#27272a] rounded-xl p-1 shadow-soft border border-gray-100 dark:border-gray-800 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="material-icons-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Status Progress */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Case Progress</h3>
        <div className="flex items-center">
          {STATUS_ORDER.map((step, i) => {
            const stepIdx = STATUS_ORDER.indexOf(step);
            const isComplete = currentStatusIdx > stepIdx;
            const isCurrent = stepIdx === currentStatusIdx;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <span className="material-icons-outlined text-[14px]">check</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-[9px] font-medium mt-1 text-gray-500 dark:text-gray-400 capitalize text-center leading-tight max-w-[56px]">
                    {step.replace(/_/g, ' ')}
                  </span>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                      isComplete ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Recent Timeline */}
      {c.timeline && c.timeline.length > 0 && (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Updates</h3>
            <Link
              href={`/portal/client/cases/${caseId}/timeline`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full timeline
            </Link>
          </div>
          <div className="space-y-3">
            {[...c.timeline]
              .reverse()
              .slice(0, 3)
              .map((event: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-icons-outlined text-[14px] text-blue-600 dark:text-blue-400">
                      update
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.event}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.createdAt).toLocaleDateString()} ·{' '}
                      {event.performedByName || 'LeoTech Team'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
