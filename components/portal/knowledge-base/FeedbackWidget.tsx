'use client';

import React, { useState } from 'react';
import { submitArticleFeedback } from '@/lib/actions/knowledge';

export default function FeedbackWidget({ articleId, userEmail }: { articleId: string; userEmail: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (isHelpful: boolean) => {
    setLoading(true);
    const res = await submitArticleFeedback(articleId, userEmail, isHelpful);
    if (res.success) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 text-center animate-in fade-in zoom-in duration-300">
        <span className="material-icons-outlined text-emerald-500 mb-2">check_circle</span>
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800 space-y-6 shadow-sm">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Feedback</h4>
      <p className="text-xs text-gray-500 leading-relaxed">Was this article helpful? Your feedback helps us improve.</p>
      <div className="flex gap-2">
        <button 
          disabled={loading}
          onClick={() => handleFeedback(true)}
          className="flex-1 bg-gray-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 py-3 rounded-2xl transition-all flex flex-col items-center gap-1 group disabled:opacity-50"
        >
          <span className="material-icons-outlined text-lg opacity-40 group-hover:opacity-100">thumb_up</span>
          <span className="text-[10px] font-bold">Yes</span>
        </button>
        <button 
          disabled={loading}
          onClick={() => handleFeedback(false)}
          className="flex-1 bg-gray-50 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 py-3 rounded-2xl transition-all flex flex-col items-center gap-1 group disabled:opacity-50"
        >
          <span className="material-icons-outlined text-lg opacity-40 group-hover:opacity-100">thumb_down</span>
          <span className="text-[10px] font-bold">No</span>
        </button>
      </div>
    </div>
  );
}
