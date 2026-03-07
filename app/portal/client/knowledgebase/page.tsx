import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'getting_started', label: 'Getting Started', icon: 'rocket_launch' },
  { key: 'case_management', label: 'Case Management', icon: 'folder_shared' },
  { key: 'evidence', label: 'Evidence Locker', icon: 'lock' },
  { key: 'billing', label: 'Billing & Payments', icon: 'payments' },
  { key: 'security', label: 'Security & Privacy', icon: 'security' },
  { key: 'faq', label: 'FAQ', icon: 'quiz' },
];

async function getArticles(_clientId: string) {
  // Returns empty array — articles served from built-in list.
  // Extend this function when a KnowledgeBase model is available.
  return [];
}

const BUILT_IN_ARTICLES = [
  {
    id: 'getting-started',
    title: 'Getting Started with Your Client Portal',
    category: 'getting_started',
    excerpt: 'Learn how to navigate your portal, track your cases, and communicate with our team.',
    readTime: '3 min',
  },
  {
    id: 'case-tracking',
    title: 'How to Track Your Case Progress',
    category: 'case_management',
    excerpt: 'Understand the case status system, how to view timeline events, and what each status means.',
    readTime: '4 min',
  },
  {
    id: 'upload-evidence',
    title: 'Uploading Evidence to Your Case',
    category: 'evidence',
    excerpt: 'Step-by-step guide to uploading screenshots, documents, videos, and links as evidence.',
    readTime: '2 min',
  },
  {
    id: 'billing-payments',
    title: 'Understanding Your Invoices & Payments',
    category: 'billing',
    excerpt: 'How to read your invoices, what payment methods we accept, and how to contact us about billing.',
    readTime: '3 min',
  },
  {
    id: 'account-security',
    title: 'Keeping Your Account Secure',
    category: 'security',
    excerpt: 'Best practices for keeping your account secure, including password hygiene and session management.',
    readTime: '3 min',
  },
];

export default async function KnowledgebasePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const dbArticles = await getArticles(session.user.id);

  let articles = dbArticles.length > 0 ? dbArticles : BUILT_IN_ARTICLES;
  if (category) articles = articles.filter((a: any) => a.category === category);
  if (q) {
    const lower = q.toLowerCase();
    articles = articles.filter(
      (a: any) =>
        a.title.toLowerCase().includes(lower) ||
        (a.excerpt || a.summary || '').toLowerCase().includes(lower)
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-xl text-sm font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/portal/client/knowledgebase"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            href={`/portal/client/knowledgebase?category=${cat.key}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.key
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span className="material-icons-outlined text-[14px]">{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 py-20 text-center">
          <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
            menu_book
          </span>
          <p className="text-gray-500 dark:text-gray-400">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article: any) => {
            const cat = CATEGORIES.find((c) => c.key === article.category);
            return (
              <div
                key={article._id || article.id}
                className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5 flex flex-col"
              >
                {cat && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <span className="material-icons-outlined text-[14px]">{cat.icon}</span>
                    {cat.label}
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {article.excerpt || article.summary}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                  {article.readTime && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="material-icons-outlined text-[12px]">schedule</span>
                      {article.readTime} read
                    </span>
                  )}
                  <Link
                    href={`/portal/client/support?article=${article._id || article.id}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium ml-auto"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Can't find what you need?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Open a support ticket and our team will help you.
          </p>
        </div>
        <Link
          href="/portal/client/tickets/create"
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors shrink-0"
        >
          <span className="material-icons-outlined text-[14px]">support_agent</span>
          Get Help
        </Link>
      </div>
    </div>
  );
}
