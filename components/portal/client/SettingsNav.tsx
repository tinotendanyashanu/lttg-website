'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateClientProfile, updateClientPassword } from '@/lib/actions/client';
import Link from 'next/link';

const SETTINGS_NAV = [
  { href: '/portal/client/settings/profile', label: 'Profile', icon: 'person' },
  { href: '/portal/client/settings/company', label: 'Company', icon: 'business' },
  { href: '/portal/client/settings/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/portal/client/settings/billing', label: 'Billing', icon: 'credit_card' },
  { href: '/portal/client/security', label: 'Security', icon: 'security' },
];

export function SettingsNav({ current }: { current: string }) {
  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-2">
      <nav className="flex gap-1 overflow-x-auto">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              current === item.href
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="material-icons-outlined text-[16px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
