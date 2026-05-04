'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminCourse, updateAdminCourse, deleteAdminCourse, getAdminCourseDetails,
  createAdminModule, updateAdminModule, deleteAdminModule,
  createAdminLesson, updateAdminLesson, deleteAdminLesson
} from '@/lib/actions/portal-admin-academy';

// ── Types ────────────────────────────────────────────────────────────────────
type LessonType = 'video' | 'audio' | 'text' | 'file' | 'task';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface Course {
  _id: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  difficultyLevel: string;
  category: string;
  targetRoles: string | string[];
  isPublished: boolean;
  isRequired: boolean;
  deadlineAt?: string;
  estimatedDurationMinutes: number;
  orderIndex: number;
  heroIcon?: string;
  quiz?: any;
  thumbnailUrl?: string;
  updatedAt?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtQuiz(v: any) {
  if (!v?.questions?.length) return '';
  return JSON.stringify(v, null, 2);
}
function cleanQuiz(v: string) {
  const t = v?.trim() || '';
  return t ? t : undefined;
}

const EMPTY_COURSE: Partial<Course> = {
  title: '', slug: '', summary: '', description: '',
  difficultyLevel: 'Beginner', category: 'Operations',
  targetRoles: 'all', isPublished: true, isRequired: false,
  deadlineAt: '', estimatedDurationMinutes: 60, orderIndex: 0,
  heroIcon: 'school', quiz: '', thumbnailUrl: '',
};

// ── MediaUploader component ──────────────────────────────────────────────────
function MediaUploader({
  accept, label, icon, currentUrl, onUploaded, maxMb, showUrlInput
}: {
  accept: string; label: string; icon: string;
  currentUrl?: string; onUploaded: (url: string) => void; maxMb: number;
  showUrlInput?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ uploading: false, progress: 0, error: null });
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [typedUrl, setTypedUrl] = useState(currentUrl || '');

  useEffect(() => { setPreview(currentUrl || null); setTypedUrl(currentUrl || ''); }, [currentUrl]);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFile = useCallback(async (file: File) => {
    setState({ uploading: true, progress: 0, error: null });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academy');

    const ticker = setInterval(() => setState(s => ({ ...s, progress: Math.min(s.progress + 8, 88) })), 300);
    try {
      const res = await fetch('/api/admin/upload-media', { method: 'POST', body: fd });
      clearInterval(ticker);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setState({ uploading: false, progress: 100, error: null });
      setPreview(data.url);
      onUploaded(data.url);
    } catch (err: any) {
      clearInterval(ticker);
      setState({ uploading: false, progress: 0, error: err.message });
    }
  }, [onUploaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const isVideo = accept.includes('video');
  const isAudio = accept.includes('audio');
  const isImage = accept.includes('image');

  return (
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !state.uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${state.uploading ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'}
          ${preview ? 'p-2' : 'p-8'}`}
      >
        {preview && !state.uploading ? (
          <>
            {isVideo && (
              getYouTubeId(preview) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(preview)}?rel=0&modestbranding=1`}
                  className="w-full aspect-video rounded-xl"
                  allowFullScreen
                />
              ) : (
                <video src={preview} className="w-full max-h-48 rounded-xl object-cover" controls />
              )
            )}
            {isAudio && (
              <div className="w-full p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <span className="material-icons-outlined text-purple-600 text-[20px]">headphones</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Audio uploaded</p>
                    <p className="text-xs text-gray-400 truncate">{preview.split('/').pop()}</p>
                  </div>
                </div>
                <audio src={preview} className="w-full" controls />
              </div>
            )}
            {isImage && <img src={preview} alt="Preview" className="w-full max-h-48 rounded-xl object-cover" />}
            {!isVideo && !isAudio && !isImage && (
              <div className="flex items-center gap-2 p-3">
                <span className="material-icons-outlined text-green-500">check_circle</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{preview.split('/').pop()}</span>
              </div>
            )}
            <button
              onClick={e => { e.stopPropagation(); setPreview(null); onUploaded(''); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-900/60 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <span className="material-icons-outlined text-white text-[14px]">close</span>
            </button>
          </>
        ) : state.uploading ? (
          <div className="w-full space-y-3 px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center animate-pulse">
                <span className="material-icons-outlined text-blue-600 text-[20px]">cloud_upload</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Uploading {label}...</p>
                <p className="text-xs text-gray-400">{state.progress}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
              <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[28px]">{icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Drop {label} here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse · max {maxMb}MB</p>
            </div>
          </div>
        )}
      </div>
      {state.error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="material-icons-outlined text-[14px]">error_outline</span>
          {state.error}
        </p>
      )}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={typedUrl}
            onChange={e => { setTypedUrl(e.target.value); onUploaded(e.target.value); }}
            placeholder="Paste video URL (YouTube supported)..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

