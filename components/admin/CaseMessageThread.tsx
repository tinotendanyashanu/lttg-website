'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getCaseMessages, sendCaseMessage, markMessagesRead } from '@/lib/actions/case-messages';

interface Message {
  _id: string;
  body: string;
  authorRole: 'client' | 'admin' | 'employee' | 'intern';
  authorId?: { fullName?: string; email: string };
  createdAt: string;
}

const ROLE_STYLE: Record<string, { bubble: string; name: string }> = {
  admin:    { bubble: 'bg-brand-primary text-white',                                       name: 'text-brand-primary' },
  employee: { bubble: 'bg-blue-600 text-white',                                            name: 'text-blue-600' },
  intern:   { bubble: 'bg-sky-500 text-white',                                             name: 'text-sky-500' },
  client:   { bubble: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',    name: 'text-gray-500' },
};

function isStaffRole(role: string) {
  return ['admin', 'employee', 'intern'].includes(role);
}

export default function CaseMessageThread({
  caseId,
  viewerRole,
}: {
  caseId: string;
  viewerRole: 'admin' | 'employee' | 'intern' | 'client';
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCaseMessages(caseId),
      markMessagesRead(caseId),
    ])
      .then(([msgs]) => setMessages(msgs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!body.trim() || isPending) return;
    const optimistic: Message = {
      _id: `tmp-${Date.now()}`,
      body: body.trim(),
      authorRole: viewerRole,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setBody('');

    startTransition(async () => {
      try {
        const res = await sendCaseMessage(caseId, optimistic.body);
        setMessages(prev => prev.map(m => m._id === optimistic._id ? res.message : m));
      } catch (err: any) {
        setMessages(prev => prev.filter(m => m._id !== optimistic._id));
        alert(err.message || 'Failed to send message');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  const viewerIsStaff = isStaffRole(viewerRole);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {loading ? (
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-6">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons-outlined text-3xl text-gray-300 dark:text-gray-700">chat</span>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">No messages yet. Start the conversation.</p>
          </div>
        ) : messages.map(msg => {
          const isMine = (viewerIsStaff && isStaffRole(msg.authorRole)) || (!viewerIsStaff && msg.authorRole === 'client');
          const style = ROLE_STYLE[msg.authorRole] ?? ROLE_STYLE.client;
          const authorName = msg.authorId?.fullName || msg.authorId?.email || (isStaffRole(msg.authorRole) ? 'Staff' : 'Client');

          return (
            <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              {!isMine && (
                <span className={`text-[10px] font-semibold ${style.name} mb-0.5 ml-1`}>{authorName}</span>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${style.bubble} ${
                  isMine ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
              >
                {msg.body}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 mx-1">
                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type a message… (Ctrl+Enter to send)"
            className="flex-1 resize-none px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || isPending}
            className="p-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 text-white transition-all shrink-0"
          >
            <span className="material-icons-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
