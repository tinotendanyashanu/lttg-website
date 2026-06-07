'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
  askEmployeeAssistant,
  getAssistantConversation,
  deleteAssistantConversation,
  type AssistantConversationSummary,
  type AssistantMessageView,
} from '@/lib/actions/employee-assistant';

interface Props {
  initialConversations: AssistantConversationSummary[];
}

const SUGGESTIONS = [
  'What is our onboarding process for a new client?',
  'How do we handle a pricing request from the UK?',
  'Summarise our refund and cancellation policy',
  'What are the steps to escalate a critical ticket?',
];

const CONF_CHIP: Record<string, string> = {
  high: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export default function AssistantClient({ initialConversations }: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessageView[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  async function openConversation(id: string) {
    setActiveId(id);
    setError(null);
    const convo = await getAssistantConversation(id);
    setMessages(convo?.messages || []);
  }

  function startNew() {
    setActiveId(null);
    setMessages([]);
    setError(null);
    setInput('');
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setError(null);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);

    startTransition(async () => {
      try {
        const res = await askEmployeeAssistant(activeId, trimmed);
        setActiveId(res.conversationId);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.answer, sources: res.sources, confidence: res.confidence },
        ]);
        // Refresh the conversation list (title / ordering may have changed).
        setConversations((prev) => {
          const without = prev.filter((c) => c.id !== res.conversationId);
          const existing = prev.find((c) => c.id === res.conversationId);
          return [
            {
              id: res.conversationId,
              title: existing?.title || trimmed.slice(0, 60),
              updatedAt: new Date().toISOString(),
              messageCount: (existing?.messageCount || 0) + 2,
            },
            ...without,
          ];
        });
      } catch (err: any) {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    });
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteAssistantConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) startNew();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-180px)] min-h-[520px]">
      {/* Conversation list */}
      <aside className="hidden lg:flex flex-col bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <button
          onClick={startNew}
          className="m-3 inline-flex items-center justify-center gap-2 bg-brand-primary hover:opacity-90 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-4">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`group w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2 ${
                  activeId === c.id
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="material-icons-outlined text-[16px] text-gray-400 shrink-0">chat_bubble_outline</span>
                <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-200">{c.title}</span>
                <span
                  onClick={(e) => handleDelete(c.id, e)}
                  className="material-icons-outlined text-[16px] text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                >
                  delete
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat pane */}
      <section className="flex flex-col bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons-outlined text-brand-primary text-3xl">neurology</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Internal Knowledge Assistant</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                Ask about SOPs, pricing, playbooks, contracts and workflows. Answers come from our
                internal knowledge base — never guessed.
              </p>
              <div className="grid grid-cols-1 gap-2 mt-6 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-4 py-2.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <MessageBubble key={i} message={m} />)
          )}

          {isPending && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-icons-outlined text-[18px] animate-spin">autorenew</span>
              Searching the knowledge base…
            </div>
          )}
        </div>

        {error && (
          <div className="mx-5 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-2 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3 md:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask anything about our internal processes…"
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 max-h-32"
            />
            <button
              type="submit"
              disabled={isPending || !input.trim()}
              className="shrink-0 w-11 h-11 rounded-xl bg-brand-primary hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-opacity"
            >
              <span className="material-icons-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function MessageBubble({ message }: { message: AssistantMessageView }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
            isUser
              ? 'bg-brand-primary text-white rounded-br-md'
              : 'bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        {!isUser && (message.confidence || message.sources?.length) && (
          <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
            {message.confidence && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${CONF_CHIP[message.confidence] || CONF_CHIP.low}`}>
                {message.confidence} confidence
              </span>
            )}
            {message.sources?.map((s, i) =>
              s.slug ? (
                <a
                  key={i}
                  href={`/portal/employee/knowledge-base/${s.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] text-brand-primary hover:underline"
                >
                  <span className="material-icons-outlined text-[12px]">description</span>
                  {s.title}
                </a>
              ) : (
                <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="material-icons-outlined text-[12px]">description</span>
                  {s.title}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
