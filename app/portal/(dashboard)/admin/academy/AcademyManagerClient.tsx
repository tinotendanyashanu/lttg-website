'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

const EMPTY_COURSE = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  difficultyLevel: 'Beginner',
  category: 'Operations',
  targetRoles: 'all',
  isPublished: true,
  isRequired: false,
  deadlineAt: '',
  estimatedDurationMinutes: 60,
  orderIndex: 0,
  heroIcon: 'school',
  quiz: '',
};

function formatQuiz(value: any) {
  if (!value?.questions?.length) return '';
  return JSON.stringify(value, null, 2);
}

function cleanQuiz(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export default function AcademyManagerClient({ initialCourses }: { initialCourses: any[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses || []);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(initialCourses?.[0] || null);
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
        title: res.course?.title || '',
        slug: res.course?.slug || '',
        summary: res.course?.summary || '',
        description: res.course?.description || '',
        difficultyLevel: res.course?.difficultyLevel || 'Beginner',
        category: res.course?.category || 'Operations',
        targetRoles: (res.course?.targetRoles || ['all']).join(', '),
        isPublished: Boolean(res.course?.isPublished),
        isRequired: Boolean(res.course?.isRequired),
        deadlineAt: res.course?.deadlineAt ? new Date(res.course.deadlineAt).toISOString().slice(0, 16) : '',
        estimatedDurationMinutes: res.course?.estimatedDurationMinutes || 0,
        orderIndex: res.course?.orderIndex || 0,
        heroIcon: res.course?.heroIcon || 'school',
        quiz: formatQuiz(res.course?.quiz),
      });
      if (res.modules?.length > 0) {
        const nextModule = res.modules[0];
        setSelectedModuleId(nextModule._id);
      } else {
        setSelectedModuleId(null);
      }
    });
  }, [selectedCourse, isCreatingCourse]);

  useEffect(() => {
    if (!selectedModuleId) {
      setModuleForm(null);
      setSelectedLessonId(null);
      return;
    }

    const currentModule = modules.find((module) => module._id === selectedModuleId);
    setModuleForm(currentModule ? {
      ...currentModule,
      quiz: formatQuiz(currentModule.quiz),
    } : null);

    const moduleLessons = lessons.filter((lesson) => lesson.moduleId === selectedModuleId);
    setSelectedLessonId((previous) => {
      if (previous && moduleLessons.some((lesson) => lesson._id === previous)) return previous;
      return moduleLessons[0]?._id || null;
    });
  }, [selectedModuleId, modules, lessons]);

  useEffect(() => {
    if (!selectedLessonId) {
      setLessonForm(null);
      return;
    }

    const currentLesson = lessons.find((lesson) => lesson._id === selectedLessonId);
    setLessonForm(currentLesson ? {
      ...currentLesson,
      attachments: (currentLesson.attachments || []).join(', '),
    } : null);
  }, [selectedLessonId, lessons]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c: any) => {
      if (filterDifficulty !== 'all' && c.difficultyLevel !== filterDifficulty) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (c.title || '').toLowerCase().includes(query) ||
          (c.description || '').toLowerCase().includes(query) ||
          (c.summary || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [courses, filterDifficulty, searchQuery]);

  const handleSaveCourse = async () => {
    setIsSavingCourse(true);
    const payload = {
      ...courseForm,
      targetRoles: String(courseForm.targetRoles || '')
        .split(',')
        .map((role: string) => role.trim())
        .filter(Boolean),
      deadlineAt: courseForm.deadlineAt ? new Date(courseForm.deadlineAt).toISOString() : undefined,
      estimatedDurationMinutes: Number(courseForm.estimatedDurationMinutes) || 0,
      orderIndex: Number(courseForm.orderIndex) || 0,
      quiz: cleanQuiz(courseForm.quiz),
    };

    try {
      if (isCreatingCourse) {
        const response = await createAdminCourse(payload);
        const newCourse = { ...payload, _id: response.courseId, updatedAt: new Date().toISOString() };
        setCourses((current) => [newCourse, ...current]);
        setSelectedCourse(newCourse);
        setIsCreatingCourse(false);
      } else if (selectedCourse) {
        await updateAdminCourse(selectedCourse._id, payload);
        const updatedCourse = { ...selectedCourse, ...payload, updatedAt: new Date().toISOString() };
        setCourses((current) => current.map((course: any) => course._id === selectedCourse._id ? updatedCourse : course));
        setSelectedCourse(updatedCourse);
      }
      router.refresh();
    } catch (error) {
      console.error('Failed to save course', error);
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? Modules and lessons under it will no longer be accessible.')) return;
    try {
      await deleteAdminCourse(courseId);
      const nextCourses = courses.filter((course: any) => course._id !== courseId);
      setCourses(nextCourses);
      setSelectedCourse(nextCourses[0] || null);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete course', error);
    }
  };

  const handleAddModule = async () => {
    if (!selectedCourse) return;
    try {
      const response = await createAdminModule({
        courseId: selectedCourse._id,
        title: `New Module ${modules.length + 1}`,
        description: '',
        orderIndex: modules.length,
        unlockStrategy: 'sequential',
      });
      if (response.success) {
        setModules((current) => [...current, response.module]);
        setSelectedModuleId(response.module._id);
      }
    } catch (error) {
      console.error('Failed to create module', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete module and all its lessons?')) return;
    try {
      await deleteAdminModule(moduleId);
      const nextModules = modules.filter((module) => module._id !== moduleId);
      const nextLessons = lessons.filter((lesson) => lesson.moduleId !== moduleId);
      setModules(nextModules);
      setLessons(nextLessons);
      setSelectedModuleId(nextModules[0]?._id || null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!selectedCourse) return;
    try {
      const response = await createAdminLesson({
        courseId: selectedCourse._id,
        moduleId,
        title: `New Lesson ${lessons.filter((lesson) => lesson.moduleId === moduleId).length + 1}`,
        summary: '',
        lessonType: 'text',
        content: '## Lesson outline\n\n- Add the core lesson content here.',
        orderIndex: lessons.filter((lesson) => lesson.moduleId === moduleId).length,
        estimatedDuration: 10,
      });
      if (response.success) {
        setLessons((current) => [...current, response.lesson]);
        setSelectedLessonId(response.lesson._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete lesson?')) return;
    try {
      await deleteAdminLesson(lessonId);
      const nextLessons = lessons.filter((lesson) => lesson._id !== lessonId);
      setLessons(nextLessons);
      setSelectedLessonId(nextLessons.find((lesson) => lesson.moduleId === selectedModuleId)?._id || null);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedModuleLessons = useMemo(
    () => lessons.filter((lesson) => lesson.moduleId === selectedModuleId).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    [lessons, selectedModuleId]
  );

  const handleSaveModule = async () => {
    if (!moduleForm?._id) return;
    setIsSavingModule(true);
    try {
      const response = await updateAdminModule(moduleForm._id, {
        title: moduleForm.title,
        slug: moduleForm.slug,
        description: moduleForm.description,
        orderIndex: Number(moduleForm.orderIndex) || 0,
        unlockStrategy: moduleForm.unlockStrategy || 'sequential',
        estimatedDurationMinutes: Number(moduleForm.estimatedDurationMinutes) || 0,
        quiz: cleanQuiz(moduleForm.quiz || ''),
      });
      if (response.success) {
        setModules((current) => current.map((module: any) => module._id === moduleForm._id ? response.module : module));
      }
    } catch (error) {
      console.error('Failed to save module', error);
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm?._id) return;
    setIsSavingLesson(true);
    try {
      const response = await updateAdminLesson(lessonForm._id, {
        title: lessonForm.title,
        slug: lessonForm.slug,
        summary: lessonForm.summary,
        lessonType: lessonForm.lessonType,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl,
        attachments: lessonForm.attachments,
        estimatedDuration: Number(lessonForm.estimatedDuration) || 0,
        orderIndex: Number(lessonForm.orderIndex) || 0,
      });
      if (response.success) {
        setLessons((current) => current.map((lesson: any) => lesson._id === lessonForm._id ? response.lesson : lesson));
      }
    } catch (error) {
      console.error('Failed to save lesson', error);
    } finally {
      setIsSavingLesson(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
        <div className="relative max-w-md flex-1">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search academy catalog..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <select
          value={filterDifficulty}
          onChange={(event) => setFilterDifficulty(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="all">All difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button
          onClick={() => {
            setIsCreatingCourse(true);
            setSelectedCourse(null);
            setModules([]);
            setLessons([]);
            setSelectedModuleId(null);
            setSelectedLessonId(null);
            setCourseForm(EMPTY_COURSE);
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          New Course
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-3">
          {filteredCourses.map((course: any) => (
            <button
              key={course._id}
              onClick={() => {
                setIsCreatingCourse(false);
                setSelectedCourse(course);
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                selectedCourse?._id === course._id && !isCreatingCourse
                  ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                  : 'border-gray-100 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-[#27272a]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{course.category || 'Operations'} · {course.difficultyLevel}</p>
                </div>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${course.isPublished ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {(selectedCourse || isCreatingCourse) ? (
            <>
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isCreatingCourse ? 'Create Academy Course' : 'Course Settings'}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Control metadata, required-training policy, visibility, and the final certification quiz.</p>
                  </div>
                  {!isCreatingCourse && selectedCourse && (
                    <button onClick={() => handleDeleteCourse(selectedCourse._id)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/20">
                      Delete Course
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Title</p>
                    <input value={courseForm.title} onChange={(event) => setCourseForm((current: any) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Slug</p>
                    <input value={courseForm.slug} onChange={(event) => setCourseForm((current: any) => ({ ...current, slug: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Difficulty</p>
                    <select value={courseForm.difficultyLevel} onChange={(event) => setCourseForm((current: any) => ({ ...current, difficultyLevel: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Category</p>
                    <select value={courseForm.category} onChange={(event) => setCourseForm((current: any) => ({ ...current, category: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Success">Customer Success</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Product">Product</option>
                      <option value="Leadership">Leadership</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Summary</p>
                  <input value={courseForm.summary} onChange={(event) => setCourseForm((current: any) => ({ ...current, summary: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Description</p>
                  <textarea value={courseForm.description} onChange={(event) => setCourseForm((current: any) => ({ ...current, description: event.target.value }))} rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Target roles</p>
                    <input value={courseForm.targetRoles} onChange={(event) => setCourseForm((current: any) => ({ ...current, targetRoles: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Duration (min)</p>
                    <input type="number" value={courseForm.estimatedDurationMinutes} onChange={(event) => setCourseForm((current: any) => ({ ...current, estimatedDurationMinutes: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Order</p>
                    <input type="number" value={courseForm.orderIndex} onChange={(event) => setCourseForm((current: any) => ({ ...current, orderIndex: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Hero icon</p>
                    <input value={courseForm.heroIcon} onChange={(event) => setCourseForm((current: any) => ({ ...current, heroIcon: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-[#1f1f22] dark:text-gray-300">
                    <input type="checkbox" checked={courseForm.isPublished} onChange={(event) => setCourseForm((current: any) => ({ ...current, isPublished: event.target.checked }))} />
                    Published
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-[#1f1f22] dark:text-gray-300">
                    <input type="checkbox" checked={courseForm.isRequired} onChange={(event) => setCourseForm((current: any) => ({ ...current, isRequired: event.target.checked }))} />
                    Required training
                  </label>
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Deadline</p>
                  <input type="datetime-local" value={courseForm.deadlineAt} onChange={(event) => setCourseForm((current: any) => ({ ...current, deadlineAt: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>

                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Final quiz JSON</p>
                  <textarea value={courseForm.quiz} onChange={(event) => setCourseForm((current: any) => ({ ...current, quiz: event.target.value }))} rows={8} placeholder='{"title":"Final assessment","passingScore":80,"attemptLimit":3,"questions":[]}' className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 font-mono text-xs focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveCourse} disabled={isSavingCourse} className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:opacity-50">
                    {isSavingCourse ? 'Saving...' : isCreatingCourse ? 'Create Course' : 'Save Course'}
                  </button>
                </div>
              </section>

              {!isCreatingCourse && selectedCourse && (
                <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Modules</h3>
                      <button onClick={handleAddModule} className="rounded-xl bg-brand-primary/10 px-3 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20">
                        Add Module
                      </button>
                    </div>
                    <div className="space-y-3">
                      {modules.map((module: any, index: number) => (
                        <button
                          key={module._id}
                          onClick={() => setSelectedModuleId(module._id)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all ${
                            selectedModuleId === module._id
                              ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                              : 'border-gray-100 hover:border-gray-300 dark:border-gray-800'
                          }`}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Module {index + 1}</p>
                          <p className="mt-1 font-semibold text-gray-900 dark:text-white">{module.title}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{module.unlockStrategy || 'sequential'} · {module.estimatedDurationMinutes || 0} min</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {moduleForm ? (
                      <>
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Module Editor</h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Define sequencing, quiz gating, and module metadata.</p>
                            </div>
                            <button onClick={() => handleDeleteModule(moduleForm._id)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/20">
                              Delete Module
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Title</p>
                              <input value={moduleForm.title || ''} onChange={(event) => setModuleForm((current: any) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Slug</p>
                              <input value={moduleForm.slug || ''} onChange={(event) => setModuleForm((current: any) => ({ ...current, slug: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Unlock strategy</p>
                              <select value={moduleForm.unlockStrategy || 'sequential'} onChange={(event) => setModuleForm((current: any) => ({ ...current, unlockStrategy: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                                <option value="sequential">Sequential</option>
                                <option value="quiz">Quiz gated</option>
                              </select>
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Order</p>
                              <input type="number" value={moduleForm.orderIndex || 0} onChange={(event) => setModuleForm((current: any) => ({ ...current, orderIndex: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Description</p>
                            <textarea value={moduleForm.description || ''} onChange={(event) => setModuleForm((current: any) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                          </div>

                          <div className="mt-4">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Module quiz JSON</p>
                            <textarea value={moduleForm.quiz || ''} onChange={(event) => setModuleForm((current: any) => ({ ...current, quiz: event.target.value }))} rows={8} placeholder='{"title":"Module quiz","passingScore":80,"attemptLimit":3,"questions":[]}' className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 font-mono text-xs focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                          </div>

                          <div className="mt-6 flex justify-end">
                            <button onClick={handleSaveModule} disabled={isSavingModule} className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:opacity-50">
                              {isSavingModule ? 'Saving module...' : 'Save Module'}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lessons</h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a lesson to edit or add a new one to the current module.</p>
                            </div>
                            <button onClick={() => handleAddLesson(moduleForm._id)} className="rounded-xl bg-brand-primary/10 px-3 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20">
                              Add Lesson
                            </button>
                          </div>

                          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <div className="space-y-3">
                              {selectedModuleLessons.map((lesson: any, index: number) => (
                                <button
                                  key={lesson._id}
                                  onClick={() => setSelectedLessonId(lesson._id)}
                                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                    selectedLessonId === lesson._id
                                      ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                                      : 'border-gray-100 hover:border-gray-300 dark:border-gray-800'
                                  }`}
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Lesson {index + 1}</p>
                                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{lesson.title}</p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{lesson.lessonType || 'text'} · {lesson.estimatedDuration || 0} min</p>
                                </button>
                              ))}
                            </div>

                            {lessonForm ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Lesson Editor</h4>
                                  <button onClick={() => handleDeleteLesson(lessonForm._id)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/20">
                                    Delete Lesson
                                  </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Title</p>
                                    <input value={lessonForm.title || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Slug</p>
                                    <input value={lessonForm.slug || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, slug: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Lesson type</p>
                                    <select value={lessonForm.lessonType || 'text'} onChange={(event) => setLessonForm((current: any) => ({ ...current, lessonType: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                                      <option value="text">Text</option>
                                      <option value="video">Video</option>
                                      <option value="file">File</option>
                                      <option value="task">Task</option>
                                    </select>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Duration (min)</p>
                                    <input type="number" value={lessonForm.estimatedDuration || 0} onChange={(event) => setLessonForm((current: any) => ({ ...current, estimatedDuration: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                  </div>
                                </div>

                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Summary</p>
                                  <input value={lessonForm.summary || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, summary: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                </div>

                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Video URL</p>
                                  <input value={lessonForm.videoUrl || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, videoUrl: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                </div>

                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Attachments (CSV URLs)</p>
                                  <input value={lessonForm.attachments || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, attachments: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                </div>

                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Content (Markdown)</p>
                                  <textarea value={lessonForm.content || ''} onChange={(event) => setLessonForm((current: any) => ({ ...current, content: event.target.value }))} rows={14} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                                </div>

                                <div className="flex justify-end">
                                  <button onClick={handleSaveLesson} disabled={isSavingLesson} className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:opacity-50">
                                    {isSavingLesson ? 'Saving lesson...' : 'Save Lesson'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                Select a lesson to edit its content.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        Add a module to start building the curriculum.
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Select a course to manage the Academy catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
