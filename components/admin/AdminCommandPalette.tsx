'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_SECTIONS, NavItem } from './adminNavConfig';

interface SearchResult {
  id: string;
  type: 'client' | 'case' | 'invoice' | 'partner' | 'deal' | 'payout';
  title: string;
  subtitle: string;
  url: string;
}

interface Props {
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  client:  { icon: 'person',        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  case:    { icon: 'folder_open',   color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  invoice: { icon: 'receipt_long',  color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  partner: { icon: 'handshake',     color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  deal:    { icon: 'work',          color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  payout:  { icon: 'payments',      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

// Flatten all nav items for keyboard navigation
const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(s => s.items);

export default function AdminCommandPalette({ onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSelectedIndex(0);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  // The active list — nav items when no query, search results when queried
  const isSearchMode = query.trim().length >= 2;
  const activeCount = isSearchMode ? searchResults.length : ALL_NAV_ITEMS.length;

  // Keep selectedIndex in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, activeCount - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isSearchMode && searchResults[selectedIndex]) {
          navigate(searchResults[selectedIndex].url);
        } else if (!isSearchMode && ALL_NAV_ITEMS[selectedIndex]) {
          navigate(ALL_NAV_ITEMS[selectedIndex].href);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSearchMode, searchResults, selectedIndex, activeCount, navigate]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl shadow-black/20 overflow-hidden">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <span className="material-icons-outlined text-[20px] text-gray-400 shrink-0">
            {isSearching ? 'sync' : 'search'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons-outlined text-[16px]">close</span>
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 px-1.5 py-1 rounded-md shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">

          {/* Search mode */}
          {isSearchMode && (
            <>
              {isSearching && searchResults.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Searching...
                </div>
              )}
              {!isSearching && searchResults.length === 0 && (
                <div className="py-8 text-center">
                  <span className="material-icons-outlined text-3xl text-gray-300 dark:text-gray-700">search_off</span>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}
              {searchResults.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    Results
                  </p>
                  {searchResults.map((result, i) => {
                    const cfg = TYPE_CONFIG[result.type] ?? TYPE_CONFIG['partner'];
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        data-index={i}
                        onClick={() => navigate(result.url)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          selectedIndex === i
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <span className="material-icons-outlined text-[16px]">{cfg.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          result.type === 'client'  ? 'text-blue-500'    :
                          result.type === 'case'    ? 'text-sky-500'     :
                          result.type === 'invoice' ? 'text-amber-500'   :
                          result.type === 'partner' ? 'text-purple-500'  :
                          result.type === 'deal'    ? 'text-indigo-500'  :
                          'text-emerald-500'
                        }`}>
                          {result.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Quick navigation (empty query) */}
          {!isSearchMode && (
            <>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                Quick Navigation
              </p>
              {NAV_SECTIONS.map(section => (
                <div key={section.id}>
                  {section.label && (
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-300 dark:text-gray-700">
                      {section.label}
                    </p>
                  )}
                  {section.items.map(item => {
                    const flatIndex = ALL_NAV_ITEMS.indexOf(item);
                    return (
                      <button
                        key={item.href}
                        data-index={flatIndex}
                        onClick={() => navigate(item.href)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          selectedIndex === flatIndex
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <span className="material-icons-outlined text-[16px] text-gray-500 dark:text-gray-400">{item.icon}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                        <span className="material-icons-outlined text-[16px] text-gray-300 dark:text-gray-700 ml-auto">chevron_right</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1E1E1E]/50">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600">
            <kbd className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600">
            <kbd className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600">
            <kbd className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
