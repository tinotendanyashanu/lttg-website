'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { handleSignOut } from '@/lib/actions/auth';
import AdminBreadcrumbs from './AdminBreadcrumbs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'partner' | 'deal' | 'risk';
  title: string;
  message: string;
  url: string;
  count: number;
}

interface AdminPanelHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
}

// ─── Notifications Dropdown ───────────────────────────────────────────────────

function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setNotifications(data.notifications || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalCount = notifications.reduce((acc, n) => acc + n.count, 0);

  const typeColor: Record<string, string> = {
    risk:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    deal:    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    partner: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const typeIcon: Record<string, string> = {
    risk: 'warning', deal: 'work', partner: 'handshake',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(p => !p)}
        className={`relative p-2 rounded-xl transition-colors ${
          isOpen
            ? 'bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-label="Notifications"
      >
        <span className="material-icons-outlined text-[20px]">notifications</span>
        {!loading && totalCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1E1E1E]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
            {totalCount > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount} new
              </span>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 flex justify-center">
                <span className="material-icons-outlined text-2xl text-gray-300 dark:text-gray-700 animate-spin">sync</span>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map(notif => (
                  <Link
                    href={notif.url}
                    key={notif.id}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColor[notif.type] || typeColor.partner}`}>
                        <span className="material-icons-outlined text-[16px]">{typeIcon[notif.type] || 'info'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary truncate">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <span className="material-icons-outlined text-3xl text-gray-300 dark:text-gray-700">notifications_paused</span>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">No pending actions required.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────

function AvatarDropdown({ user }: { user: AdminPanelHeaderProps['user'] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-bold text-sm shrink-0">
          {initial}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">
            {user?.name}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Administrator
          </p>
        </div>
        <span className="material-icons-outlined text-gray-400 text-[16px] hidden lg:block">
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50 py-1">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
          {/* Links */}
          <div className="p-1">
            <Link
              href="/portal/employee"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <span className="material-icons-outlined text-[18px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">grid_view</span>
              Switch to Portal
            </Link>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-icons-outlined text-[18px]">exit_to_app</span>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function AdminPanelHeader({
  user,
  isDarkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
  onOpenMobileMenu,
}: AdminPanelHeaderProps) {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between shrink-0 bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <span className="material-icons-outlined text-[22px]">menu</span>
        </button>
        <AdminBreadcrumbs />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Cmd+K search button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#27272a] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
        >
          <span className="material-icons-outlined text-[18px]">search</span>
          <span className="hidden lg:block text-sm">Search...</span>
          <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded ml-2 text-gray-400 dark:text-gray-600">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Avatar */}
        <AvatarDropdown user={user} />
      </div>
    </header>
  );
}
