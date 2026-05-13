import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

async function getThreads(clientId: string, caseIdFilter?: string) {
  try {
    await dbConnect();
    const { MessageThread } = await import('@/models/MessageThread');
    const query: any = { clientId };
    if (caseIdFilter) query.caseId = caseIdFilter;
    const threads = await MessageThread.find(query).sort({ lastMessageAt: -1 }).lean();
    return JSON.parse(JSON.stringify(threads));
  } catch (_) {
    return [];
  }
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { caseId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const threads = await getThreads(session.user.id, caseId);

  return (
    <div className="space-y-4">
      {caseId && (
        <Link
          href={`/portal/client/cases/${caseId}`}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">arrow_back</span>
          Back to Case
        </Link>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {threads.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              chat
            </span>
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your team will reach out to you here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {threads.map((thread: any) => (
              <Link
                key={thread._id}
                href={`/portal/client/messages/${thread._id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    support_agent
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {thread.subject}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(thread.lastMessageAt || thread.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {thread.lastMessagePreview && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {thread.lastMessagePreview}
                    </p>
                  )}
                </div>
                {thread.unreadByClient > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {thread.unreadByClient > 9 ? '9+' : thread.unreadByClient}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
