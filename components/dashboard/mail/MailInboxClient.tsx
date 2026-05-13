'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Loader2, Mail, Paperclip, Plus, RefreshCw, Send, X } from 'lucide-react';
import ClientCombobox from '@/components/ClientCombobox';
import type { MailCaseDetail, MailCaseListItem, MailClient, MailMessage } from '@/lib/types/mail';
import {
  fetchMailClients,
  fetchMailCaseDetail,
  fetchMailCases,
  fetchMailMessages,
  sendNewMailMessage,
  sendMailMessage,
  triggerMailSync,
} from '@/lib/services/mail-api';

function useVisibilityInterval(visibleMs: number, hiddenMs: number, cb: () => void) {
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        cb();
      }
    };
    const arm = () => {
      clearInterval(id);
      const ms = typeof document !== 'undefined' && document.visibilityState === 'visible' ? visibleMs : hiddenMs;
      id = setInterval(tick, ms);
    };
    arm();
    const vis = () => arm();
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [visibleMs, hiddenMs, cb]);
}

interface MailInboxClientProps {
  userId: string;
  role: 'admin' | 'employee';
  displayName: string;
}

export default function MailInboxClient({ userId, role, displayName }: MailInboxClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [cases, setCases] = useState<MailCaseListItem[]>([]);
  const [caseFilter, setCaseFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MailCaseDetail | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [clients, setClients] = useState<MailClient[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [compose, setCompose] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [recipientMode, setRecipientMode] = useState<'existing' | 'outside'>('existing');
  const [newClientId, setNewClientId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [sendingNew, setSendingNew] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const searchRef = useRef(search);
  searchRef.current = search;

  const loadToken = useCallback(async () => {
    setTokenError(null);
    const r = await fetch('/api/mail/token');
    if (!r.ok) {
      setTokenError(r.status === 403 ? 'You do not have access to mail.' : 'Could not authorize mail.');
      return null;
    }
    const j = (await r.json()) as { token: string };
    setToken(j.token);
    return j.token;
  }, []);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  const refreshCases = useCallback(async () => {
    const t = token ?? (await loadToken());
    if (!t) return;
    try {
      setLoadingList(true);
      const st = caseFilter === 'all' ? undefined : caseFilter;
      const list = await fetchMailCases(t, {
        status: st,
        q: searchRef.current.trim() || undefined,
      });
      setCases(list);
      setBanner(null);
    } catch {
      setBanner('Could not load cases. Check NEXT_PUBLIC_BACKEND_URL and backend logs.');
    } finally {
      setLoadingList(false);
    }
  }, [token, caseFilter, loadToken]);

  const refreshThread = useCallback(async () => {
    if (!selectedId) return;
    const t = token ?? (await loadToken());
    if (!t) return;
    try {
      setLoadingThread(true);
      const [d, m] = await Promise.all([
        fetchMailCaseDetail(t, selectedId),
        fetchMailMessages(t, selectedId, { limit: 200 }),
      ]);
      setDetail(d);
      setMessages(m.items);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('403')) setBanner('You cannot view this case.');
      else setBanner('Could not load conversation.');
    } finally {
      setLoadingThread(false);
    }
  }, [selectedId, token, loadToken]);

  useEffect(() => {
    if (token) void refreshCases();
  }, [token, caseFilter, refreshCases]);

  useEffect(() => {
    if (!token) return;
    fetchMailClients(token)
      .then(setClients)
      .catch(() => setBanner('Could not load clients.'));
  }, [token]);

  useEffect(() => {
    if (selectedId && token) void refreshThread();
  }, [selectedId, token, refreshThread]);

  const onListTick = useCallback(() => {
    void refreshCases();
  }, [refreshCases]);

  const onThreadTick = useCallback(() => {
    void refreshThread();
  }, [refreshThread]);

  useVisibilityInterval(30_000, 60_000, onListTick);
  useVisibilityInterval(15_000, 30_000, onThreadTick);

  const canActOnCase = useMemo(() => {
    if (!detail) return false;
    if (role === 'admin') return true;
    return detail.assigned_to === userId;
  }, [role, userId, detail]);

  const backHref = role === 'admin' ? '/admin' : '/portal/employee';

  const handleSend = async () => {
    if (!selectedId || !compose.trim()) return;
    const t = token ?? (await loadToken());
    if (!t) return;
    try {
      await sendMailMessage(t, { caseId: selectedId, content: compose.trim(), files });
      setCompose('');
      setFiles([]);
      await refreshThread();
      await refreshCases();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('403')) setBanner('You cannot send on this case.');
      else setBanner('Send failed.');
    }
  };

  const handleSendNew = async () => {
    const t = token ?? (await loadToken());
    if (!t || sendingNew) return;

    const selectedClient = clients.find((client) => client.id === newClientId);
    const recipientEmail = recipientMode === 'existing' ? selectedClient?.email : newEmail.trim();
    const recipientName = recipientMode === 'existing' ? selectedClient?.name : newName.trim();

    if (!recipientEmail || !newSubject.trim() || !newContent.trim()) {
      setBanner('Recipient, subject, and message are required.');
      return;
    }

    setSendingNew(true);
    try {
      const sent = await sendNewMailMessage(t, {
        recipientEmail,
        recipientName,
        subject: newSubject.trim(),
        content: newContent.trim(),
        files: newFiles,
      });
      setNewOpen(false);
      setRecipientMode('existing');
      setNewClientId('');
      setNewName('');
      setNewEmail('');
      setNewSubject('');
      setNewContent('');
      setNewFiles([]);
      setSelectedId(sent.case_id);
      await refreshCases();
      setClients(await fetchMailClients(t));
    } catch {
      setBanner('Send failed.');
    } finally {
      setSendingNew(false);
    }
  };

  const handleSync = async () => {
    const t = token ?? (await loadToken());
    if (!t) return;
    setSyncing(true);
    try {
      await triggerMailSync(t);
      await refreshCases();
      if (selectedId) await refreshThread();
    } catch {
      setBanner('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  if (tokenError) {
    return (
      <div className="max-w-lg mx-auto mt-20 p-6 rounded-2xl bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-800 shadow-sm">
        <p className="text-sm text-red-600 dark:text-red-400">{tokenError}</p>
        <Link href={backHref} className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-brand-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] max-w-[1600px] mx-auto">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#18181b]/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backHref}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Mail className="w-6 h-6 text-brand-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">Mail</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {displayName} · Gmail cases
            </p>
          </div>
        </div>
        {(role === 'admin' || role === 'employee') && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-primary text-white"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync
            </button>
          </div>
        )}
      </header>

      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#27272a]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-bold">New Email</h2>
              <button type="button" onClick={() => setNewOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setRecipientMode('existing')}
                  className={`px-4 py-2 text-sm font-semibold ${recipientMode === 'existing' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white text-gray-600 dark:bg-[#27272a] dark:text-gray-300'}`}
                >
                  Existing Client
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('outside')}
                  className={`px-4 py-2 text-sm font-semibold ${recipientMode === 'outside' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white text-gray-600 dark:bg-[#27272a] dark:text-gray-300'}`}
                >
                  Outside Database
                </button>
              </div>

              {recipientMode === 'existing' ? (
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Client</label>
                  <ClientCombobox
                    clients={clients.map((client) => ({ _id: client.id, fullName: client.name, email: client.email }))}
                    value={newClientId}
                    onChange={setNewClientId}
                    placeholder="Select a client..."
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Name</label>
                    <input
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-[#18181b]"
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(event) => setNewEmail(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-[#18181b]"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Subject</label>
                <input
                  value={newSubject}
                  onChange={(event) => setNewSubject(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-[#18181b]"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Message</label>
                <textarea
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  rows={7}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-[#18181b]"
                  placeholder="Write your email..."
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="cursor-pointer text-xs font-semibold text-gray-500">
                  <input type="file" multiple className="hidden" onChange={(event) => setNewFiles(event.target.files ? Array.from(event.target.files) : [])} />
                  <span className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                    <Paperclip className="h-4 w-4" /> Attach
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => void handleSendNew()}
                  disabled={sendingNew || !newSubject.trim() || !newContent.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-gray-900"
                >
                  {sendingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
              {newFiles.length > 0 && <p className="text-xs text-gray-500">{newFiles.map((file) => file.name).join(', ')}</p>}
            </div>
          </div>
        </div>
      )}

      {banner && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm border border-amber-200 dark:border-amber-800">
          {banner}
          <button type="button" className="ml-2 underline font-semibold" onClick={() => setBanner(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 border-t border-gray-100 dark:border-gray-800">
        {/* List */}
        <aside className="w-full md:w-[380px] shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#27272a]">
          <div className="p-3 space-y-2 border-b border-gray-100 dark:border-gray-800">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void refreshCases()}
              placeholder="Search client…"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18181b] px-3 py-2 text-sm"
            />
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {(['open', 'closed', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCaseFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize ${
                    caseFilter === f
                      ? 'bg-white dark:bg-[#18181b] shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : cases.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No cases yet.</p>
            ) : (
              cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedId === c.id ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-primary">{c.id}</p>
                      <p className="text-sm font-semibold truncate">{c.client_name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.client_email}</p>
                      {c.last_message_preview && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.last_message_preview}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {c.last_message_at && (
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                      {c.has_unread_client && (
                        <span className="w-2 h-2 rounded-full bg-brand-primary" title="Client replied" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#18181b]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8">
              Select a case to view messages.
            </div>
          ) : loadingThread && !detail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] shrink-0">
                <p className="text-xs font-bold text-brand-primary">{detail?.id}</p>
                <p className="text-lg font-bold">{detail?.client_name}</p>
                <p className="text-sm text-gray-500">{detail?.client_email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => {
                  const mine = m.sender_type === 'employee';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          mine
                            ? 'bg-brand-primary text-white rounded-br-md'
                            : 'bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 rounded-bl-md'
                        }`}
                      >
                        <p className="text-[10px] font-bold opacity-70 mb-1">
                          {mine ? 'Team' : 'Client'} ·{' '}
                          {m.timestamp ? formatDistanceToNow(new Date(m.timestamp), { addSuffix: true }) : ''}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        {m.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {m.attachments.map((a) => (
                              <a
                                key={a.url}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                                  mine ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                              >
                                <Paperclip className="w-3 h-3" />
                                {a.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {canActOnCase ? (
                <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] p-4 shrink-0 sticky bottom-0">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={compose}
                      onChange={(e) => setCompose(e.target.value)}
                      placeholder="Write a reply…"
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18181b] px-3 py-2 text-sm resize-none"
                    />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <label className="text-xs font-semibold text-gray-500 cursor-pointer">
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
                        />
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                          <Paperclip className="w-4 h-4" /> Attach
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!compose.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-40"
                      >
                        <Send className="w-4 h-4" /> Send
                      </button>
                    </div>
                    {files.length > 0 && (
                      <p className="text-xs text-gray-500">{files.map((f) => f.name).join(', ')}</p>
                    )}
                  </div>
                </footer>
              ) : (
                <footer className="border-t border-gray-200 dark:border-gray-800 p-4 text-center text-xs text-gray-500">
                  You can view this thread but only the assignee or an admin can reply.
                </footer>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
