'use client';

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useMemo } from "react";

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

  const initialBlocks = useMemo(() => {
    if (!initialContent || initialContent === '[]') return undefined;
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch (e) {
      return [
        {
          type: "paragraph",
          content: initialContent
        }
      ] as PartialBlock[];
    }
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  // Effect to update content if initialContent changes after mounting
  useEffect(() => {
    if (editor && initialBlocks && initialBlocks.length > 0) {
        const firstBlock = editor.document[0];
        const isEmpty = editor.document.length <= 1 && 
                       (!firstBlock || (Array.isArray(firstBlock.content) && firstBlock.content.length === 0));

        if (isEmpty) {
            editor.replaceBlocks(editor.document, initialBlocks);
        }
    }
  }, [editor, initialBlocks]);

  return (
    <div className="block-editor min-h-[400px] border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-slate-200">
      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme={isDarkMode ? "dark" : "light"}
        onChange={() => {
          const json = JSON.stringify(editor.document);
          onChange(json);
        }}
      />
    </div>
  );
}
