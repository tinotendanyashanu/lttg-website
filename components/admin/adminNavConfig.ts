export interface NavItem {
  name: string;
  href: string;
  icon: string;
  exact?: boolean;
}

export interface NavSection {
  id: string;
  label: string | null;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: null,
    items: [
      { name: 'Overview',        href: '/admin',                 icon: 'dashboard',    exact: true },
      { name: 'Command Center',  href: '/admin/command-center',  icon: 'rocket_launch' },
      { name: 'Mail',            href: '/dashboard/mail',        icon: 'mail' },
      { name: 'Analytics',       href: '/admin/analytics',       icon: 'bar_chart' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    items: [
      { name: 'Clients',   href: '/admin/clients',   icon: 'business' },
      { name: 'Cases',     href: '/admin/cases',     icon: 'folder_shared' },
      { name: 'Contracts', href: '/admin/contracts', icon: 'description' },
      { name: 'Quotations', href: '/admin/quotations', icon: 'request_quote' },
      { name: 'Invoices',  href: '/admin/invoices',  icon: 'receipt_long' },
      { name: 'Messages',  href: '/admin/messages',  icon: 'chat' },
      { name: 'Chat Inbox',  href: '/admin/chat',          icon: 'chat_bubble' },
      { name: 'AI Insights', href: '/admin/chat/insights', icon: 'psychology' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      { name: 'Tickets',           href: '/admin/tickets',           icon: 'support_agent' },
      { name: 'SLA Monitor',       href: '/admin/support/sla',       icon: 'timer' },
      { name: 'Customer Health',   href: '/admin/support/health',    icon: 'favorite' },
      { name: 'AI Insights',       href: '/admin/support/insights',  icon: 'auto_awesome' },
      { name: 'Support Analytics', href: '/admin/support/analytics', icon: 'insights' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    items: [
      { name: 'Employees',   href: '/admin/users',       icon: 'manage_accounts' },
      { name: 'Teams',       href: '/admin/teams',       icon: 'groups' },
      { name: 'Commissions', href: '/admin/commissions', icon: 'monetization_on' },
    ],
  },
  {
    id: 'partners',
    label: 'Partners',
    items: [
      { name: 'Partners', href: '/admin/partners', icon: 'handshake' },
      { name: 'Deals',    href: '/admin/deals',    icon: 'work' },
      { name: 'Payouts',  href: '/admin/payouts',  icon: 'payments' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { name: 'Knowledge Base', href: '/admin/knowledge',     icon: 'menu_book' },
      { name: 'AI & Knowledge', href: '/admin/ai-knowledge',  icon: 'neurology' },
      { name: 'Academy',        href: '/admin/academy',       icon: 'school' },
      { name: 'Resources',      href: '/portal/employee/resources', icon: 'folder_zip' },
      { name: 'Announcements',  href: '/admin/announcements', icon: 'campaign' },
      { name: 'Testimonials',   href: '/admin/testimonials',  icon: 'reviews' },
      { name: 'Contacts',       href: '/admin/contacts',      icon: 'message' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { name: 'Activity Log', href: '/admin/activity',            icon: 'history' },
      { name: 'Audit Trail',  href: '/admin/audit',               icon: 'security' },
      { name: 'Playbook',     href: '/admin/commercial-playbook', icon: 'auto_stories' },
    ],
  },
];
