'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notification {
  _id: string;
  actionType: string;
  newValue?: string;
  previousValue?: string;
  actor?: string;
  createdAt: string;
  caseId?: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  case_created:        { label: 'New case opened',           icon: 'folder_open',    color: 'text-blue-500' },
  case_closed:         { label: 'Case closed',               icon: 'check_circle',   color: 'text-green-500' },
  status_changed:      { label: 'Case status changed',       icon: 'sync_alt',       color: 'text-amber-500' },
  invoice_created:     { label: 'Invoice created',           icon: 'receipt_long',   color: 'text-purple-500' },
  payment_received:    { label: 'Payment received',          icon: 'payments',       color: 'text-green-500' },
  client_created:      { label: 'New client added',          icon: 'person_add',     color: 'text-blue-500' },
  client_updated:      { label: 'Client updated',            icon: 'manage_accounts', color: 'text-gray-500' },
  commission_paid:     { label: 'Commission paid',           icon: 'monetization_on', color: 'text-teal-500' },
  password_reset_by_admin: { label: 'Password reset sent',  icon: 'lock_reset',     color: 'text-orange-500' },
  staff_assigned:      { label: 'Staff assigned to case',   icon: 'person_pin',     color: 'text-sky-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SEEN_KEY = 'admin_notif_seen_at';

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [seenAt, setSeenAt] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(SEEN_KEY) || '0', 10);
    setSeenAt(stored);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/activity-feed')
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter(n => new Date(n.createdAt).getTime() > seenAt).length;

  function handleOpen() {
    setOpen(v => !v);
    if (!open) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setSeenAt(now);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Activity notifications"
      >
        <span className="material-icons-outlined text-[22px]">notifications</span>
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1e1e21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Recent Activity</h3>
            <Link
              href="/portal/employee/admin/activity"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">No recent activity.</div>
            ) : notifications.map(n => {
              const cfg = ACTION_LABELS[n.actionType] || { label: n.actionType, icon: 'info', color: 'text-gray-400' };
              const isNew = new Date(n.createdAt).getTime() > seenAt;

              return (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${isNew ? 'bg-brand-primary/5 dark:bg-brand-primary/5' : ''}`}
                >
                  <span className={`material-icons-outlined text-[18px] mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{cfg.label}</p>
                    {n.newValue && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{n.newValue}</p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {isNew && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
