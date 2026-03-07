'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
    content: string;
}

export default function MarkdownRenderer({ content }: Props) {
    if (!content) return null;

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded-lg prose-code:px-2 prose-code:py-0.5 prose-pre:bg-gray-900 prose-pre:text-gray-200">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
