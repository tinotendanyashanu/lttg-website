'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createArticle, getKnowledgeCategories } from '@/lib/actions/knowledge';
import { KnowledgeType, RoleVisibility, ArticleStatus } from '@/models/KnowledgeArticle';
import BlockEditor from '@/components/portal/knowledge-base/editor/BlockEditor';

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    categoryId: '',
    type: 'article' as KnowledgeType,
    content: '',
    tags: '',
    roleVisibility: ['all'],
    teamVisibility: '',
    status: 'published' as ArticleStatus,
    attachments: [] as { name: string; url: string }[],
  });

  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

  useEffect(() => {
    async function fetchCategories() {
      const res = await getKnowledgeCategories();
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        setFormData(prev => ({ ...prev, categoryId: res.categories[0]._id }));
      }
    }
    fetchCategories();
  }, []);

  const types = ['article', 'resource', 'policy'];
  const roles = ['all', 'intern', 'employee', 'admin'];
  const statuses = ['draft', 'published', 'archived'];

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

  const addAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      setNewAttachment({ name: '', url: '' });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || formData.content === '[]') {
        setError('Article content is required');
        return;
    }
    
    setLoading(true);
    setError('');

    try {
      const createdBy = 'dev@leotech.com'; 
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const result = await createArticle({
        ...formData,
        tags: tagsArray,
        createdBy,
        category: categories.find(c => c._id === formData.categoryId)?.name || 'General'
      } as any);

      if (result.success) {
        router.push('/portal/employee/knowledge-base');
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
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Knowledge Article</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design a rich, block-based article for the team.</p>
        </div>
        <div className="flex gap-3">
            <Link 
            href="/portal/employee/knowledge-base" 
            className="px-4 py-2 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
            Cancel
            </Link>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
                {loading ? 'Saving...' : 'Publish Article'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({ ...formData, title, slug });
                    }}
                    className="w-full bg-transparent border-none text-3xl md:text-4xl font-bold focus:ring-0 outline-none dark:text-white placeholder-gray-200 dark:placeholder-gray-700"
                    placeholder="Article Title"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-transparent border-none text-lg text-gray-500 focus:ring-0 outline-none dark:text-gray-400 placeholder-gray-100 dark:placeholder-gray-800"
                    placeholder="Add a subtitle or short summary..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-50 dark:border-neutral-800">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Content</label>
                    <BlockEditor 
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-icons-outlined text-blue-500">link</span>
                    Attachments & Resources
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="File Name (e.g. Sales Playbook PDF)"
                            value={newAttachment.name}
                            onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Google Drive URL"
                                value={newAttachment.url}
                                onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                                className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white"
                            />
                            <button 
                                type="button"
                                onClick={addAttachment}
                                className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="material-icons-outlined">add</span>
                            </button>
                        </div>
                    </div>

                    {formData.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {formData.attachments.map((at, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                    <span className="material-icons-outlined text-sm">description</span>
                                    {at.name}
                                    <button onClick={() => removeAttachment(i)} className="hover:text-red-500">
                                        <span className="material-icons-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none dark:text-white"
                    >
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none dark:text-white"
                    >
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Type</label>
                    <div className="grid grid-cols-1 gap-2">
                        {types.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type as KnowledgeType })}
                                className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all flex items-center justify-between ${
                                    formData.type === type 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {type}
                                {formData.type === type && <span className="material-icons-outlined text-sm">check_circle</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Visibility</label>
                    <div className="flex flex-wrap gap-2">
                         {roles.map(role => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => handleRoleToggle(role)}
                                className={`py-1.5 px-3 rounded-full text-[10px] font-bold uppercase border transition-all ${
                                    formData.roleVisibility.includes(role)
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none dark:text-white"
                    placeholder="tag1, tag2..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-transparent border-none text-[10px] font-mono text-gray-400 focus:ring-0 outline-none"
                    placeholder="article-slug"
                  />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
