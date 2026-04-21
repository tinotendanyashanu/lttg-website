'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchKnowledgeBase } from '@/lib/actions/knowledge';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchOverlay({ isOpen, onClose, userRole }: { isOpen: boolean; onClose: () => void; userRole: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        const res = await searchKnowledgeBase(query, 'All', userRole);
        if (res.success) {
          setResults(res.articles);
        }
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, userRole]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      router.push(`/portal/knowledge-base/${results[selectedIndex].slug}`);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-4">
          <span className="material-icons-outlined text-gray-400">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles, policies, or resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-lg text-gray-900 dark:text-white"
          />
          <div className="flex items-center gap-1.5">
             <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-500 font-sans font-bold">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="p-8 text-center text-gray-500 text-sm italic">
                Searching knowledge base...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((article, index) => (
                <div
                  key={article._id}
                  onClick={() => {
                    router.push(`/portal/knowledge-base/${article.slug}`);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                    selectedIndex === index 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      article.type === 'resource' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                      article.type === 'policy' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    }`}>
                      <span className="material-icons-outlined">
                        {article.type === 'resource' ? 'folder_zip' : article.type === 'policy' ? 'gavel' : 'description'}
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${selectedIndex === index ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{article.category} • Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`material-icons-outlined text-sm transition-opacity ${selectedIndex === index ? 'opacity-100 text-blue-500' : 'opacity-0'}`}>
                    subdirectory_arrow_left
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && query.trim().length > 1 && results.length === 0 && (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <span className="material-icons-outlined text-3xl">sentiment_dissatisfied</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">No results for "{query}"</h4>
                <p className="text-sm text-gray-500">Try checking your spelling or using different keywords.</p>
            </div>
          )}

          {query.trim().length <= 1 && !loading && (
             <div className="p-8">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Popular Searches</h4>
                 <div className="flex flex-wrap gap-2 px-2">
                    {['Sales Pitch', 'Objection Handling', 'HR Policy', 'Onboarding'].map(term => (
                        <button 
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors"
                        >
                            {term}
                        </button>
                    ))}
                 </div>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
