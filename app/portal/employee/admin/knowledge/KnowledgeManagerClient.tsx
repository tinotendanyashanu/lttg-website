'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    createAdminKnowledgeArticle, 
    updateAdminKnowledgeArticle, 
    deleteAdminKnowledgeArticle,
    createKnowledgeCategory,
    updateKnowledgeCategory,
    deleteKnowledgeCategory
} from '@/lib/actions/portal-admin-knowledge';
import { getKnowledgeCategories, getKnowledgeAnalytics } from '@/lib/actions/knowledge';
import BlockEditor from '@/components/portal/knowledge-base/editor/BlockEditor';
import {
  KB_KINDS,
  KB_KIND_LABELS,
  KB_SERVICES,
  KB_REGIONS,
  KB_REGION_LABELS,
  KB_AUDIENCES,
  type KbAudience,
} from '@/lib/knowledge/constants';

const AUDIENCE_LABELS: Record<KbAudience, string> = {
  public: 'Public (everyone)',
  client: 'Clients',
  employee: 'Employees',
  admin: 'Admins only',
};

// roleVisibility is an array; map a single chosen audience to the role(s) stored.
function audienceToVisibility(audience: string): string[] {
  switch (audience) {
    case 'public': return ['all'];
    case 'client': return ['client'];
    case 'employee': return ['employee'];
    case 'admin': return ['admin'];
    default: return ['all'];
  }
}

function visibilityToAudience(roleVisibility?: string[]): KbAudience {
  const roles = roleVisibility || [];
  if (roles.includes('admin') && !roles.includes('all')) return 'admin';
  if (roles.includes('employee') || roles.includes('intern')) return 'employee';
  if (roles.includes('client') && !roles.includes('all')) return 'client';
  return 'public';
}

