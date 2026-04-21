'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    try {
      const blocks = JSON.parse(content);
      const headings = blocks
        .filter((b: any) => b.type === 'heading')
        .map((b: any) => ({
          id: b.id,
          text: b.content?.[0]?.text || 'Untitled Heading',
          level: b.props?.level || 1
        }));
      setItems(headings);
    } catch (e) {
      setItems([]);
    }
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0% -80% 0%' }
    );

    // This is tricky because BlockNote IDs might not match immediately
    // or be rendered as actual IDs. We'll look for [data-id] or similar if needed.
    // For now, we assume simple mapping or we'll enhance the renderer.
    
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">On this page</h4>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const el = document.querySelector(`[data-id="${item.id}"]`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`block text-left text-xs transition-all hover:text-blue-500 ${
              activeId === item.id 
                ? 'text-blue-600 font-bold border-l-2 border-blue-600 pl-3' 
                : 'text-gray-500 pl-3 border-l border-gray-100 dark:border-neutral-800'
            }`}
            style={{ marginLeft: `${(item.level - 1) * 8}px` }}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
