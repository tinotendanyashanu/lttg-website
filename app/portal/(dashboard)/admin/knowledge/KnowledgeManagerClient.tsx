'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminKnowledgeArticle, updateAdminKnowledgeArticle, deleteAdminKnowledgeArticle } from '@/lib/actions/portal-admin-knowledge';

export default function KnowledgeManagerClient({ initialArticles }: { initialArticles: any[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (filterCategory !== 'all' && a.category !== filterCategory) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (a.title || '').toLowerCase().includes(query) ||
          (a.content || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [articles, filterCategory, searchQuery]);

  const uniqueCategories = useMemo(() => {
     return Array.from(new Set(articles.map(a => a.category).filter(Boolean)));
  }, [articles]);

  const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     
     const roleInput = formData.get('targetRoles') as string;
     const targetRoles = roleInput.split(',').map(r => r.trim()).filter(Boolean);
     
     const data = {
       title: formData.get('title') as string,
       slug: formData.get('slug') as string,
       category: formData.get('category') as string,
       content: formData.get('content') as string,
       type: formData.get('type') as string,
       targetRoles,
       isPublished: formData.get('isPublished') === 'true',
     };
     
     try {
       if (isCreating) {
          const res = await createAdminKnowledgeArticle(data);
          const newArticle = { ...data, _id: res.articleId, updatedAt: new Date().toISOString() };
          setArticles([newArticle, ...articles]);
          setIsCreating(false);
          setSelectedArticle(newArticle);
       } else if (selectedArticle) {
          await updateAdminKnowledgeArticle(selectedArticle._id, data);
          setArticles(articles.map(a => a._id === selectedArticle._id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a));
          setSelectedArticle({ ...selectedArticle, ...data });
       }
       router.refresh();
     } catch (err) {
       console.error("Failed to save article", err);
       alert("Failed to save article. Make sure the slug is unique.");
     } finally {
       setIsUpdating(false);
     }
  };

  const handleDeleteArticle = async (articleId: string) => {
     if (!confirm("Are you sure you want to delete this article?")) return;
     try {
       await deleteAdminKnowledgeArticle(articleId);
       setArticles(articles.filter(a => a._id !== articleId));
       setSelectedArticle(null);
       router.refresh();
     } catch (err) {
       console.error("Failed to delete article", err);
     }
  };

  const formArticle = isCreating ? {} : selectedArticle;

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
         <div className="relative flex-1 max-w-md">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
         </div>
         <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Categories</option>
             {uniqueCategories.map((c: string) => (
                <option key={c} value={c}>{c}</option>
             ))}
          </select>
          <button 
             onClick={() => { setIsCreating(true); setSelectedArticle(null); }}
             className="ml-auto bg-brand-primary text-white hover:opacity-90 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity"
          >
             <span className="material-icons-outlined text-[18px]">add</span>
             New Article
          </button>
       </div>

       {/* Articles List & Editor */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
             {filteredArticles.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">article</span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No matching articles found.</p>
                </div>
             ) : (
                filteredArticles.map(a => (
                   <div 
                     key={a._id} 
                     onClick={() => { setSelectedArticle(a); setIsCreating(false); }}
                     className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedArticle?._id === a._id && !isCreating ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{a.title}</h3>
                         {a.isPublished ? (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1.5 ml-2" title="Published" />
                         ) : (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300 mt-1.5 ml-2" title="Draft" />
                         )}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                         <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded capitalize">{a.category || 'Uncategorized'}</span>
                         <span>{new Date(a.updatedAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Details / Editor Pane */}
          <div className="xl:col-span-2">
             {(selectedArticle || isCreating) ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                     <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                        {isCreating ? 'Create New Article' : 'Edit Article'}
                     </h3>
                     {!isCreating && (
                        <button onClick={() => handleDeleteArticle(selectedArticle._id)} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                          <span className="material-icons-outlined text-[16px]">delete</span> Delete
                        </button>
                     )}
                   </div>
                   
                   <form onSubmit={handleSaveArticle} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Title</p>
                          <input
                            required
                            type="text"
                            name="title"
                            defaultValue={formArticle?.title || ''}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Slug</p>
                          <input
                            required
                            type="text"
                            name="slug"
                            defaultValue={formArticle?.slug || ''}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Category</p>
                          <input
                            required
                            type="text"
                            name="category"
                            defaultValue={formArticle?.category || ''}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Type</p>
                          <select
                            name="type"
                            defaultValue={formArticle?.type || 'guide'}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          >
                             <option value="guide">Guide</option>
                             <option value="faq">FAQ</option>
                             <option value="policy">Policy</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Target Roles (comma separated)</p>
                          <input
                            type="text"
                            name="targetRoles"
                            defaultValue={formArticle?.targetRoles?.join(', ') || 'admin, employee, intern'}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                          <select
                            name="isPublished"
                            defaultValue={formArticle?.isPublished ? 'true' : 'false'}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          >
                             <option value="true">Published</option>
                             <option value="false">Draft</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Content (Markdown)</p>
                        <textarea
                          required
                          name="content"
                          defaultValue={formArticle?.content || ''}
                          rows={12}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none font-mono"
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button disabled={isUpdating} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                            {isUpdating ? 'Saving...' : 'Save Article'}
                        </button>
                      </div>
                   </form>
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[500px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">menu_book</span>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Select an article to edit or create a new one.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
