'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parent?: string | null;
}

interface KnowledgeSidebarProps {
  categories: Category[];
  activeCategoryId?: string;
}

export default function KnowledgeSidebar({ categories, activeCategoryId }: KnowledgeSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree structure
  const rootCategories = categories.filter(c => !c.parent);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent === parentId);

  const renderCategory = (category: Category, level: number = 0) => {
    const subs = getSubcategories(category._id);
    const hasSubs = subs.length > 0;
    const isExpanded = expanded[category._id];
    const isActive = activeCategoryId === category._id || pathname.includes(category.slug);

    return (
      <div key={category._id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all group cursor-pointer ${
            isActive 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
              : 'hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400'
          }`}
          style={{ paddingLeft: `${(level * 12) + 12}px` }}
        >
          {hasSubs && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                toggleExpand(category._id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-colors"
            >
              <span className={`material-icons-outlined text-sm transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                chevron_right
              </span>
            </button>
          )}
          {!hasSubs && <span className="w-4"></span>}
          
          <span className="material-icons-outlined text-[18px]">
            {category.icon || 'folder'}
          </span>
          <Link href={`/portal/knowledge-base?category=${category._id}`} className="flex-1 truncate text-sm">
            {category.name}
          </Link>
        </div>

        {hasSubs && isExpanded && (
          <div className="space-y-1">
            {subs.map(sub => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Explore</h3>
        <nav className="space-y-1">
          <Link 
            href="/portal/knowledge-base" 
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              !activeCategoryId && pathname === '/portal/knowledge-base'
                ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="material-icons-outlined text-[18px]">grid_view</span>
            <span className="text-sm">All Articles</span>
          </Link>
          <Link 
            href="/portal/knowledge-base/favorites" 
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
          >
            <span className="material-icons-outlined text-[18px]">star_border</span>
            <span className="text-sm">Favorites</span>
          </Link>
        </nav>
      </div>

      <div>
        <div className="flex items-center justify-between px-3 mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Categories</h3>
          <button className="text-gray-400 hover:text-blue-500 transition-colors">
            <span className="material-icons-outlined text-sm">add</span>
          </button>
        </div>
        <nav className="space-y-1">
          {rootCategories.map(cat => renderCategory(cat))}
          {rootCategories.length === 0 && (
            <p className="px-3 text-xs text-gray-400 italic">No categories found</p>
          )}
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <p className="text-xs font-bold opacity-80 mb-1 uppercase tracking-wider">Quick Tip</p>
            <p className="text-[11px] leading-relaxed">
              Use <kbd className="bg-white/20 px-1 rounded font-sans font-bold">CMD + K</kbd> to search everything instantly.
            </p>
         </div>
      </div>
    </div>
  );
}
