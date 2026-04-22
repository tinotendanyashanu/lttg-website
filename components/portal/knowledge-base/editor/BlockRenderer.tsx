'use client';

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useMemo, useState, useEffect } from "react";

interface BlockRendererProps {
  content: string; // JSON string
}

export default function BlockRenderer({ content }: BlockRendererProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkCheckboxes = () => {
      const checkboxes = document.querySelectorAll('.block-renderer input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.hasAttribute('aria-label')) {
          cb.setAttribute('aria-label', 'Task checkbox');
        }
      });
    };

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkCheckboxes();

    // Observe changes to the class list of the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
      checkCheckboxes();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const blocks = useMemo(() => {
    if (!content) return undefined;
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback for old markdown content
      return [
        {
          type: "paragraph",
          content: content
        }
      ];
    }
  }, [content]);

  const editor = useCreateBlockNote({
    initialContent: blocks,
  });

  return (
    <div className="block-renderer w-full">
      <BlockNoteView 
        editor={editor} 
        editable={false}
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
}
