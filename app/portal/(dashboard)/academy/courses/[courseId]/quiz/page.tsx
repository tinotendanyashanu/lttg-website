import Link from 'next/link';
import { getCourseQuizView } from '@/lib/actions/portalAcademy';
import PortalQuizPlayer from '@/components/academy/PortalQuizPlayer';

export default async function CourseQuizPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  const result = await getCourseQuizView(resolvedParams.courseId);

  if (!result.success) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
        <h1 className="text-2xl font-bold">Unable to load final assessment</h1>
        <p className="mt-2">{result.error}</p>
        <Link href={`/portal/academy/courses/${resolvedParams.courseId}`} className="mt-4 inline-flex rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
          Return to course
        </Link>
      </div>
    );
  }

  const attempts = result.attempts || [];
  const course = result.course;
  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link href={`/portal/academy/courses/${params.courseId}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-primary">
        <span className="material-icons-outlined text-base">arrow_back</span>
        Back to course
      </Link>
      <PortalQuizPlayer
        courseId={params.courseId}
        title={course.quiz?.title || `${course.title} final assessment`}
        subtitle={`Complete the final assessment to certify the course. ${result.canTakeQuiz ? '' : 'Finish all lessons first.'}`}
        questions={course.quiz?.questions || []}
        passingScore={course.quiz?.passingScore || 80}
        attemptLimit={course.quiz?.attemptLimit || 3}
        previousAttempts={attempts.length}
      />
    </div>
  );
}
