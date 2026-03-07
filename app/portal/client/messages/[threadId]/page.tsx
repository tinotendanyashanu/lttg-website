import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import MessageThreadClient from '@/components/portal/client/MessageThreadClient';

async function getThreadWithMessages(clientId: string, threadId: string) {
  try {
    await dbConnect();
    const { MessageThread } = await import('@/models/MessageThread');
    const { ClientMessage } = await import('@/models/ClientMessage');
    const [thread, messages] = await Promise.all([
      MessageThread.findOne({ _id: threadId, clientId }).lean(),
      ClientMessage.find({ threadId }).sort({ createdAt: 1 }).lean(),
    ]);
    if (!thread) return null;
    // Mark as read
    await MessageThread.updateOne({ _id: threadId }, { $set: { unreadByClient: 0 } });
    return {
      thread: JSON.parse(JSON.stringify(thread)),
      messages: JSON.parse(JSON.stringify(messages)),
    };
  } catch (_) {
    return null;
  }
}

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const data = await getThreadWithMessages(session.user.id, threadId);
  if (!data) notFound();

  return (
    <div className="space-y-4 max-w-3xl flex flex-col h-full">
      <div className="flex items-center gap-3">
        <Link
          href="/portal/client/messages"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
        >
          <span className="material-icons-outlined text-[16px]">arrow_back</span>
          Messages
        </Link>
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{data.thread.subject}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {data.messages.length} message{data.messages.length !== 1 ? 's' : ''}
          </p>
        </div>
        {data.thread.caseId && (
          <Link
            href={`/portal/client/cases/${data.thread.caseId}`}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span className="material-icons-outlined text-[14px]">folder_shared</span>
            View Case
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 flex-1">
        <MessageThreadClient
          threadId={threadId}
          initialMessages={data.messages}
          clientId={session.user.id}
        />
      </div>
    </div>
  );
}
