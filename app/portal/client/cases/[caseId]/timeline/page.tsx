import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

async function getCaseTimeline(clientId: string, caseId: string) {
  try {
    await dbConnect();
    const { ClientCase } = await import('@/models/ClientCase');
    const c = await ClientCase.findOne(
      { _id: caseId, clientId },
      { timeline: 1, caseNumber: 1, title: 1 }
    ).lean();
    return c ? JSON.parse(JSON.stringify(c)) : null;
  } catch (_) {
    return null;
  }
}

export default async function CaseTimelinePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getCaseTimeline(session.user.id, caseId);
  if (!data) notFound();

  const timeline = [...(data.timeline || [])].reverse();

  return (
    <div className="space-y-6">
      <Link
        href={`/portal/client/cases/${caseId}`}
        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        Back to Case
      </Link>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 px-6 py-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Full Timeline</p>
        <p className="font-semibold text-gray-900 dark:text-white">
          {data.caseNumber} · {timeline.length} events
        </p>
      </div>

      {timeline.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 py-20 text-center">
          <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
            timeline
          </span>
          <p className="text-gray-500 dark:text-gray-400">No timeline events yet</p>
        </div>
      ) : (
        <div>
          {timeline.map((event: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border-2 border-[#FAFAFA] dark:border-[#18181b]">
                  <span className="material-icons-outlined text-[16px] text-blue-600 dark:text-blue-400">
                    update
                  </span>
                </div>
                {i < timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-800 min-h-[24px]" />
                )}
              </div>
              <div className="flex-1 bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-4 mb-3">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{event.event}</p>
                {event.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {event.performedByName || 'LeoTech Team'} ·{' '}
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
