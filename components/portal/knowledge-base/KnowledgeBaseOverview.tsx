'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IKnowledgeArticle } from '@/models/KnowledgeArticle';
import { searchKnowledgeBase } from '@/lib/actions/knowledge';
import KnowledgeSidebar from './KnowledgeSidebar';
import SearchOverlay from './SearchOverlay';
import { AnimatePresence } from 'framer-motion';

interface Props {
  initialArticles: IKnowledgeArticle[];
  categories: any[];
  userRole: string;
  activeCategoryId: string;
}

export default function KnowledgeBaseOverview({ 
  initialArticles = [], 
  categories = [], 
  userRole = 'employee',
  activeCategoryId = 'All'
}: Props) {
  const [articles, setArticles] = useState<IKnowledgeArticle[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
      async function fetchFiltered() {
        setIsLoading(true);
        const result = await searchKnowledgeBase('', activeCategoryId, userRole);
        if (result.success) {
            setArticles(result.articles);
        }
        setIsLoading(false);
      }
      
      // Don't re-fetch on mount if we already have initialArticles for this category
      if (activeCategoryId !== 'All' || articles.length === 0) {
        fetchFiltered();
      }
  }, [activeCategoryId, userRole]);

  const activeCategoryName = activeCategoryId === 'All' 
    ? 'All Articles' 
    : categories.find(c => c._id === activeCategoryId)?.name || 'General';

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
            <SearchOverlay 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                userRole={userRole} 
            />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <aside className="w-full md:w-64 xl:w-72 shrink-0">
        <div className="sticky top-6 bg-white dark:bg-[#27272a] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
           <KnowledgeSidebar categories={categories} activeCategoryId={activeCategoryId} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        {/* Top Header / Search Trigger */}
        <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex items-center justify-between gap-4">
            <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex-1 flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all text-left group"
            >
                <span className="material-icons-outlined text-gray-400 group-hover:text-blue-500 transition-colors">search</span>
                <span className="text-sm font-medium flex-1">Quick find...</span>
                <div className="hidden sm:flex items-center gap-1 opacity-50">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-sans font-bold">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-sans font-bold">K</kbd>
                </div>
            </button>
            
            {userRole === 'admin' && (
                <Link 
                    href="/portal/knowledge-base/create"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
                >
                    New Article
                </Link>
            )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCategoryName}</h1>
                <p className="text-xs text-gray-500">{articles.length} articles found</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white dark:bg-[#27272a] rounded-[2rem] animate-pulse border border-gray-100 dark:border-gray-800"></div>
                    ))}
                </div>
             ) : articles.length === 0 ? (
                <div className="p-16 text-center bg-white dark:bg-[#27272a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <span className="material-icons-outlined text-4xl">search_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No articles in this category</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Try searching for something specific or explore other categories.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 gap-4">
                    {articles.map((article: any) => (
                        <Link key={article._id} href={`/portal/knowledge-base/${article.slug}`} className="block group">
                            <div className="bg-white dark:bg-[#27272a] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-500 relative overflow-hidden">
                                {/* Type Indicator */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    article.type === 'policy' ? 'bg-red-500' :
                                    article.type === 'resource' ? 'bg-orange-500' :
                                    'bg-blue-500'
                                }`}></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            article.type === 'policy' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                            article.type === 'resource' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' :
                                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                        }`}>
                                            <span className="material-icons-outlined text-xl">
                                                {article.type === 'policy' ? 'gavel' :
                                                 article.type === 'resource' ? 'folder_zip' :
                                                 'description'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                                {article.category}
                                            </span>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mt-0.5">
                                                {article.title}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(article.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                {article.subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                                        {article.subtitle}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-50 dark:border-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                            <span className="material-icons-outlined text-sm text-gray-500">person</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {article.createdBy.split('@')[0]}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {article.viewCount > 0 && (
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <span className="material-icons-outlined text-sm">visibility</span>
                                                <span className="text-xs font-bold">{article.viewCount}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-blue-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            Read More
                                            <span className="material-icons-outlined text-sm">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