export default function KnowledgeManagerClient({ initialArticles }: { initialArticles: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'analytics'>('articles');
  const [articles, setArticles] = useState(initialArticles);
  const [categories, setCategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: 'folder', order: 0 });

  useEffect(() => {
    async function fetchData() {
        const catRes = await getKnowledgeCategories();
        if (catRes.success) setCategories(catRes.categories);
        
        const anaRes = await getKnowledgeAnalytics();
        if (anaRes.success) setAnalytics(anaRes.data);
    }
    fetchData();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const query = searchQuery.toLowerCase();
      return (a.title || '').toLowerCase().includes(query) || (a.subtitle || '').toLowerCase().includes(query);
    });
  }, [articles, searchQuery]);

  const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     
     const data: Record<string, any> = {
       title: formData.get('title') as string,
       subtitle: formData.get('subtitle') as string,
       slug: formData.get('slug') as string,
       categoryId: formData.get('categoryId') as string,
       status: formData.get('status') as string,
       type: formData.get('type') as string,
       content: selectedArticle?.content || '',
       // Knowledge classification + scoping + access control
       kind: (formData.get('kind') as string) || undefined,
       services: formData.getAll('services') as string[],
       regions: formData.getAll('regions') as string[],
       roleVisibility: audienceToVisibility(formData.get('audience') as string),
     };
     
     try {
       if (isCreating) {
          const res = await createAdminKnowledgeArticle(data);
          if (res.success) {
            router.refresh();
            window.location.reload(); // Simplest way to resync
          } else {
            alert(res.error || "Failed to create article.");
          }
       } else if (selectedArticle) {
          const res = await updateAdminKnowledgeArticle(selectedArticle._id, data);
          if (res.success) {
            setArticles(articles.map(a => a._id === selectedArticle._id ? { ...a, ...data } : a));
            setSelectedArticle({ ...selectedArticle, ...data });
          } else {
            alert(res.error || "Failed to update article.");
          }
       }
     } catch (err) {
       alert("An unexpected error occurred while saving.");
     } finally {
       setIsUpdating(false);
     }
  };

  const handleCreateCategory = async () => {
      if (!newCat.name || !newCat.slug) return;
      const res = await createKnowledgeCategory(newCat);
      if (res.success) {
          setCategories([...categories, res.category]);
          setIsCreatingCategory(false);
          setNewCat({ name: '', slug: '', icon: 'folder', order: 0 });
      }
  };

  const handleDeleteCat = async (id: string) => {
      if (!confirm("Delete category? Articles will remain but might become uncategorized.")) return;
      const res = await deleteKnowledgeCategory(id);
      if (res.success) setCategories(categories.filter(c => c._id !== id));
  };

  return (
    <div className="space-y-6">
       {/* Tab Switcher */}
       <div className="flex items-center gap-1 bg-white dark:bg-[#1c1c1e] p-1.5 rounded-2xl border border-gray-100 dark:border-neutral-800 w-fit shadow-sm">
          {(['articles', 'categories', 'analytics'] as const).map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
             >
                {tab}
             </button>
          ))}
       </div>

       {activeTab === 'articles' && (
           <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* List Pane */}
              <div className="xl:col-span-1 space-y-4">
                <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4">
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input 
                            type="text"
                            placeholder="Filter articles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs outline-none dark:text-white"
                        />
                    </div>
                    <button 
                        onClick={() => { 
                          setIsCreating(true); 
                          setSelectedArticle({ 
                            _id: 'temp-' + Date.now(), 
                            title: '', 
                            content: '[]', 
                            status: 'draft', 
                            type: 'article' 
                          }); 
                        }}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-outlined text-sm">add</span>
                        New Entry
                    </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredArticles.map(a => (
                        <div 
                            key={a._id}
                            onClick={() => { setSelectedArticle(a); setIsCreating(false); }}
                            className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                                selectedArticle?._id === a._id && !isCreating
                                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                    : 'bg-white dark:bg-[#1c1c1e] border-gray-100 dark:border-neutral-800 hover:border-gray-200 dark:hover:border-neutral-700'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">{a.title}</h4>
                                <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${a.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{a.categoryId?.name || 'General'}</span>
                                <span className="text-[9px] text-gray-400">{new Date(a.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* Editor Pane */}
              <div className="xl:col-span-3">
                {selectedArticle || isCreating ? (
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-neutral-900 pb-6">
                            <h2 className="text-xl font-bold">{isCreating ? 'New Knowledge Base Entry' : 'Edit Entry'}</h2>
                            {!isCreating && (
                                <button 
                                    onClick={() => deleteAdminKnowledgeArticle(selectedArticle._id).then(() => window.location.reload())}
                                    className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1"
                                >
                                    <span className="material-icons-outlined text-sm">delete</span>
                                    Delete Article
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSaveArticle} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Title</label>
                                    <input 
                                        name="title" 
                                        defaultValue={selectedArticle?.title} 
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Subtitle / Summary</label>
                                    <input 
                                        name="subtitle" 
                                        defaultValue={selectedArticle?.subtitle} 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Slug</label>
                                    <input 
                                        name="slug" 
                                        defaultValue={selectedArticle?.slug} 
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-xs font-mono outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <select 
                                        name="categoryId" 
                                        defaultValue={selectedArticle?.categoryId?._id || selectedArticle?.categoryId}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    >
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                    <select 
                                        name="status" 
                                        defaultValue={selectedArticle?.status || 'draft'}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Type</label>
                                    <select
                                        name="type"
                                        defaultValue={selectedArticle?.type || 'article'}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="article">Article</option>
                                        <option value="resource">Resource</option>
                                        <option value="policy">Policy</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Knowledge Kind</label>
                                    <select
                                        name="kind"
                                        defaultValue={selectedArticle?.kind || ''}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    >
                                        <option value="">— None —</option>
                                        {KB_KINDS.map(k => <option key={k} value={k}>{KB_KIND_LABELS[k]}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Audience (access)</label>
                                    <select
                                        name="audience"
                                        defaultValue={visibilityToAudience(selectedArticle?.roleVisibility)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none"
                                    >
                                        {KB_AUDIENCES.map(a => <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Services <span className="text-gray-300 normal-case font-normal">(ctrl/cmd-click for multiple)</span></label>
                                    <select
                                        name="services"
                                        multiple
                                        defaultValue={selectedArticle?.services || []}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none min-h-[110px]"
                                    >
                                        {KB_SERVICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Regions <span className="text-gray-300 normal-case font-normal">(ctrl/cmd-click for multiple)</span></label>
                                    <select
                                        name="regions"
                                        multiple
                                        defaultValue={selectedArticle?.regions || []}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm outline-none min-h-[110px]"
                                    >
                                        {KB_REGIONS.map(r => <option key={r} value={r}>{KB_REGION_LABELS[r]}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-neutral-900">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 block mb-4">Content</label>
                                <BlockEditor 
                                    key={selectedArticle?._id || 'new'}
                                    initialContent={selectedArticle?.content}
                                    onChange={(content) => setSelectedArticle((prev: any) => ({ ...prev, content }))}
                                />
                            </div>

                            <div className="flex justify-end pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isUpdating}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving Changes...' : 'Save Knowledge Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-neutral-800">
                        <div className="w-20 h-20 bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm flex items-center justify-center mb-6 text-gray-300">
                            <span className="material-icons-outlined text-4xl">edit_note</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Editor Ready</h3>
                        <p className="text-sm text-gray-500 max-w-xs">Select an article from the sidebar to begin editing or create a new entry.</p>
                    </div>
                )}
              </div>
           </div>
       )}

       {activeTab === 'categories' && (
           <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Category Architecture</h2>
                        <button 
                            onClick={() => setIsCreatingCategory(true)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
                        >
                            Add New Category
                        </button>
                    </div>

                    {isCreatingCategory && (
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Name</label>
                                <input 
                                    value={newCat.name} 
                                    onChange={e => {
                                        const name = e.target.value;
                                        const slug = name.toLowerCase().replace(/ /g, '-');
                                        setNewCat({ ...newCat, name, slug });
                                    }}
                                    className="w-full bg-white dark:bg-gray-900 border-none rounded-xl px-3 py-2 text-xs outline-none" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Slug</label>
                                <input value={newCat.slug} onChange={e => setNewCat({ ...newCat, slug: e.target.value })} className="w-full bg-white dark:bg-gray-900 border-none rounded-xl px-3 py-2 text-xs outline-none font-mono" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Icon (Material)</label>
                                <input value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })} className="w-full bg-white dark:bg-gray-900 border-none rounded-xl px-3 py-2 text-xs outline-none" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCreateCategory} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Save</button>
                                <button onClick={() => setIsCreatingCategory(false)} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-xs">Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                        {categories.map(c => (
                            <div key={c._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-neutral-800 rounded-2xl hover:border-gray-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                                        <span className="material-icons-outlined text-gray-400">{c.icon || 'folder'}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</h4>
                                        <p className="text-[10px] font-mono text-gray-400">{c.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteCat(c._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <span className="material-icons-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
               </div>
           </div>
       )}

       {activeTab === 'analytics' && analytics && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-blue-500">trending_up</span>
                            Top Performance
                        </h3>
                        <div className="space-y-4">
                            {analytics.mostViewed.map((art: any, i: number) => (
                                <div key={art._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-black text-gray-300">0{i+1}</span>
                                        <div>
                                            <h4 className="text-xs font-bold truncate max-w-[200px]">{art.title}</h4>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">{art.categoryId?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-blue-600">{art.viewCount}</p>
                                        <p className="text-[9px] text-gray-400">Total Views</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>

                   <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-red-500">report_problem</span>
                            Content Gaps & Feedback
                        </h3>
                        <div className="space-y-4">
                            {analytics.feedbackStats.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 text-xs italic">
                                    No feedback recorded yet.
                                </div>
                            ) : (
                                analytics.feedbackStats.map((stat: any) => (
                                    <div key={stat._id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                                            {articles.find(a => a._id === stat._id)?.title || 'Article'}
                                        </h4>
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-xs font-black text-green-500">{stat.helpfulCount}</p>
                                                <p className="text-[9px] uppercase font-bold opacity-30">Yes</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black text-red-500">{stat.unhelpfulCount}</p>
                                                <p className="text-[9px] uppercase font-bold opacity-30">No</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
