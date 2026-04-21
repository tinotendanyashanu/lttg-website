'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateArticle, getArticleBySlug, getKnowledgeCategories, getAllArticlesShort } from '@/lib/actions/knowledge';
import { KnowledgeType, RoleVisibility, ArticleStatus } from '@/models/KnowledgeArticle';
import BlockEditor from '@/components/portal/knowledge-base/editor/BlockEditor';

export default function EditArticlePage({ params }: { params: { articleId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [dbId, setDbId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    categoryId: '',
    type: 'article' as KnowledgeType,
    content: '',
    tags: '',
    roleVisibility: ['all'],
    status: 'published' as ArticleStatus,
    attachments: [] as { name: string; url: string }[],
    relatedArticles: [] as string[],
  });

  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

  useEffect(() => {
    async function init() {
        try {
            const [artRes, catRes, allRes] = await Promise.all([
                getArticleBySlug(params.articleId, 'admin'),
                getKnowledgeCategories(),
                getAllArticlesShort()
            ]);

            if (catRes.success) setCategories(catRes.categories);
            if (allRes.success) setAllArticles(allRes.articles.filter((a: any) => a.slug !== params.articleId));

            if (artRes.success && artRes.article) {
                const a = artRes.article;
                setDbId(a._id);
                setFormData({
                    title: a.title,
                    subtitle: a.subtitle || '',
                    slug: a.slug,
                    categoryId: a.categoryId?._id || a.categoryId || '',
                    type: a.type || 'article',
                    content: a.content,
                    tags: a.tags?.join(', ') || '',
                    roleVisibility: a.roleVisibility || ['all'],
                    status: a.status || (a.isPublished ? 'published' : 'draft'),
                    attachments: a.attachments || [],
                    relatedArticles: a.relatedArticles?.map((r: any) => r._id || r) || [],
                });
            } else {
                setError(artRes.error || 'Article not found');
            }
        } catch (err: any) {
            setError(err.message || 'Error loading article');
        } finally {
            setFetching(false);
        }
    }
    init();
  }, [params.articleId]);

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

  const handleRelatedToggle = (id: string) => {
    setFormData(prev => ({
        ...prev,
        relatedArticles: prev.relatedArticles.includes(id) 
            ? prev.relatedArticles.filter(r => r !== id)
            : [...prev.relatedArticles, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await updateArticle(dbId, {
        ...formData,
        tags: tagsArray,
        lastReviewedAt: new Date(),
      } as any);

      if (result.success) {
        router.push(`/portal/knowledge-base/${formData.slug}`);
      } else {
        setError(result.error || 'Failed to update article');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-24 text-center">Loading article editor...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit: {formData.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Refine and update knowledge articles.</p>
        </div>
        <div className="flex gap-3">
            <Link 
            href={`/portal/knowledge-base/${params.articleId}`} 
            className="px-4 py-2 bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
            Cancel
            </Link>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
                {loading ? 'Saving...' : 'Update Article'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-6">
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-transparent border-none text-3xl md:text-4xl font-bold focus:ring-0 outline-none dark:text-white"
                    placeholder="Article Title"
                />
                <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-transparent border-none text-lg text-gray-500 focus:ring-0 outline-none dark:text-gray-400"
                    placeholder="Subtitle..."
                />
                <div className="pt-4 border-t border-gray-50 dark:border-neutral-800">
                    <BlockEditor 
                        initialContent={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    />
                </div>
            </div>

            {/* Related Articles Selector */}
            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-icons-outlined text-purple-500">share</span>
                    Related Articles (Linking)
                </h3>
                <p className="text-xs text-gray-500 mb-6">Connect this article to other relevant resources. This will also create backlinks.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allArticles.map(art => (
                        <button
                            key={art._id}
                            type="button"
                            onClick={() => handleRelatedToggle(art._id)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                                formData.relatedArticles.includes(art._id)
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            <span className="font-semibold truncate pr-2">{art.title}</span>
                            {formData.relatedArticles.includes(art._id) && <span className="material-icons-outlined text-sm">link</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6 text-sm">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dark:text-white"
                    >
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dark:text-white"
                    >
                        {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tags</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none dark:text-white"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
