import React from 'react';
import Link from 'next/link';
import { getArticleBySlug } from '@/lib/actions/knowledge';
import { getAccountByEmail } from '@/lib/data/account';
import { getSession } from '@/lib/auth-util';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/portal/knowledge-base/MarkdownRenderer';

export default async function ArticleDetailedView({ params }: { params: { articleId: string } }) {
  const session = await getSession();
  
  let userRole = 'employee';
  let userEmail = '';
  if (session?.user?.email) {
    userEmail = session.user.email;
    const account = await getAccountByEmail(session.user.email);
    if (account && account.roles && account.roles.length > 0) {
      userRole = account.roles[0]; // Assuming roles is an array
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
    <div className="bg-neutral-50 dark:bg-neutral-950 text-slate-800 dark:text-slate-200 min-h-screen flex flex-col md:flex-row p-6 gap-6">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 flex shrink-0 flex-col gap-6 md:h-[calc(100vh-3rem)] md:sticky md:top-6">
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-black dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white">
              <span className="material-icons-outlined text-xl">bolt</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">LeoTech</span>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Link href="/portal" className="flex items-center gap-4 p-3 rounded-2xl text-slate-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all group">
               <span className="material-icons-outlined text-xl">dashboard</span>
               <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/portal/knowledge-base" className="flex items-center gap-4 p-3 rounded-2xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white group border border-gray-200 dark:border-neutral-700">
              <span className="material-icons-outlined text-xl">menu_book</span>
              <span className="font-medium">Knowledge Base</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
             <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                  {userEmail?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userEmail.split('@')[0]}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 truncate">{userRole}</p>
                </div>
              </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 overflow-hidden max-w-5xl mx-auto w-full">
        <header className="bg-white dark:bg-[#27272a] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-4 flex-1">
            <Link href="/portal/knowledge-base" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-2">
              <span className="material-icons-outlined !text-[18px]">arrow_back</span>
              Back to Knowledge Base
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {article.type}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {article.category}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-gray-500 dark:text-gray-400 text-sm">person</span>
                 </div>
                <div>
                  <p className="text-xs text-slate-400">Author</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{article.createdBy.split('@')[0]}</p>
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(article.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="text-xs text-slate-400">Visibility</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{article.roleVisibility.join(', ')}</p>
              </div>
            </div>
            
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    {article.tags.map((tag: string) => (
                        <span key={tag} className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            {article.type === 'resource' && (
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-2xl font-medium text-sm hover:bg-green-700 transition-all shadow-md shadow-green-500/20">
                    <span className="material-icons-outlined text-lg">download</span>
                    Download File
                </button>
            )}
            
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-neutral-800 rounded-2xl font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all border border-gray-200 dark:border-gray-700">
              <span className="material-icons-outlined text-lg">share</span>
              Share
            </button>
            {isAdminOrAuthor && (
              <Link href={`/portal/knowledge-base/${article.slug}/edit`} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-medium text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                <span className="material-icons-outlined text-lg">edit</span>
                Edit
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none">
          {article.type === 'resource' ? (
              <div className="bg-white dark:bg-[#27272a] p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6">
                      <span className="material-icons-outlined text-4xl">folder_zip</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Resource File Ready</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                      This knowledge base entry is a downloadable resource. You can download the associated files using the button above.
                  </p>
                  
                  {article.content && (
                     <div className="w-full text-left mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                         <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Description / Setup Instructions</h4>
                         <article className="prose prose-slate dark:prose-invert max-w-none">
                             <MarkdownRenderer content={article.content} />
                         </article>
                     </div>
                  )}
              </div>
          ) : (
             <article className="bg-white dark:bg-[#27272a] p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 w-full overflow-hidden">
                <MarkdownRenderer content={article.content} />
             </article>
          )}
        </div>
      </main>

      {/* Right Sidebar - Analytics & Info */}
      <aside className="w-full xl:w-80 hidden md:flex shrink-0 flex-col gap-6 md:h-[calc(100vh-3rem)] md:sticky md:top-6">
        
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Article Information</h4>
          
          <div className="space-y-4">
              <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${article.isPublished ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                       <span className="font-semibold text-sm capitalize">{article.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
              </div>
              
              <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Views</p>
                  <div className="flex items-center gap-2">
                       <span className="material-icons-outlined text-gray-400 text-sm">visibility</span>
                       <span className="font-bold text-sm">{article.viewCount || 0}</span>
                  </div>
              </div>

              {article.lastReviewedAt && (
                   <div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Reviewed</p>
                       <div className="flex items-center gap-2">
                            <span className="material-icons-outlined text-gray-400 text-sm">fact_check</span>
                            <span className="font-semibold text-sm">{new Date(article.lastReviewedAt).toLocaleDateString()}</span>
                       </div>
                   </div>
              )}
          </div>
        </div>

        <div className="bg-neutral-900 dark:bg-black p-6 rounded-3xl shadow-lg border border-neutral-800 text-white mt-auto">
          <h4 className="font-bold mb-2">Was this helpful?</h4>
          <p className="text-sm text-gray-400 mb-4">Help us improve our documentation by providing feedback.</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <span className="material-icons-outlined text-lg">thumb_up</span>
              Yes
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <span className="material-icons-outlined text-lg">thumb_down</span>
              No
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
