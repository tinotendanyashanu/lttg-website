'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IKnowledgeArticle } from '@/models/KnowledgeArticle';
import { searchKnowledgeBase } from '@/lib/actions/knowledge';

interface Props {
  initialArticles: IKnowledgeArticle[];
  userRole: string;
}

export default function KnowledgeBaseOverview({ initialArticles = [], userRole = 'employee' }: Props) {
  const [articles, setArticles] = useState<IKnowledgeArticle[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', 'Sales', 'Product / Services', 'Internal Process', 'HR / Policy', 'General'];

  useEffect(() => {
    // Only fetch if it's not the initial mount to avoid double-fetching
    // But we need to fetch when search query or category changes
    const delayDebounceFn = setTimeout(async () => {
      // Don't fetch if it's the exact same state as initial (optimization)
      if (searchQuery === '' && activeCategory === 'All' && articles.length === initialArticles.length) {
          return;
      }
      
      setIsLoading(true);
      const result = await searchKnowledgeBase(searchQuery, activeCategory, userRole);
      if (result.success) {
        setArticles(result.articles);
      }
      setIsLoading(false);
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory, userRole]);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Search and Action Bar */}
      <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-2xl">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-xl">
            search
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white"
            placeholder="Search for answers, objections, scripts..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {userRole === 'admin' && (
              <Link 
                href="/portal/knowledge-base/create"
                className="px-5 flex items-center h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap shrink-0"
              >
                  Upload Article
              </Link>
            )}
            <button className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="material-icons-outlined">notifications</span>
            </button>
             <div className="h-12 w-12 shrink-0 rounded-2xl bg-center bg-cover border-2 border-white dark:border-gray-700 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-DCmJvMsrabV5pV1Ai6ueYGxFRkP-NCcloCzzLmchCaa7LRXZVCnkZ5F3nEVuqdkUwWtH6ELRM9dRKLDfCmHU5PBRq25s3RgWBuGjPk0hK_buXxntwIhiDvdAkgijcN3aHhGsj0QT2YzDJP2qO_8hSDAA99uD9Ha6xx5spEW9J7QYxJXKmsKKplL8QPM0iWsY93jBs3nA4Kqbc_H6YE4NRsdMuQ3HfurU1sCCHRIxo2JHan48AvexdyrI_oqhX7B8VMpPsMkQ3k")' }}></div>
        </div>
      </div>

       {/* Categories Filter */}
       <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-[#27272a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest">
            <span>Home</span>
            <span className="material-icons-outlined !text-[12px]">chevron_right</span>
            <span className="text-blue-500">{activeCategory}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {isLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading articles...</div>
             ) : articles.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No articles found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or category filter.</p>
                </div>
             ) : (
                articles.map((article: any) => (
                    <Link key={article._id} href={`/portal/knowledge-base/${article.slug}`} className="block outline-none">
                    <div className="bg-white dark:bg-[#27272a] rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 group cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                article.type === 'policy' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900' 
                                : article.type === 'resource'
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900'
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900'
                            }`}>
                            {article.category} {article.type !== 'article' && `• ${article.type}`}
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                            Updated {new Date(article.updatedAt).toLocaleDateString()}
                        </span>
                        </div>
                        
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                        </h2>
                        
                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                             <div className="flex flex-wrap gap-2 mb-6">
                                {article.tags.map((tag: string) => (
                                    <span key={tag} className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                        #{tag}
                                    </span>
                                ))}
                             </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                                <span className="material-icons-outlined text-gray-500 dark:text-gray-400">person</span>
                            </div>
                            <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{article.createdBy.split('@')[0]}</p>
                            <p className="text-[11px] text-gray-400 mt-1">Author</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <span className="material-icons-outlined text-lg!">visibility</span>
                                <span className="text-xs font-bold">{article.viewCount || 0}</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Link>
                ))
             )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 flex shrink-0 flex-col gap-6">
          
          <section className="bg-white dark:bg-[#27272a] rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white">Popular Policies</h3>
            </div>
            
            <div className="space-y-4">
              <Link href="/portal/knowledge-base/commission-policy" className="block outline-none">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-blue-600 dark:text-blue-400 fill">gavel</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Commission Policy
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">HR / Policy</p>
                  </div>
                </div>
              </Link>

              <Link href="/portal/knowledge-base/onboarding" className="block outline-none">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-purple-600 dark:text-purple-400 fill">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Onboarding Guide
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Internal Process</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          <section className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#sales', '#objection', '#pricing', '#onboarding'].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex-1 bg-linear-to-b from-white to-gray-50/50 dark:from-[#27272a] dark:to-gray-900/30 flex flex-col items-center xl:items-stretch text-center xl:text-left">
            <div className="flex items-center gap-2 mb-6 justify-center xl:justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-blue-600 dark:text-blue-400 !text-lg">auto_awesome</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Need Help?</h3>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Can't find what you're looking for? If it's not in the Knowledge Base, reach out to your team lead or admin.
            </p>
            
            <div className="p-4 mt-auto w-full">
                <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    Request an Article
                </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