const LESSON_TYPES: { type: LessonType; label: string; icon: string; color: string }[] = [
  { type: 'video', label: 'Video', icon: 'videocam', color: 'from-blue-500 to-indigo-600' },
  { type: 'audio', label: 'Audio', icon: 'headphones', color: 'from-purple-500 to-violet-600' },
  { type: 'text',  label: 'Text',  icon: 'article',   color: 'from-emerald-500 to-teal-600' },
  { type: 'file',  label: 'File',  icon: 'attach_file', color: 'from-amber-500 to-orange-500' },
  { type: 'task',  label: 'Task',  icon: 'task_alt',  color: 'from-rose-500 to-pink-600' },
];

export default function AcademyManagerClient({ initialCourses }: { initialCourses: any[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(initialCourses?.[0] || null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<any>(EMPTY_COURSE);
  const [moduleForm, setModuleForm] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState<any>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  useEffect(() => {
    if (!selectedCourse || isCreatingCourse) return;
    getAdminCourseDetails(selectedCourse._id).then((res) => {
      if (!res.success) return;
      setModules(res.modules || []);
      setLessons(res.lessons || []);
      setCourseForm({
        ...res.course,
        targetRoles: (res.course?.targetRoles || ['all']).join(', '),
        quiz: fmtQuiz(res.course?.quiz),
        deadlineAt: res.course?.deadlineAt ? new Date(res.course.deadlineAt).toISOString().slice(0, 16) : '',
      });
      if (res.modules?.length > 0) setSelectedModuleId(res.modules[0]._id);
      else setSelectedModuleId(null);
    });
  }, [selectedCourse, isCreatingCourse]);

  useEffect(() => {
    if (!selectedModuleId) { setModuleForm(null); setSelectedLessonId(null); return; }
    const cur = modules.find((m) => m._id === selectedModuleId);
    setModuleForm(cur ? { ...cur, quiz: fmtQuiz(cur.quiz) } : null);
    const modLessons = lessons.filter((l) => l.moduleId === selectedModuleId);
    setSelectedLessonId(prev => (prev && modLessons.some(l => l._id === prev)) ? prev : (modLessons[0]?._id || null));
  }, [selectedModuleId, modules, lessons]);

  useEffect(() => {
    if (!selectedLessonId) { setLessonForm(null); return; }
    const cur = lessons.find((l) => l._id === selectedLessonId);
    setLessonForm(cur ? { ...cur, attachments: (cur.attachments || []).join(', ') } : null);
  }, [selectedLessonId, lessons]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c: Course) => {
      if (filterDifficulty !== 'all' && c.difficultyLevel !== filterDifficulty) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (c.title || '').toLowerCase().includes(q) || (c.summary || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [courses, filterDifficulty, searchQuery]);

  const handleSaveCourse = async () => {
    setIsSavingCourse(true);
    const payload = {
      ...courseForm,
      targetRoles: String(courseForm.targetRoles || '').split(',').map((r: string) => r.trim()).filter(Boolean),
      deadlineAt: courseForm.deadlineAt ? new Date(courseForm.deadlineAt).toISOString() : undefined,
      quiz: cleanQuiz(courseForm.quiz),
    };
    try {
      if (isCreatingCourse) {
        const res = await createAdminCourse(payload);
        const newC: Course = { ...payload, _id: res.courseId as string, updatedAt: new Date().toISOString() };
        setCourses(c => [newC, ...c]); setSelectedCourse(newC); setIsCreatingCourse(false);
      } else if (selectedCourse) {
        await updateAdminCourse(selectedCourse._id, payload);
        const updC: Course = { ...selectedCourse, ...payload, updatedAt: new Date().toISOString() };
        setCourses(c => c.map(x => x._id === selectedCourse._id ? updC : x)); setSelectedCourse(updC);
      }
      router.refresh();
    } catch (err) { console.error(err); } finally { setIsSavingCourse(false); }
  };

  const handleAddModule = async () => {
    if (!selectedCourse) return;
    try {
      const res = await createAdminModule({
        courseId: selectedCourse._id, title: `Module ${modules.length + 1}`,
        description: '', orderIndex: modules.length, unlockStrategy: 'sequential',
      });
      if (res.success) { setModules(m => [...m, res.module]); setSelectedModuleId(res.module._id); }
    } catch (err) { console.error(err); }
  };

  const handleAddLesson = async (mid: string) => {
    if (!selectedCourse) return;
    try {
      const res = await createAdminLesson({
        courseId: selectedCourse._id, moduleId: mid,
        title: `Lesson ${lessons.filter(l => l.moduleId === mid).length + 1}`,
        summary: '', lessonType: 'text', content: '## Lesson Outline\n\nStart typing...',
        orderIndex: lessons.filter(l => l.moduleId === mid).length, estimatedDuration: 10,
      });
      if (res.success) { setLessons(l => [...l, res.lesson]); setSelectedLessonId(res.lesson._id); }
    } catch (err) { console.error(err); }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm?._id) return;
    setIsSavingLesson(true);
    try {
      const res = await updateAdminLesson(lessonForm._id, lessonForm);
      if (res.success) setLessons(l => l.map(x => x._id === lessonForm._id ? res.lesson : x));
    } catch (err) { console.error(err); } finally { setIsSavingLesson(false); }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await deleteAdminLesson(id);
      setLessons(l => l.filter(x => x._id !== id));
      setSelectedLessonId(prev => prev === id ? null : prev);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Search & Filter */}
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl p-5 shadow-sm dark:border-gray-800 dark:bg-[#18181b]/80">
        <div className="relative max-w-md flex-1">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50"
          />
        </div>
        <select
          value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800/50"
        >
          <option value="all">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button
          onClick={() => { setIsCreatingCourse(true); setSelectedCourse(null); setModules([]); setLessons([]); setCourseForm(EMPTY_COURSE); }}
          className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
        >
          <span className="material-icons-outlined">add</span> New Course
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Course Sidebar */}
        <div className="space-y-3">
          <h2 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Course Catalog</h2>
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCourses.map((c: Course) => (
              <button
                key={c._id} onClick={() => { setIsCreatingCourse(false); setSelectedCourse(c); }}
                className={`group w-full rounded-3xl border p-4 text-left transition-all ${
                  selectedCourse?._id === c._id && !isCreatingCourse
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-100 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-[#18181b]'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                    {c.thumbnailUrl ? (
                      <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-icons-outlined">{c.heroIcon || 'school'}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{c.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 truncate">{c.category} · {c.difficultyLevel}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.isPublished ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="space-y-6">
          {(selectedCourse || isCreatingCourse) ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Course Basics */}
              <section className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#18181b]">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isCreatingCourse ? 'Create Course' : 'Course Settings'}</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure your course metadata and curriculum architecture.</p>
                  </div>
                  {!isCreatingCourse && selectedCourse && (
                    <button onClick={() => { if(confirm('Delete course?')) deleteAdminCourse(selectedCourse._id).then(() => router.refresh()); }} className="text-rose-500 hover:text-rose-600 font-semibold text-sm">Delete Course</button>
                  )}
                </div>

                <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Course Thumbnail</p>
                    <MediaUploader
                      accept="image/*" label="cover image" icon="image"
                      currentUrl={courseForm.thumbnailUrl} maxMb={5}
                      onUploaded={u => setCourseForm((f: any) => ({ ...f, thumbnailUrl: u }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Icon</p>
                        <input value={courseForm.heroIcon} onChange={e => setCourseForm((f: any) => ({ ...f, heroIcon: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order</p>
                        <input type="number" value={courseForm.orderIndex} onChange={e => setCourseForm((f: any) => ({ ...f, orderIndex: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title</p>
                        <input value={courseForm.title} onChange={e => setCourseForm((f: any) => ({ ...f, title: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug</p>
                        <input value={courseForm.slug} onChange={e => setCourseForm((f: any) => ({ ...f, slug: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Difficulty</p>
                        <select value={courseForm.difficultyLevel} onChange={e => setCourseForm((f: any) => ({ ...f, difficultyLevel: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                          <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</p>
                        <select value={courseForm.category} onChange={e => setCourseForm((f: any) => ({ ...f, category: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                          <option>Operations</option><option>Sales</option><option>Customer Success</option><option>Compliance</option><option>Product</option><option>Leadership</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Summary</p>
                      <input value={courseForm.summary} onChange={e => setCourseForm((f: any) => ({ ...f, summary: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
                      <textarea value={courseForm.description} onChange={e => setCourseForm((f: any) => ({ ...f, description: e.target.value }))} rows={4} className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                    <div className="flex flex-wrap items-center gap-6 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full transition-all relative ${courseForm.isPublished ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${courseForm.isPublished ? 'translate-x-4' : ''}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={courseForm.isPublished} onChange={e => setCourseForm((f: any) => ({ ...f, isPublished: e.target.checked }))} />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Published</span>
                      </label>
                      <button onClick={handleSaveCourse} disabled={isSavingCourse} className="ml-auto rounded-2xl bg-blue-600 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 hover:shadow-xl active:scale-95">
                        {isSavingCourse ? 'Saving...' : 'Save Course Configuration'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Curriculum Editor */}
              {!isCreatingCourse && selectedCourse && (
                <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                  {/* Modules Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Modules</h3>
                      <button onClick={handleAddModule} className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                        <span className="material-icons-outlined text-[20px]">add</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {modules.map((m, idx) => (
                        <div key={m._id} className="space-y-1">
                          <button
                            onClick={() => setSelectedModuleId(m._id)}
                            className={`w-full text-left p-4 rounded-3xl border transition-all ${
                              selectedModuleId === m._id
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-[#18181b]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module {idx + 1}</span>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className="material-icons-outlined text-[14px]">history</span>
                                {m.estimatedDurationMinutes || 0}m
                              </div>
                            </div>
                            <p className="mt-1 font-bold text-gray-900 dark:text-white text-sm">{m.title}</p>
                          </button>
                          {selectedModuleId === m._id && (
                            <div className="pl-4 border-l-2 border-blue-500/20 ml-4 py-2 space-y-1">
                              {lessons.filter(l => l.moduleId === m._id).map((l) => (
                                <button
                                  key={l._id} onClick={() => setSelectedLessonId(l._id)}
                                  className={`w-full text-left p-3 rounded-2xl transition-all text-sm flex items-center gap-3 ${
                                    selectedLessonId === l._id
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <span className="material-icons-outlined text-[18px]">
                                    {LESSON_TYPES.find(t => t.type === l.lessonType)?.icon || 'article'}
                                  </span>
                                  <span className="truncate flex-1">{l.title}</span>
                                </button>
                              ))}
                              <button onClick={() => handleAddLesson(m._id)} className="w-full text-left p-3 rounded-2xl text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                <span className="material-icons-outlined text-[16px]">add_circle</span> Add Lesson
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editor Column */}
                  <div className="min-h-[600px]">
                    {lessonForm ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="rounded-[2.5rem] border border-gray-100 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-[#18181b]">
                          {/* Lesson Type Tabs */}
                          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-2">
                            {LESSON_TYPES.map(t => (
                              <button
                                key={t.type} onClick={() => setLessonForm((f: any) => ({ ...f, lessonType: t.type }))}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
                                  lessonForm.lessonType === t.type
                                    ? `bg-gradient-to-br ${t.color} text-white shadow-lg`
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                              >
                                <span className="material-icons-outlined text-[18px]">{t.icon}</span>
                                {t.label}
                              </button>
                            ))}
                          </div>

                          <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1 flex-1 max-w-xl">
                                <input
                                  value={lessonForm.title} onChange={e => setLessonForm((f: any) => ({ ...f, title: e.target.value }))}
                                  className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-200"
                                  placeholder="Untitled Lesson"
                                />
                                <input
                                  value={lessonForm.summary} onChange={e => setLessonForm((f: any) => ({ ...f, summary: e.target.value }))}
                                  className="text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                                  placeholder="Add a brief summary..."
                                />
                              </div>
                              <button onClick={() => handleDeleteLesson(lessonForm._id)} className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                <span className="material-icons-outlined">delete</span>
                              </button>
                            </div>

                            <div className="space-y-6">
                              {lessonForm.lessonType === 'video' && (
                                <div className="space-y-4">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Video Content</p>
                                  <MediaUploader
                                    accept="video/*" label="video lesson" icon="videocam"
                                    currentUrl={lessonForm.videoUrl} maxMb={500}
                                    showUrlInput={true}
                                    onUploaded={u => setLessonForm((f: any) => ({ ...f, videoUrl: u }))}
                                  />
                                </div>
                              )}

                              {lessonForm.lessonType === 'audio' && (
                                <div className="space-y-4">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audio Content</p>
                                  <MediaUploader
                                    accept="audio/*" label="audio recording" icon="headphones"
                                    currentUrl={lessonForm.audioUrl} maxMb={100}
                                    onUploaded={u => setLessonForm((f: any) => ({ ...f, audioUrl: u }))}
                                  />
                                </div>
                              )}

                              <div className="space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lesson Content (Markdown)</p>
                                <textarea
                                  value={lessonForm.content} onChange={e => setLessonForm((f: any) => ({ ...f, content: e.target.value }))}
                                  rows={12} className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-6 text-sm font-mono dark:border-gray-700 dark:bg-gray-800"
                                  placeholder="# Introduction..."
                                />
                              </div>

                              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-6">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                                    <div className="flex items-center gap-2">
                                      <input type="number" value={lessonForm.estimatedDuration} onChange={e => setLessonForm((f: any) => ({ ...f, estimatedDuration: parseInt(e.target.value) || 0 }))} className="w-16 bg-transparent border-none p-0 text-sm font-bold focus:ring-0" />
                                      <span className="text-xs text-gray-400">min</span>
                                    </div>
                                  </div>
                                </div>
                                <button onClick={handleSaveLesson} disabled={isSavingLesson} className="rounded-2xl bg-gray-900 dark:bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:shadow-lg transition-all active:scale-95">
                                  {isSavingLesson ? 'Saving...' : 'Save Lesson Changes'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : moduleForm ? (
                      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#18181b] space-y-8 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">Module Settings</h3>
                          <button onClick={() => { if(confirm('Delete module?')) deleteAdminModule(moduleForm._id).then(() => router.refresh()); }} className="text-rose-500 font-semibold text-sm">Delete</button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Module Title</p>
                            <input value={moduleForm.title} onChange={e => setModuleForm((f: any) => ({ ...f, title: e.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm dark:border-gray-700 dark:bg-gray-800" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Index</p>
                            <input type="number" value={moduleForm.orderIndex} onChange={e => setModuleForm((f: any) => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm dark:border-gray-700 dark:bg-gray-800" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
                          <textarea value={moduleForm.description} onChange={e => setModuleForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm dark:border-gray-700 dark:bg-gray-800" />
                        </div>
                        <div className="flex justify-end pt-4">
                          <button onClick={async () => { setIsSavingModule(true); try { await updateAdminModule(moduleForm._id, moduleForm); router.refresh(); } finally { setIsSavingModule(false); } }} className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:shadow-lg transition-all">
                            {isSavingModule ? 'Saving...' : 'Save Module Settings'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400">
                        <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center mb-4">
                          <span className="material-icons-outlined text-[32px]">architecture</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Curriculum Architect</h3>
                        <p className="text-sm mt-1 max-w-xs">Select a module or lesson from the sidebar to begin editing content.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#18181b]/50 p-20 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 animate-bounce">
                <span className="material-icons-outlined text-blue-600 text-[40px]">school</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Academy Command Center</h2>
              <p className="text-gray-500 mt-2 max-w-sm">Select a course from the catalog to manage its curriculum, or create a brand new learning experience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
