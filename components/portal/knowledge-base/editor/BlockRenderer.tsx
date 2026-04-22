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
    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Observe changes to the class list of the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
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
