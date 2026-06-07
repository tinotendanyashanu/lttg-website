'use client';

import { useState, useTransition } from 'react';
import { sendSupportDigestNow } from '@/lib/actions/support-center';

/**
 * Admin-only button to build and email the executive support digest to all
 * admins on demand. Same delivery path as the scheduled weekly cron.
 */
export default function SendDigestButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function send() {
    setMsg('');
    startTransition(async () => {
      try {
        const res = await sendSupportDigestNow(7);
        setMsg(res.sent ? `Sent to ${res.sent} admin${res.sent > 1 ? 's' : ''}` : 'No recipients');
        setTimeout(() => setMsg(''), 4000);
      } catch (e) {
        setMsg((e as Error).message || 'Failed to send');
        setTimeout(() => setMsg(''), 4000);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{msg}</span>}
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary border border-brand-primary/30 rounded-full px-3 py-1.5 hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
      >
        <span className={`material-icons-outlined text-[14px] ${pending ? 'animate-spin' : ''}`}>
          {pending ? 'autorenew' : 'mail'}
        </span>
        {pending ? 'Sending…' : 'Email digest now'}
      </button>
    </div>
  );
}
