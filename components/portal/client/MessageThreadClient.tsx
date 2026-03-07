'use client';

import { useActionState, useEffect, useRef } from 'react';
import { sendClientMessage } from '@/lib/actions/client';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface Props {
  threadId: string;
  initialMessages: Message[];
  clientId: string;
}

export default function MessageThreadClient({ threadId, initialMessages, clientId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(sendClientMessage, null);

  // Optimistic-style: scroll to bottom on new messages or after send
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialMessages.length, state]);

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] min-h-[400px]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {initialMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-2">
              chat_bubble_outline
            </span>
            <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
          </div>
        )}
        {initialMessages.map((msg) => {
          const isMe = msg.senderId === clientId;
          return (
            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isMe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isMe ? 'You' : (msg.senderName?.[0] || 'T')}
              </div>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">
                    {isMe ? 'You' : msg.senderName || 'LeoTech Team'}
                  </span>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 shadow-soft rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        {state?.error && (
          <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
            <span className="material-icons-outlined text-[14px]">error_outline</span>
            {state.error}
          </p>
        )}
        <form action={action} className="flex gap-3 items-end">
          <input type="hidden" name="threadId" value={threadId} />
          <textarea
            name="content"
            required
            rows={2}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-11 h-11 rounded-full bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
          >
            {pending ? (
              <span className="material-icons-outlined text-[18px] animate-spin">refresh</span>
            ) : (
              <span className="material-icons-outlined text-[18px]">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
