'use client';

import { useState, useTransition, useRef } from 'react';
import { createContractTemplate } from '@/lib/actions/contract-templates';

const TEMPLATE_VARIABLES = [
  'client_name', 'business_name', 'service_name', 'service_description',
  'amount', 'currency', 'start_date', 'end_date', 'date', 'company_name',
];

const CATEGORY_SUGGESTIONS = [
  'Service Agreement', 'Non-Disclosure Agreement', 'Consulting Agreement',
  'Retainer Agreement', 'Statement of Work', 'Master Services Agreement',
];

export default function CreateTemplateModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);

  function insertVariable(variable: string) {
    const textarea = contentRef.current;
    if (!textarea) return;
    const tag = `{{${variable}}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + tag + content.slice(end);
    setContent(newContent);
    // Restore cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(false);
    setPreview(false);
    setName('');
    setCategory('');
    setDescription('');
    setContent('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Template name is required.');
    if (!content.trim()) return setError('Template content is required.');

    startTransition(async () => {
      try {
        await createContractTemplate({ name, description, category: category || 'General', content });
        setSuccess(true);
        setTimeout(handleClose, 1800);
      } catch (err: any) {
        setError(err?.message || 'Failed to create template.');
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-opacity shadow-sm"
      >
        <span className="material-icons-outlined text-[18px]">add</span>
        New Template
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-3xl my-8 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-[18px]">article</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Contract Template</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors">
                <span className="material-icons-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Name + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Standard Service Agreement"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    list="category-suggestions"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Service Agreement"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of when to use this template…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />
              </div>

              {/* HTML Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    HTML Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className="text-xs font-semibold text-brand-primary hover:opacity-80 flex items-center gap-1 transition-opacity"
                  >
                    <span className="material-icons-outlined text-[14px]">
                      {preview ? 'code' : 'visibility'}
                    </span>
                    {preview ? 'Edit HTML' : 'Preview'}
                  </button>
                </div>

                {/* Variable pill buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setPreview(false); insertVariable(v); }}
                      className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      {'{{'}{ v }{'}}'}
                    </button>
                  ))}
                </div>

                {preview ? (
                  <div
                    className="contract-body prose prose-sm max-w-none border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 min-h-[300px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: content || '<p style="color:#9ca3af;font-style:italic">Nothing to preview yet…</p>' }}
                  />
                ) : (
                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={14}
                    required
                    placeholder={`<div class="cover">\n  <h1>SERVICE AGREEMENT</h1>\n  <p>Prepared for: {{client_name}}</p>\n</div>\n\n<div class="section">\n  <h2>1. Introduction</h2>\n  <p>This agreement is between LeoTheTechGuy and {{client_name}} ({{business_name}}).</p>\n</div>`}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-y font-mono leading-relaxed"
                  />
                )}
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Write HTML. Use {'{{variable}}'} placeholders. Variables are replaced with real data when a contract is generated.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span className="material-icons-outlined text-[16px]">check_circle</span>
                  Template created successfully.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-opacity shadow-sm"
                >
                  {isPending ? (
                    <><span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>Saving…</>
                  ) : (
                    <><span className="material-icons-outlined text-[16px]">save</span>Save Template</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
