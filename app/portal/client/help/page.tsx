import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HelpPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Help Center</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Welcome to LeoTech client support. Use the resources below to find answers or get in touch
          with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: '/portal/client/knowledgebase',
            icon: 'menu_book',
            title: 'Knowledge Base',
            desc: 'Browse articles and guides about using your portal.',
          },
          {
            href: '/portal/client/tickets/create',
            icon: 'support_agent',
            title: 'Submit a Ticket',
            desc: 'Open a support request and we\'ll respond within 24 hours.',
          },
          {
            href: '/portal/client/messages',
            icon: 'chat',
            title: 'Direct Messages',
            desc: 'Message your assigned team for case-related questions.',
          },
          {
            href: '/portal/client/onboarding',
            icon: 'rocket_launch',
            title: 'Getting Started',
            desc: 'New here? Follow our step-by-step onboarding guide.',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 flex items-start gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <span className="material-icons-outlined text-gray-600 dark:text-gray-300">{item.icon}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Still need help?
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          If you're experiencing an urgent issue or need immediate assistance with your case, please
          reach out via direct messages or submit a high-priority support ticket.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href="/portal/client/messages"
            className="inline-flex items-center gap-1.5 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            <span className="material-icons-outlined text-[14px]">chat</span>
            Message Team
          </Link>
          <Link
            href="/portal/client/tickets/create"
            className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons-outlined text-[14px]">support_agent</span>
            Create Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
