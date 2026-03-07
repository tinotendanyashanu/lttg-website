'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createArticle } from '@/lib/actions/knowledge';
import { KnowledgeType, RoleVisibility } from '@/models/KnowledgeArticle';

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Sales',
    type: 'article' as KnowledgeType,
    content: '',
    tags: '',
    roleVisibility: ['all'],
    teamVisibility: '', // comma separated for now
    isPublished: false,
  });

  const categories = ['Sales', 'Product / Services', 'Internal Process', 'HR / Policy', 'General'];
  const types = ['article', 'resource', 'policy'];
  const roles = ['all', 'intern', 'employee', 'admin'];

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
        if (role === 'all') return { ...prev, roleVisibility: ['all'] };
        
        let newRoles = prev.roleVisibility.filter(r => r !== 'all');
        if (newRoles.includes(role)) {
            newRoles = newRoles.filter(r => r !== role);
            if (newRoles.length === 0) newRoles = ['all'];
        } else {
            newRoles.push(role);
        }
        return { ...prev, roleVisibility: newRoles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real app, createdBy would come from the current user session
      const createdBy = 'dev@leotech.com'; 

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const teamArray = formData.teamVisibility.split(',').map(t => t.trim()).filter(Boolean);

      const result = await createArticle({
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        type: formData.type,
        content: formData.content,
        tags: tagsArray,
        roleVisibility: formData.roleVisibility as RoleVisibility[],
        teamVisibility: teamArray,
        isPublished: formData.isPublished,
        createdBy,
      });

      if (result.success) {
        router.push('/portal/knowledge-base');
      } else {
        setError(result.error || 'Failed to create article');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Knowledge Base Entry</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new article, resource, or policy to the portal.</p>
        </div>
        <Link 
          href="/portal/knowledge-base" 
          className="px-4 py-2 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-8">
        {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({ ...formData, title, slug });
                    }}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="e.g. Objection Handling - Pricing Too High"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono"
                    placeholder="objection-handling-pricing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Content (Markdown)</label>
                  <textarea
                    required
                    rows={15}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono resize-y"
                    placeholder="Use Markdown for formatting...&#10;&#10;# Heading 1&#10;## Heading 2&#10;&#10;* Bullet point 1&#10;* Bullet point 2"
                  />
                </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {types.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type as KnowledgeType })}
                                className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                                    formData.type === type 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Role Visibility</label>
                    <div className="flex flex-wrap gap-2">
                         {roles.map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => handleRoleToggle(role)}
                                className={`py-1.5 px-3 rounded-full text-xs font-semibold capitalize border transition-all ${
                                    formData.roleVisibility.includes(role)
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">Select 'all' to make visible to everyone, or restrict entirely.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Team Visibility (Optional)</label>
                  <input
                    type="text"
                    value={formData.teamVisibility}
                    onChange={(e) => setFormData({ ...formData, teamVisibility: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="e.g. sales_team_1, marketing"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Comma-separated team IDs.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="e.g. script, discovery, B2B"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors ${formData.isPublished ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isPublished ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Publish Immediately</p>
                            <p className="text-[11px] text-gray-500">Make this visible to users.</p>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 mt-6"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="material-icons-outlined text-lg">check_circle</span>
                            Save Entry
                        </>
                    )}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}
