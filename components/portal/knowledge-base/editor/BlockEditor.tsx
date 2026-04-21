'use client';

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";

interface BlockEditorProps {
  initialContent?: string;
  onChange: (jsonContent: string) => void;
  editable?: boolean;
}

export default function BlockEditor({ 
  initialContent, 
  onChange, 
  editable = true 
}: BlockEditorProps) {
  const [initialBlocks, setInitialBlocks] = useState<PartialBlock[] | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initialContent) {
      try {
        // Try to parse as JSON first (BlockNote format)
        const parsed = JSON.parse(initialContent);
        setInitialBlocks(parsed);
      } catch (e) {
        // If it's not JSON, it's probably existing Markdown
        // BlockNote doesn't natively parse Markdown in the constructor easily,
        // but for migration we might just show it as a single text block 
        // or use a converter. For now, we'll treat it as empty or single block.
        setInitialBlocks([
          {
            type: "paragraph",
            content: initialContent
          }
        ]);
      }
    }
    setIsReady(true);
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  if (!isReady) return <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 text-gray-400">Loading editor...</div>;

  return (
    <div className="min-h-[400px] border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1c1e]">
      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme={typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"}
        onChange={() => {
          const json = JSON.stringify(editor.document);
          onChange(json);
        }}
      />
    </div>
  );
}
