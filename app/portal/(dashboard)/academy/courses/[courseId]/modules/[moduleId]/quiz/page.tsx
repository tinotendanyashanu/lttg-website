import Link from 'next/link';
import { getModuleQuizView } from '@/lib/actions/portalAcademy';
import PortalQuizPlayer from '@/components/academy/PortalQuizPlayer';

export default async function ModuleQuizPage({ params }: { params: Promise<{ courseId: string; moduleId: string }> }) {
  const resolvedParams = await params;
  const result = await getModuleQuizView(resolvedParams.courseId, resolvedParams.moduleId);

  if (!result.success) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
        <h1 className="text-2xl font-bold">Unable to load module assessment</h1>
        <p className="mt-2">{result.error}</p>
        <Link href={`/portal/academy/courses/${resolvedParams.courseId}`} className="mt-4 inline-flex rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
          Return to course
        </Link>
      </div>
    );
  }

  const attempts = result.attempts || [];
  const module = result.module;
  if (!module) {
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
        moduleId={params.moduleId}
        title={module.quiz?.title || `${module.title} assessment`}
        subtitle={module.description}
        questions={module.quiz?.questions || []}
        passingScore={module.quiz?.passingScore || 80}
        attemptLimit={module.quiz?.attemptLimit || 3}
        previousAttempts={attempts.length}
      />
    </div>
  );
}
