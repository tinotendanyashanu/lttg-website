'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    content: string;
}

export default function MarkdownRenderer({ content }: Props) {
    if (!content) return null;

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none 
            prose-headings:text-gray-900 dark:prose-headings:text-white 
            prose-p:text-gray-600 dark:prose-p:text-gray-300 
            prose-a:text-blue-600 dark:prose-a:text-blue-400 
            prose-strong:text-gray-900 dark:prose-strong:text-white 
            prose-code:text-rose-600 dark:prose-code:text-rose-400 
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 
            prose-code:rounded-lg prose-code:px-2 prose-code:py-0.5 
            prose-pre:bg-gray-900 prose-pre:text-gray-200
            prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-800
            prose-th:bg-gray-50 dark:prose-th:bg-gray-800/50 prose-th:px-4 prose-th:py-3 prose-th:border-b
            prose-td:px-4 prose-td:py-3 prose-td:border-b dark:prose-td:border-gray-800
            overflow-x-auto
        ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}
