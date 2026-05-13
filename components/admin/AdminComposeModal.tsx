'use client';

import { useState, useTransition } from 'react';
import ClientCombobox from '@/components/ClientCombobox';
import { adminCreateThread } from '@/lib/actions/admin-messages';
import { useRouter } from 'next/navigation';

interface Client {
  _id: string;
  fullName: string;
  email: string;
}

interface Props {
  clients: Client[];
}

export default function AdminComposeModal({ clients }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [clientId, setClientId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notify, setNotify] = useState(true);

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setClientId('');
    setSubject('');
    setMessage('');
    setNotify(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return setError('Please select a client.');
    if (!subject.trim()) return setError('Subject is required.');
    if (!message.trim()) return setError('Message cannot be empty.');

    startTransition(async () => {
      try {
        const result = await adminCreateThread(clientId, subject, message, notify);
        if (result.success) {
          setSuccess('Message thread created and client notified.');
          setTimeout(() => {
            handleClose();
            router.push(`/admin/messages/${result.threadId}`);
          }, 1500);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to send message.');
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity shadow-sm"
      >
        <span className="material-icons-outlined text-[18px]">edit</span>
        New Message
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-[18px]">chat</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">New Message Thread</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors">
                <span className="material-icons-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Client *</label>
                <ClientCombobox clients={clients} value={clientId} onChange={setClientId} placeholder="Select a client..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Message subject…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  placeholder="Write your message to the client…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-primary"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Send email notification to client</span>
              </label>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span className="material-icons-outlined text-[16px]">check_circle</span>
                  {success}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-opacity shadow-sm"
                >
                  {isPending ? (
                    <><span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>Sending…</>
                  ) : (
                    <><span className="material-icons-outlined text-[16px]">send</span>Send Message</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
