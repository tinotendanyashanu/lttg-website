import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const resources = [
    {
      title: 'Open a Support Ticket',
      desc: 'Can\'t find the answer? Submit a ticket and get a response from our team within 24 hours.',
      href: '/portal/client/tickets/create',
      icon: 'support_agent',
      cta: 'Create Ticket',
    },
    {
      title: 'Send a Message',
      desc: 'For urgent case-related matters, message our team directly from your case page.',
      href: '/portal/client/messages',
      icon: 'chat',
      cta: 'Open Messages',
    },
    {
      title: 'Knowledge Base',
      desc: 'Browse guides and FAQ articles about using your client portal.',
      href: '/portal/client/knowledgebase',
      icon: 'menu_book',
      cta: 'Browse Articles',
    },
  ];

  const faqs = [
    {
      q: 'How long does it take to respond to a support ticket?',
      a: 'We aim to respond to all tickets within 24 hours during business days. Urgent tickets are prioritized.',
    },
    {
      q: 'How do I check my case status?',
      a: 'Navigate to My Cases in the sidebar. Each case shows its current status with a progress indicator.',
    },
    {
      q: 'Can I upload evidence after my case has started?',
      a: 'Yes. You can upload evidence at any time from the Evidence Locker or directly from each case page.',
    },
    {
      q: 'How do I pay an invoice?',
      a: 'Contact our team via Messages to arrange payment. We\'ll provide payment instructions directly.',
    },
    {
      q: 'What file types can I upload as evidence?',
      a: 'We accept images, documents (PDF, Word), videos, ZIP archives, and external URLs. Max 50MB per file.',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Contact options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resources.map((r) => (
          <div
            key={r.title}
            className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="material-icons-outlined text-gray-600 dark:text-gray-300">{r.icon}</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{r.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{r.desc}</p>
            <Link
              href={r.href}
              className="mt-4 inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              {r.cta}
              <span className="material-icons-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5"
            >
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-start gap-2">
                <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[16px] mt-0.5 shrink-0">
                  quiz
                </span>
                {faq.q}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
