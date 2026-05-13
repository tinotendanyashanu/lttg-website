'use client';

import { useState } from 'react';
import { completeLesson } from '@/lib/actions/academy';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function CompleteLessonButton({ 
  courseId, 
  lessonSlug, 
  isCompleted,
  nextLessonSlug,
  courseSlug
}: { 
  courseId: string, 
  lessonSlug: string, 
  isCompleted: boolean,
  nextLessonSlug?: string,
  courseSlug: string
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeLesson(courseId, lessonSlug);
      router.refresh();
      if (nextLessonSlug) {
          router.push(`/portal/partner/dashboard/academy/${courseSlug}/${nextLessonSlug}`);
      } else {
          router.push(`/portal/partner/dashboard/academy/${courseSlug}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to complete lesson');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <button disabled className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg font-bold cursor-default">
        <CheckCircle className="h-5 w-5" />
        <span>Lesson Completed</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      {loading ? 'Completing...' : 'Complete & Continue'}
    </button>
  );
}
