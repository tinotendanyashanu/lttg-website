'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ChevronDown, Sparkles, User, ArrowRight, Bot, CheckCheck, RotateCcw, AlertCircle } from 'lucide-react';

type MessageRole = 'bot' | 'visitor' | 'employee';

interface Message {
  role: MessageRole;
  content: string;
  senderName?: string;
  timestamp: Date;
}

interface Action {
  label: string;
  type: 'booking' | 'service' | 'escalate';
  href?: string;
}

type PanelView = 'chat' | 'escalate' | 'waiting';

const SESSION_KEY = 'ltg_chat_session';
const SESSION_DB_KEY = 'ltg_chat_db_id';

function generateSessionId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function tokenizeLine(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)$/);
    if (m) {
      const ext = m[2].startsWith('http');
      return (
        <a key={i} href={m[2]} target={ext ? '_blank' : undefined} rel={ext ? 'noreferrer' : undefined}
          className="underline underline-offset-2 hover:opacity-80">
          {m[1]}
        </a>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    const isBullet = /^[-*•]\s/.test(line);
    const text = isBullet ? line.replace(/^[-*•]\s/, '') : line;
    if (isBullet) {
      return (
        <span key={i} className="flex gap-1.5 items-start mt-0.5">
          <span className="mt-[7px] w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0" />
          <span>{tokenizeLine(text)}</span>
        </span>
      );
    }
    return <span key={i} className="block">{tokenizeLine(text) || <>&nbsp;</>}</span>;
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isVisitor = msg.role === 'visitor';
  const isEmployee = msg.role === 'employee';

  return (
    <div className={`flex gap-2.5 ${isVisitor ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isVisitor && (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold mt-0.5 ${isEmployee ? 'bg-emerald-500' : 'bg-[#7c3aed]'}`}>
          {isEmployee ? (msg.senderName?.[0]?.toUpperCase() || 'T') : <Bot className="w-3.5 h-3.5" />}
        </div>
      )}
      <div className={`max-w-[82%] flex flex-col gap-0.5 ${isVisitor ? 'items-end' : 'items-start'}`}>
        {isEmployee && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-1">
            {msg.senderName || 'Team'}
          </span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isVisitor
              ? 'bg-[#7c3aed] text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md'
          }`}
        >
          {renderContent(msg.content)}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

function ActionPills({
  actions,
  onEscalate,
  sessionId,
}: {
  actions: Action[];
  onEscalate: () => void;
  sessionId: string;
}) {
  function trackConversion(label: string) {
    if (!sessionId) return;
    fetch('/api/chat/converted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, event: label }),
    }).catch(() => {});
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1 mb-1">
      {actions.map((a, i) => {
        if (a.type === 'escalate') {
          return (
            <button
              key={i}
              onClick={onEscalate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors"
            >
              <User className="w-3 h-3" /> {a.label}
            </button>
          );
        }
        return (
          <a
            key={i}
            href={a.href}
            target={a.href?.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            onClick={() => trackConversion(a.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors"
          >
            <ArrowRight className="w-3 h-3" /> {a.label}
          </a>
        );
      })}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingActions, setPendingActions] = useState<Action[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [chatStatus, setChatStatus] = useState<string>('bot');
  const [hasNewReply, setHasNewReply] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escalation form
  const [escalateName, setEscalateName] = useState('');
  const [escalateEmail, setEscalateEmail] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalateError, setEscalateError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Init session
  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateSessionId();
      localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);
  }, []);

  // Check for ?chatSession= param to open a returning visitor session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnSession = params.get('chatSession');
    if (returnSession && returnSession === sessionId) {
      setOpen(true);
    }
  }, [sessionId]);

  // Poll for new replies when chat is handed off and panel is open
  const pollForReplies = useCallback(async () => {
    if (!sessionId || chatStatus === 'bot' || chatStatus === 'resolved') return;
    try {
      const res = await fetch(`/api/chat/session/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.session) return;

      const serverMsgs: Message[] = data.session.messages || [];
      const lastServerMsg = serverMsgs[serverMsgs.length - 1];
      const lastLocalMsg = messages[messages.length - 1];

      const hasNew =
        serverMsgs.length > messages.length &&
        lastServerMsg?.role === 'employee';

      if (hasNew) {
        setMessages(serverMsgs.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        setChatStatus(data.session.status);
        if (!open) setHasNewReply(true);
      }
    } catch { /* silent */ }
  }, [sessionId, chatStatus, messages, open]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(pollForReplies, 15000); // every 15s
    return () => clearInterval(interval);
  }, [pollForReplies, sessionId]);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0 && chatStatus === 'bot') {
      setMessages([{
        role: 'bot',
        content: "Hi! I'm Leo 👋 I can help with services, pricing, or booking a call. What's on your mind?",
        timestamp: new Date(),
      }]);
    }
    if (open) {
      setHasNewReply(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, chatStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Restore session from server on every page load — keeps chat alive as user navigates
  useEffect(() => {
    if (!sessionId || messages.length > 0) return;
    fetch(`/api/chat/session/${sessionId}`).then(r => r.json()).then(data => {
      if (data.session?.messages?.length > 0) {
        setMessages(data.session.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        setChatStatus(data.session.status);
        if (data.session.status !== 'bot') setView('waiting');
      }
    }).catch(() => {});
  }, [sessionId]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !sessionId) return;

    setInput('');
    setSending(true);
    setPendingActions(null);
    setError(null);

    const userMsg: Message = { role: 'visitor', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // If human_active, use visitor reply endpoint
    if (chatStatus === 'human_active' || chatStatus === 'pending_human') {
      try {
        await fetch('/api/chat/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, content: text }),
        });
      } catch {
        setError('Failed to send reply. Check your connection.');
      } finally {
        setSending(false);
      }
      return;
    }

    setTyping(true);
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (data.handedOff) {
        setChatStatus(data.status);
        setView('waiting');
        return;
      }

      setTyping(false);
      setMessages(prev => [...prev, {
        role: 'bot' as MessageRole,
        content: data.reply || "I'm here to help! What would you like to know?",
        timestamp: new Date(),
      }]);
      if (data.actions?.length) setPendingActions(data.actions);
      if (data.shouldEscalate) setView('escalate');
      if (data.status) setChatStatus(data.status);
    } catch (err) {
      setTyping(false);
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.toLowerCase().includes('429') || msg.toLowerCase().includes('too many')
          ? 'Slow down — you\'re sending too fast.'
          : 'Couldn\'t reach the AI right now. Please try again.'
      );
    } finally {
      setSending(false);
    }
  }

  async function handleEscalate(e: React.FormEvent) {
    e.preventDefault();
    if (!escalateName.trim() || !escalateEmail.trim()) {
      setEscalateError('Please fill in both fields.');
      return;
    }
    setEscalating(true);
    setEscalateError('');
    try {
      const res = await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          visitorName: escalateName.trim(),
          visitorEmail: escalateEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.sessionDbId) localStorage.setItem(SESSION_DB_KEY, data.sessionDbId);
        setChatStatus('pending_human');
        setView('waiting');
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            content: `Got it, ${escalateName.trim()}! A team member will review your conversation and reply to you at **${escalateEmail.trim()}**. You'll get an email when they respond.`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setEscalateError(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setEscalateError('Network error. Please try again.');
    } finally {
      setEscalating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function resetConversation() {
    const newSid = generateSessionId();
    localStorage.setItem(SESSION_KEY, newSid);
    localStorage.removeItem(SESSION_DB_KEY);
    setSessionId(newSid);
    setMessages([]);
    setPendingActions(null);
    setChatStatus('bot');
    setView('chat');
    setError(null);
    setInput('');
  }

  const isHumanActive = chatStatus === 'human_active' || chatStatus === 'pending_human';
  const isResolved = chatStatus === 'resolved';

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="chat-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-full bg-[#7c3aed] text-white shadow-2xl hover:bg-[#6d28d9] transition-colors flex items-center justify-center group"
              aria-label="Open chat"
            >
              <MessageCircle className="w-6 h-6" />
              {hasNewReply && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
              )}
              <span className="absolute -top-9 right-0 bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Chat with us
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-6 right-6 z-[9999] w-[90vw] max-w-[400px] flex flex-col overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.2)] bg-white dark:bg-[#18181b] border border-gray-200/60 dark:border-gray-800"
            style={{ maxHeight: 'min(580px, calc(100vh - 96px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-[#7c3aed] text-white flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-none">LeoTheTechGuy</p>
                <p className="text-[11px] text-white/70 mt-0.5 leading-none">
                  {isHumanActive
                    ? chatStatus === 'human_active'
                      ? `Chatting with ${chatStatus === 'human_active' ? 'team' : 'a team member'}`
                      : 'Waiting for a team member...'
                    : isResolved
                    ? 'Conversation closed'
                    : 'AI Assistant · Usually instant'}
                </p>
              </div>
              {messages.length > 0 && chatStatus === 'bot' && (
                <button
                  onClick={resetConversation}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="New conversation"
                  title="Start new conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
              {/* Messages view */}
              {view !== 'escalate' && (
                <div className="flex flex-col gap-3 p-4">
                  {messages.map((m, i) => (
                    <MessageBubble key={i} msg={m} />
                  ))}
                  {typing && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  {pendingActions && !typing && (
                    <div className="pl-9">
                      <ActionPills actions={pendingActions} onEscalate={() => setView('escalate')} sessionId={sessionId} />
                    </div>
                  )}

                  {/* Waiting for human state */}
                  {(view === 'waiting' || isHumanActive) && chatStatus !== 'human_active' && (
                    <div className="mx-1 mt-1 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Waiting for team</span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                        A team member will reply soon. You'll get an email notification — you can close this window and come back anytime.
                      </p>
                    </div>
                  )}

                  {chatStatus === 'resolved' && (
                    <div className="mx-1 mt-1 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Conversation resolved</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mx-1 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="text-[11px] text-red-400 hover:text-red-600 underline mt-0.5"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}

              {/* Escalation form */}
              {view === 'escalate' && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Connect with our team</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">We reply within a few hours</p>
                    </div>
                  </div>
                  <form onSubmit={handleEscalate} className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Your name</label>
                      <input
                        type="text"
                        value={escalateName}
                        onChange={e => setEscalateName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] transition-all"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Email address</label>
                      <input
                        type="email"
                        value={escalateEmail}
                        onChange={e => setEscalateEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] transition-all"
                      />
                    </div>
                    {escalateError && (
                      <p className="text-xs text-red-500 -mt-1">{escalateError}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setView('chat')}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={escalating}
                        className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {escalating ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Connect <ArrowRight className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>
                  </form>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                    We'll email you when a team member replies. No spam, ever.
                  </p>
                </div>
              )}
            </div>

            {/* Input area */}
            {view !== 'escalate' && !isResolved && (
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-white dark:bg-[#18181b]">
                {isHumanActive && chatStatus === 'pending_human' ? (
                  <div className="text-center py-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Waiting for a reply...</p>
                    <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">You can still send messages</p>
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      if (error) setError(null);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isHumanActive ? 'Reply to team...' : 'Ask anything...'}
                    className="flex-1 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] transition-all max-h-24 overflow-y-auto"
                    style={{ height: '42px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">Powered by</span>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">LeoTheTechGuy AI</span>
                </div>
              </div>
            )}

            {/* Escalate CTA in chat footer if not yet escalated */}
            {view === 'chat' && chatStatus === 'bot' && messages.length >= 1 && (
              <div className="flex-shrink-0 border-t border-gray-50 dark:border-gray-900 px-4 pb-2 pt-1 bg-white dark:bg-[#18181b]">
                <button
                  onClick={() => setView('escalate')}
                  className="w-full text-[11px] text-gray-400 dark:text-gray-500 hover:text-[#7c3aed] transition-colors py-0.5 flex items-center justify-center gap-1"
                >
                  <User className="w-3 h-3" /> Talk to a real person
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
