'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  clients: 'Clients',
  cases: 'Cases',
  users: 'Employees',
  teams: 'Teams',
  commissions: 'Commissions',
  partners: 'Partners',
  deals: 'Deals',
  payouts: 'Payouts',
  knowledge: 'Knowledge Base',
  academy: 'Academy',
  announcements: 'Announcements',
  contacts: 'Contacts',
  activity: 'Activity Log',
  audit: 'Audit Trail',
  'commercial-playbook': 'Playbook',
};

function toLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: toLabel(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && (
            <span className="material-icons-outlined text-[14px] text-gray-300 dark:text-gray-700 select-none">
              chevron_right
            </span>
          )}
          {i < crumbs.length - 1 ? (
            <Link
              href={crumb.href}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
