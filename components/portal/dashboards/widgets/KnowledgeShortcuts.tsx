import React from 'react';
import Link from 'next/link';

interface KnowledgeShortcutsProps {
  articles: Array<{
    id: string;
    title: string;
    category: string;
    slug: string;
  }>;
}

export default function KnowledgeShortcuts({ articles }: KnowledgeShortcutsProps) {
  return (
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">auto_stories</span>
          Knowledge Base
        </h2>
        <Link href="/portal/employee/knowledge-base" className="text-brand-primary text-sm font-semibold hover:underline">
          View all
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No articles available.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <Link 
              key={article.id}
              href={`/portal/employee/knowledge-base/${article.slug}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-[20px]">article</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate group-hover:text-brand-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                  {article.category}
                </p>
              </div>
              <span className="material-icons-outlined text-gray-400 group-hover:text-brand-primary transition-colors shrink-0">chevron_right</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
