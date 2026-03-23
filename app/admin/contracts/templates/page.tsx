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

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

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

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteContractTemplate(id);
        setDeleteMessage(`"${name}" deleted.`);
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        setTimeout(() => setDeleteMessage(null), 3000);
      } catch {
        setDeleteMessage('Failed to delete template.');
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-nav */}
      <div className="flex items-center gap-1 text-sm">
        <Link href="/admin/contracts" className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">
          Contracts
        </Link>
        <Link href="/admin/contracts/templates" className="px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary font-semibold">
          Templates
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contract Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reusable HTML templates with variable placeholders for generating contracts.
          </p>
        </div>
        <CreateTemplateModal />
      </div>

      {deleteMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <span className="material-icons-outlined text-[15px]">check_circle</span>
          {deleteMessage}
        </div>
      )}

      {/* Template table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <span className="material-icons-outlined text-[24px] animate-spin mr-2">autorenew</span>
            Loading templates…
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons-outlined text-[40px] text-gray-300 dark:text-gray-600 mb-3 block">
              article
            </span>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No templates yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Create your first template to speed up contract generation.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Last Updated</th>
                <th className="text-right px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {templates.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {t.description || <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingTemplate(t)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="material-icons-outlined text-[14px]">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.name)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <span className="material-icons-outlined text-[14px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Supported variables reference */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">
          Supported Template Variables
        </h3>
        <div className="flex flex-wrap gap-2">
          {['client_name', 'business_name', 'service_name', 'service_description', 'amount', 'currency', 'start_date', 'end_date', 'date', 'company_name'].map((v) => (
            <span key={v} className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-white dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 rounded-md">
              {'{{'}{ v }{'}}'}
            </span>
          ))}
        </div>
        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-3">
          Variables are automatically replaced with client data when a contract is generated from this template.
        </p>
      </div>

      {/* Edit modal */}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => { setEditingTemplate(null); loadTemplates(); }}
        />
      )}
    </div>
  );
}
