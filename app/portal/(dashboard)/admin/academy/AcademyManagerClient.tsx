'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createAdminCourse, 
  updateAdminCourse, 
  deleteAdminCourse, 
  getAdminCourseDetails,
  createAdminModule,
  updateAdminModule,
  deleteAdminModule,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson
} from '@/lib/actions/portal-admin-academy';

export default function AcademyManagerClient({ initialCourses }: { initialCourses: any[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  
  // Filters
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Content Editor State
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourse && activeTab === 'content') {
       getAdminCourseDetails(selectedCourse._id).then(res => {
          if (res.success) {
             setModules(res.modules);
             setLessons(res.lessons);
          }
       });
    }
  }, [selectedCourse, activeTab]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c: any) => {
      if (filterDifficulty !== 'all' && c.difficultyLevel !== filterDifficulty) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (c.title || '').toLowerCase().includes(query) || (c.description || '').toLowerCase().includes(query);
      }
      return true;
    });
  }, [courses, filterDifficulty, searchQuery]);

  const handleSaveCourse = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     const roleInput = formData.get('targetRoles') as string;
     const targetRoles = roleInput.split(',').map(r => r.trim()).filter(Boolean);
     
     const data = {
       title: formData.get('title') as string,
       description: formData.get('description') as string,
       difficultyLevel: formData.get('difficultyLevel') as string,
       targetRoles,
       isPublished: formData.get('isPublished') === 'true',
       order: parseInt(formData.get('order') as string) || 0,
     };
     
     try {
       if (isCreating) {
          const res = await createAdminCourse(data);
          const newCourse = { ...data, _id: res.courseId, updatedAt: new Date().toISOString() };
          setCourses([newCourse, ...courses]);
          setIsCreating(false);
          setSelectedCourse(newCourse);
       } else if (selectedCourse) {
          await updateAdminCourse(selectedCourse._id, data);
          setCourses(courses.map((c: any) => c._id === selectedCourse._id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c));
          setSelectedCourse({ ...selectedCourse, ...data });
       }
       router.refresh();
     } catch (err) {
       console.error("Failed to save course", err);
     } finally {
       setIsUpdating(false);
     }
  };

  const handleDeleteCourse = async (courseId: string) => {
     if (!confirm("Are you sure? This will orphans all modules and lessons.")) return;
     try {
       await deleteAdminCourse(courseId);
       setCourses(courses.filter((c: any) => c._id !== courseId));
       setSelectedCourse(null);
       router.refresh();
     } catch (err) {
       console.error("Failed to delete course", err);
     }
  };

  // Module Handlers
  const handleAddModule = async () => {
     if (!selectedCourse) return;
     const title = prompt("Module Title:");
     if (!title) return;
     try {
        const res = await createAdminModule({ courseId: selectedCourse._id, title, orderIndex: modules.length });
        if (res.success) setModules([...modules, res.module]);
     } catch (err) {
        console.error("Failed to create module", err);
     }
  };

  const handleDeleteModule = async (moduleId: string) => {
     if (!confirm("Delete module and all its lessons?")) return;
     try {
        await deleteAdminModule(moduleId);
        setModules(modules.filter(m => m._id !== moduleId));
        setLessons(lessons.filter(l => l.moduleId !== moduleId));
     } catch (err) { console.error(err); }
  };

  // Lesson Handlers
  const handleAddLesson = async (moduleId: string) => {
     const title = prompt("Lesson Title:");
     if (!title) return;
     try {
        const res = await createAdminLesson({ 
           courseId: selectedCourse._id, 
           moduleId, 
           title, 
           content: 'Lesson content here...',
           orderIndex: lessons.filter(l => l.moduleId === moduleId).length 
        });
        if (res.success) setLessons([...lessons, res.lesson]);
     } catch (err) { console.error(err); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
     if (!confirm("Delete lesson?")) return;
     try {
        await deleteAdminLesson(lessonId);
        setLessons(lessons.filter(l => l._id !== lessonId));
     } catch (err) { console.error(err); }
  };

  const formCourse = isCreating ? {} : selectedCourse;

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
             <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
             <input type="text" placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
          </div>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none">
             <option value="all">All Difficulties</option>
             <option value="beginner">Beginner</option>
             <option value="intermediate">Intermediate</option>
             <option value="advanced">Advanced</option>
          </select>
          <button onClick={() => { setIsCreating(true); setSelectedCourse(null); setActiveTab('info'); }} className="ml-auto bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
             <span className="material-icons-outlined text-[18px]">add</span> New Course
          </button>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* List */}
          <div className="xl:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
             {filteredCourses.map((c: any) => (
                <div key={c._id} onClick={() => { setSelectedCourse(c); setIsCreating(false); }} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedCourse?._id === c._id && !isCreating ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}>
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{c.title}</h3>
                      <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${c.isPublished ? 'bg-green-500' : 'bg-gray-300'}`} />
                   </div>
                   <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      <span>{c.difficultyLevel}</span>
                      <span>{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
             ))}
          </div>

          {/* Editor */}
          <div className="xl:col-span-2">
             {(selectedCourse || isCreating) ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[500px]">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                         <button onClick={() => setActiveTab('info')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white dark:bg-[#27272a] shadow-sm text-brand-primary' : 'text-gray-500'}`}>Course Info</button>
                         {!isCreating && <button onClick={() => setActiveTab('content')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-white dark:bg-[#27272a] shadow-sm text-brand-primary' : 'text-gray-500'}`}>Content Editor</button>}
                      </div>
                      {!isCreating && <button onClick={() => handleDeleteCourse(selectedCourse._id)} className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"><span className="material-icons-outlined text-[16px]">delete</span> Delete</button>}
                   </div>

                   {activeTab === 'info' ? (
                      <form onSubmit={handleSaveCourse} className="space-y-4 animate-in fade-in duration-300">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1">Title</p>
                               <input name="title" defaultValue={formCourse?.title} required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1">Difficulty</p>
                               <select name="difficultyLevel" defaultValue={formCourse?.difficultyLevel || 'beginner'} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none">
                                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                               </select>
                            </div>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
                            <textarea name="description" defaultValue={formCourse?.description} rows={3} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                               <select name="isPublished" defaultValue={formCourse?.isPublished ? 'true' : 'false'} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none">
                                  <option value="true">Published</option><option value="false">Draft</option>
                               </select>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 uppercase font-bold mb-1">Order Index</p>
                               <input type="number" name="order" defaultValue={formCourse?.order} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                            </div>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Target Roles (CSV)</p>
                            <input name="targetRoles" defaultValue={formCourse?.targetRoles?.join(', ')} placeholder="intern, employee" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                         </div>
                         <button type="submit" disabled={isUpdating} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-600/20">{isUpdating ? 'Saving...' : 'Save Course Info'}</button>
                      </form>
                   ) : (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                         <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                            <span className="font-bold text-gray-900 dark:text-white">Curriculum Plan</span>
                            <button onClick={handleAddModule} className="text-brand-primary text-sm font-bold flex items-center gap-1"><span className="material-icons-outlined text-[18px]">add</span> Add Module</button>
                         </div>
                         
                         <div className="space-y-4">
                            {modules.map((m, idx) => (
                               <div key={m._id} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                                  <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                     <span className="font-bold text-sm text-brand-primary">Module {idx + 1}: {m.title}</span>
                                     <div className="flex items-center gap-3">
                                        <button onClick={() => handleAddLesson(m._id)} className="text-xs text-blue-600 font-medium">+ Lesson</button>
                                        <button onClick={() => handleDeleteModule(m._id)} className="text-gray-400 hover:text-red-500"><span className="material-icons-outlined text-[18px]">delete</span></button>
                                     </div>
                                  </div>
                                  <div className="p-2 space-y-1">
                                     {lessons.filter(l => l.moduleId === m._id).map((l, lIdx) => (
                                        <div key={l._id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                                           <div className="flex items-center gap-3">
                                              <span className="text-[10px] font-bold text-gray-400">{lIdx + 1}</span>
                                              <span className="text-sm font-medium">{l.title}</span>
                                           </div>
                                           <button onClick={() => handleDeleteLesson(l._id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"><span className="material-icons-outlined text-[16px]">close</span></button>
                                        </div>
                                     ))}
                                     {lessons.filter(l => l.moduleId === m._id).length === 0 && <p className="text-center py-4 text-xs text-gray-400 italic">No lessons yet.</p>}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[500px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 mb-3">auto_stories</span>
                   <p className="text-gray-500 font-medium">Select a course to manage content</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
