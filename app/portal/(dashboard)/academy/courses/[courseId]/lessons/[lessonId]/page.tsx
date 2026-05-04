'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLessonContent, markLessonComplete } from '@/lib/actions/portalAcademy';
import MarkdownRenderer from '@/components/portal/knowledge-base/MarkdownRenderer';

interface LearningData {
  lesson: any;
  module: any;
  course: any;
  progress: any;
  lessonState: any;
  moduleStates: any[];
  navigation: { previousLessonId?: string; nextLessonId?: string };
  isLocked: boolean;
  unlockReason?: string;
}

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, lessonId } = params as { courseId: string, lessonId: string };

  const [loading, setLoading] = useState(true);
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    async function load() {
      const res = await getLessonContent(lessonId);
      if (res.success) {
        setLearningData(res);
      } else {
        setError(res.error || 'Failed to load lesson');
      }
      setLoading(false);
    }
    load();
  }, [lessonId]);

  const handleComplete = async () => {
    setCompleting(true);
    const res = await markLessonComplete(courseId, lessonId);
    if (res.success) {
      if (res.needsModuleQuiz && learningData?.module?._id) {
        router.push(`/portal/academy/courses/${courseId}/modules/${learningData.module._id}/quiz`);
      } else if (res.needsCourseQuiz) {
        router.push(`/portal/academy/courses/${courseId}/quiz`);
      } else if (res.nextLessonId) {
        router.push(`/portal/academy/courses/${courseId}/lessons/${res.nextLessonId}`);
      } else {
        router.push(`/portal/academy/courses/${courseId}`);
      }
      router.refresh(); // Refresh the course page to show updated progress
    } else {
      alert("Failed to mark complete: " + res.error);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !learningData) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
        <span className="material-icons-outlined text-4xl mb-2">error_outline</span>
        <h2 className="text-xl font-bold">Error loading lesson</h2>
        <p>{error}</p>
        <Link href={`/portal/academy/courses/${courseId}`} className="text-brand-primary hover:underline mt-4 inline-block font-semibold">Back to Course</Link>
      </div>
    );
  }

  const { lesson, module, course, progress, lessonState, moduleStates, navigation, isLocked, unlockReason } = learningData;
  const isCompleted = lessonState?.isCompleted;
  const currentModuleState = moduleStates?.find((state: any) => state.moduleId === module?._id);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 space-x-2">
        <Link href="/portal/academy" className="hover:text-brand-primary transition-colors">Academy</Link>
        <span className="material-icons-outlined text-[16px]">chevron_right</span>
        <Link href={`/portal/academy/courses/${courseId}`} className="hover:text-brand-primary transition-colors truncate max-w-[150px]">{course?.title}</Link>
        <span className="material-icons-outlined text-[16px]">chevron_right</span>
        <span className="truncate max-w-[200px] text-gray-900 dark:text-gray-200">{module?.title}</span>
      </nav>

      <div className="bg-white dark:bg-[#1f1f22] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        {lesson.videoUrl || lesson.audioUrl ? (
          <div className={`w-full ${lesson.videoUrl ? 'aspect-video' : 'py-12'} bg-black flex flex-col items-center justify-center relative`}>
            {lesson.videoUrl ? (
              getYouTubeId(lesson.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(lesson.videoUrl)}?rel=0&modestbranding=1`}
                  title={lesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={lesson.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  poster="/placeholder-video.jpg"
                />
              )
            ) : (
              <div className="w-full max-w-2xl px-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center animate-pulse">
                    <span className="material-icons-outlined text-brand-primary text-4xl">headphones</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-xl font-bold mb-1">{lesson.title}</h2>
                    <p className="text-gray-400 text-sm">Audio Lesson</p>
                  </div>
                </div>
                <audio src={lesson.audioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-linear-to-r from-brand-primary to-brand-secondary flex items-center px-12 relative overflow-hidden">
             <span className="material-icons-outlined text-white/20 text-[180px] absolute -right-8 -bottom-8 transform rotate-12">menu_book</span>
             <h1 className="text-4xl font-black text-white relative z-10 wrap-break-word pr-12 leading-tight flex-1">
                {lesson.title}
             </h1>
          </div>
        )}

        <div className="p-8 md:p-12">
          {(lesson.videoUrl || lesson.audioUrl) && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {lesson.title}
            </h1>
          )}

          {lesson.summary && (
            <p className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-[#18181b] dark:text-gray-300">
              {lesson.summary}
            </p>
          )}

          {isLocked ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined">lock</span>
                <div>
                  <h2 className="font-bold">Lesson locked</h2>
                  <p className="mt-1 text-sm">{unlockReason}</p>
                </div>
              </div>
              <Link href={`/portal/academy/courses/${courseId}`} className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">
                Return to course
              </Link>
            </div>
          ) : (
            <MarkdownRenderer content={lesson.content || 'No content provided.'} />
          )}
          
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="material-icons-outlined">attach_file</span>
                Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lesson.attachments.map((att: string, i: number) => (
                  <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-brand-primary transition-colors group">
                    <span className="material-icons-outlined text-brand-primary">description</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex-1">{att.split('/').pop() || `Attachment ${i+1}`}</span>
                    <span className="material-icons-outlined text-gray-400 group-hover:text-brand-primary">download</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
             <div className="flex items-center gap-3">
               {isCompleted && (
                 <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
                   <span className="material-icons-outlined">check_circle</span>
                   Completed
                 </div>
               )}
             </div>
             
             <button
               onClick={handleComplete}
               disabled={completing || isCompleted || isLocked}
               className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                 isCompleted || isLocked
                   ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                   : 'bg-brand-primary hover:bg-brand-secondary text-white hover:shadow-md'
               }`}
             >
                {completing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isCompleted ? 'Marked as Complete' : 'Mark Complete & Continue'}
                    {!isCompleted && <span className="material-icons-outlined text-sm">arrow_forward</span>}
                  </>
                )}
             </button>
          </div>
        </div>
      </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Current module</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{module?.title}</h2>
          {module?.description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
          )}
          <div className="mt-5 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${currentModuleState?.completionPercentage || 0}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {currentModuleState?.completedLessons || 0}/{currentModuleState?.totalLessons || 0} lessons complete
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Navigation</p>
          <div className="mt-4 space-y-3">
            {navigation?.previousLessonId ? (
              <Link href={`/portal/academy/courses/${courseId}/lessons/${navigation.previousLessonId}`} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-primary hover:text-brand-primary dark:border-gray-800 dark:text-gray-300">
                <span>Previous lesson</span>
                <span className="material-icons-outlined text-base">arrow_back</span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400 dark:border-gray-800">This is the first lesson.</div>
            )}

            {navigation?.nextLessonId ? (
              <Link href={`/portal/academy/courses/${courseId}/lessons/${navigation.nextLessonId}`} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-primary hover:text-brand-primary dark:border-gray-800 dark:text-gray-300">
                <span>Next lesson</span>
                <span className="material-icons-outlined text-base">arrow_forward</span>
              </Link>
            ) : (
              <Link href={`/portal/academy/courses/${courseId}`} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-primary hover:text-brand-primary dark:border-gray-800 dark:text-gray-300">
                <span>Back to course</span>
                <span className="material-icons-outlined text-base">menu_book</span>
              </Link>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 dark:bg-[#18181b]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Course progress</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{progress?.progressPercentage || 0}%</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Completion stays sequential. Lessons and module quizzes unlock the next stage.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
