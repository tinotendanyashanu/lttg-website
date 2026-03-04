'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLessonContent, markLessonComplete } from '@/lib/actions/portalAcademy';

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, lessonId } = params as { courseId: string, lessonId: string };

  const [loading, setLoading] = useState(true);
  const [learningData, setLearningData] = useState<any>(null);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

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
      // In a real app we'd determine the next lesson and navigate there
      // For MVP just go back to course overview
      router.push(`/portal/academy/courses/${courseId}`);
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

  const { lesson, moduleTitle, courseTitle, progress } = learningData;
  const isCompleted = progress?.completedLessonIds?.includes(lesson._id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 space-x-2">
        <Link href="/portal/academy" className="hover:text-brand-primary transition-colors">Academy</Link>
        <span className="material-icons-outlined text-[16px]">chevron_right</span>
        <Link href={`/portal/academy/courses/${courseId}`} className="hover:text-brand-primary transition-colors truncate max-w-[150px]">{courseTitle}</Link>
        <span className="material-icons-outlined text-[16px]">chevron_right</span>
        <span className="truncate max-w-[200px] text-gray-900 dark:text-gray-200">{moduleTitle}</span>
      </nav>

      <div className="bg-white dark:bg-[#1f1f22] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        {lesson.videoUrl ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center relative">
             {/* If it's a youtube/vimeo link, an iframe would go here. 
                 For MVP, assuming standard html video or just a placeholder if URL is arbitrary */}
            <video 
              src={lesson.videoUrl} 
              controls 
              className="w-full h-full object-contain"
              poster="/placeholder-video.jpg"
            />
          </div>
        ) : (
          <div className="h-32 bg-linear-to-r from-brand-primary to-brand-secondary flex items-center px-8 relative overflow-hidden">
             <span className="material-icons-outlined text-white/20 text-9xl absolute -right-4 -bottom-4">menu_book</span>
             <h1 className="text-3xl font-bold text-white relative z-10 wrap-break-word pr-12 leading-tight flex-1">
                {lesson.title}
             </h1>
          </div>
        )}

        <div className="p-8 md:p-12">
          {lesson.videoUrl && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {lesson.title}
            </h1>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 font-serif leading-relaxed"
               dangerouslySetInnerHTML={{ __html: lesson.content || '<p>No content provided.</p>' }} 
          />
          
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

          <div className="mt-12 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
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
               disabled={completing || isCompleted}
               className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                 isCompleted
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
  );
}
