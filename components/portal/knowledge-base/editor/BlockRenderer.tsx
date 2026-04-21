'use client';

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useMemo } from "react";

interface BlockRendererProps {
  content: string; // JSON string
}

export default function BlockRenderer({ content }: BlockRendererProps) {
  const blocks = useMemo(() => {
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
    <div className="block-renderer">
      <BlockNoteView 
        editor={editor} 
        editable={false}
        theme={typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"}
      />
    </div>
  );
}
