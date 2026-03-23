'use client';

import { useState, useTransition, useEffect } from 'react';
import { getContractTemplates, deleteContractTemplate } from '@/lib/actions/contract-templates';
import CreateTemplateModal from '@/components/admin/CreateTemplateModal';
import EditTemplateModal from '@/components/admin/EditTemplateModal';
import Link from 'next/link';

interface Template {
  _id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Service Agreement':        'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  'Non-Disclosure Agreement': 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/40',
  'Consulting Agreement':     'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/40',
  'Retainer Agreement':       'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  'Statement of Work':        'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  'Master Services Agreement':'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/40',
};

const TEMPLATE_VARIABLES = [
  'client_name', 'business_name', 'service_name', 'service_description',
  'amount', 'currency', 'start_date', 'end_date', 'date', 'company_name',
];

function categoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
}

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function loadTemplates() {
    startTransition(async () => {
      try {
        const data = await getContractTemplates();
        setTemplates(data);
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => { loadTemplates(); }, []);

  function showToast(type: 'success' | 'error', text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"?\n\nThis action is permanent and cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteContractTemplate(id);
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        showToast('success', `"${name}" deleted.`);
      } catch {
        showToast('error', 'Failed to delete template. Please try again.');
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contracts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create, send, and track all client contracts.
          </p>
        </div>
        <CreateTemplateModal />
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 dark:border-gray-800 -mt-2">
        <Link
          href="/admin/contracts"
          className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200 -mb-px transition-colors"
        >
          All Contracts
        </Link>
        <Link
          href="/admin/contracts/templates"
          className="px-4 py-2.5 text-sm font-semibold text-brand-primary border-b-2 border-brand-primary -mb-px"
        >
          Templates
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400'
        }`}>
          <span className="material-icons-outlined text-[15px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.text}
        </div>
      )}

      {/* Template list */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Contract Templates</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Reusable HTML templates with variable placeholders.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400 dark:text-gray-600">
            <span className="material-icons-outlined text-[20px] animate-spin">autorenew</span>
            <span className="text-sm">Loading templates…</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-icons-outlined text-gray-400 dark:text-gray-600 text-[26px]">article</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No templates yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
              Templates let you generate professional contracts instantly. Create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/60 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {['Template', 'Category', 'Description', 'Last Updated', ''].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {templates.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4 min-w-[160px]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${categoryStyle(t.category)}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {t.description || <span className="text-gray-300 dark:text-gray-600 italic">No description</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingTemplate(t)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="material-icons-outlined text-[13px]">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-40"
                        >
                          <span className="material-icons-outlined text-[13px]">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Variable reference */}
      <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Supported Template Variables
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARIABLES.map((v) => (
            <span
              key={v}
              className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              {`{{${v}}}`}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 leading-relaxed">
          These placeholders are automatically replaced with real client and contract data when a contract is generated.
        </p>
      </div>

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => { setEditingTemplate(null); loadTemplates(); }}
        />
      )}
    </div>
  );
}
