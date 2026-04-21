import React from 'react';
import Link from 'next/link';
import { getArticleBySlug } from '@/lib/actions/knowledge';
import { getAccountByEmail } from '@/lib/data/account';
import { getSession } from '@/lib/auth-util';
import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/portal/knowledge-base/editor/BlockRenderer';
import TableOfContents from '@/components/portal/knowledge-base/TableOfContents';
import FeedbackWidget from '@/components/portal/knowledge-base/FeedbackWidget';

export default async function ArticleDetailedView({ params }: { params: { articleId: string } }) {
  const session = await getSession();
  
  let userRole = 'employee';
  let userEmail = '';
  if (session?.user?.email) {
    userEmail = session.user.email;
    const account = await getAccountByEmail(session.user.email);
    if (account && account.roles && account.roles.length > 0) {
      userRole = account.roles.includes('admin') ? 'admin' : (account.roles.includes('intern') ? 'intern' : 'employee');
    }
  }

  // Fetch article
  const articleResponse = await getArticleBySlug(params.articleId, userRole);
  
  if (!articleResponse.success || !articleResponse.article) {
    notFound();
  }

  const article = articleResponse.article;
  const isAuthor = article.createdBy === userEmail;
  const isAdminOrAuthor = userRole === 'admin' || isAuthor;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      
      {/* Top Breadcrumbs / Navigation */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="/portal/knowledge-base" className="hover:text-blue-500 transition-colors">Knowledge Base</Link>
            <span className="material-icons-outlined !text-[12px]">chevron_right</span>
            <span className="text-gray-900 dark:text-white">{article.categoryId?.name || article.category}</span>
        </div>
        <div className="flex gap-2">
            {isAdminOrAuthor && (
              <Link 
                href={`/portal/knowledge-base/${article.slug}/edit`} 
                className="px-4 py-2 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <span className="material-icons-outlined text-sm">edit</span>
                Edit Article
              </Link>
            )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-10 px-6 pb-24">
        
        {/* Main Content (Middle) */}
        <main className="flex-1 max-w-4xl mx-auto w-full space-y-8">
            <header className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        article.type === 'policy' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20' :
                        article.type === 'resource' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20' :
                        'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20'
                    }`}>
                        {article.type}
                    </div>
                    {article.status !== 'published' && (
                        <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 capitalize">
                            {article.status}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    {article.title}
                    </h1>
                    {article.subtitle && (
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {article.subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-6 pt-4 border-b border-gray-100 dark:border-neutral-900 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-2 border-white dark:border-neutral-800 shadow-sm">
                            <span className="material-icons-outlined text-gray-500 text-sm">person</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Written by</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{article.createdBy.split('@')[0]}</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-100 dark:bg-neutral-900"></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Updated</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(article.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100 dark:bg-neutral-900"></div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="material-icons-outlined text-sm">visibility</span>
                        <span className="text-xs font-bold">{article.viewCount || 0}</span>
                    </div>
                </div>
            </header>

            <article className="prose prose-slate dark:prose-invert max-w-none">
                <BlockRenderer content={article.content} />
            </article>

            {/* Related Articles Grid */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-100 dark:border-neutral-900 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-icons-outlined text-purple-500">share</span>
                        Related Articles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {article.relatedArticles.map((rel: any) => (
                            <Link 
                                key={rel._id}
                                href={`/portal/knowledge-base/${rel.slug}`}
                                className="p-4 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-neutral-800 rounded-2xl hover:border-purple-500 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                                        <span className="material-icons-outlined">description</span>
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-purple-600">{rel.title}</h4>
                                        <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{rel.type || 'Article'}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Attachments Section */}
            {article.attachments && article.attachments.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-100 dark:border-neutral-900 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-icons-outlined text-blue-500">attach_file</span>
                        Resources & Attachments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {article.attachments.map((file: any, i: number) => (
                            <a 
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-neutral-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                    <span className="material-icons-outlined">link</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-500">{file.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Google Drive Link</p>
                                </div>
                                <span className="material-icons-outlined text-gray-300 group-hover:text-blue-500 transition-colors">open_in_new</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </main>

        {/* Right Sidebar - TOC & Feedback */}
        <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-24 space-y-10">
                <TableOfContents content={article.content} />

                {/* Backlinks Widget */}
                {article.backlinks && article.backlinks.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Backlinks</h4>
                        <div className="space-y-2">
                            {article.backlinks.map((link: any) => (
                                <Link 
                                    key={link._id}
                                    href={`/portal/knowledge-base/${link.slug}`}
                                    className="block p-3 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-neutral-800 rounded-xl hover:border-blue-500 transition-all group"
                                >
                                    <h5 className="text-[11px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 truncate">{link.title}</h5>
                                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">{link.type || 'Reference'}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <FeedbackWidget articleId={article._id} userEmail={userEmail} />

                <div className="px-6">
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        Last updated on {new Date(article.updatedAt).toLocaleDateString()} by {article.createdBy.split('@')[0]}. 
                        Version {article.version}.
                    </p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
