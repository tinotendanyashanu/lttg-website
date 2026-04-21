import { getCourseWithDetails } from '@/lib/actions/portalAcademy';
import Link from 'next/link';

export default async function CourseOverviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  const result = await getCourseWithDetails(resolvedParams.courseId);

  if (!result.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Error loading course</h2>
        <p>{result.error}</p>
        <Link href="/portal/academy" className="text-brand-primary hover:underline mt-4 inline-block">Back to Academy</Link>
      </div>
    );
  }

  const { course, modules = [], lessons = [], progress, lessonStates = {}, moduleStates = [], nextLessonId, courseQuizPassed, overdue } = result as {
    course: any;
    modules?: any[];
    lessons?: any[];
    progress?: any;
    lessonStates?: Record<string, any>;
    moduleStates?: any[];
    nextLessonId?: string;
    courseQuizPassed?: boolean;
    overdue?: boolean;
  };
  const percent = progress?.progressPercentage || 0;

  // Group lessons by module
  const lessonsByModule: Record<string, any[]> = {};
  modules.forEach((m: any) => {
    lessonsByModule[m._id] = lessons.filter((l: any) => l.moduleId === m._id);
  });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Link href="/portal/academy" className="text-gray-500 hover:text-brand-primary flex items-center gap-1 text-sm font-medium transition-colors">
          <span className="material-icons-outlined text-sm">arrow_back</span>
          Back to Academy
        </Link>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Course Map</h2>
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">
              {percent}%
            </span>
          </div>

          <div className="space-y-4">
            {modules.map((module: any, moduleIndex: number) => {
              const moduleState = moduleStates.find((state: any) => state.moduleId === module._id);
              return (
                <div key={module._id} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Module {moduleIndex + 1}</p>
                      <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                    </div>
                    <span className={`material-icons-outlined text-lg ${moduleState?.isUnlocked ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
                      {moduleState?.isUnlocked ? 'lock_open' : 'lock'}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${moduleState?.completionPercentage || 0}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {moduleState?.completedLessons || 0}/{moduleState?.totalLessons || 0} lessons complete
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="space-y-8">
      <Link href="/portal/academy" className="text-gray-500 hover:text-brand-primary flex items-center gap-1 text-sm font-medium transition-colors">
        <span className="material-icons-outlined text-sm">arrow_back</span>
        Back to Academy
      </Link>

      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
          <span className="material-icons-outlined text-9xl">school</span>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
              course.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              course.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {course.difficultyLevel}
            </span>
            {course.isRequired && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40">
                Required
              </span>
            )}
            {progress?.isCompleted && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">verified</span> Certified
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {course.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            {course.summary || course.description}
          </p>

          <div className="bg-gray-50 dark:bg-[#1f1f22] rounded-xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <span>Your Progress</span>
                <span className={percent === 100 ? "text-green-500" : "text-brand-primary"}>{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${percent === 100 ? 'bg-green-500' : 'bg-brand-primary'}`} 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {overdue && (
                <span className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  Overdue training
                </span>
              )}
              {course.deadlineAt && (
                <span className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-[#27272a] dark:text-gray-300">
                  Deadline: {new Date(course.deadlineAt).toLocaleDateString()}
                </span>
              )}
              {lessons.length > 0 && (
                <Link 
                  href={`/portal/academy/courses/${course._id}/lessons/${nextLessonId || lessons[0]._id}`}
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm shrink-0 whitespace-nowrap"
                >
                  {percent > 0 ? "Continue Course" : "Start Course"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons-outlined text-brand-primary">list_alt</span>
          Course Curriculum
        </h2>
        
        {modules.length === 0 && (
          <div className="text-gray-500 py-8 bg-white dark:bg-[#27272a] rounded-2xl text-center border border-gray-100 dark:border-gray-800">
            No modules added to this course yet.
          </div>
        )}

        {modules.map((module: any, index: number) => (
          <div key={module._id} className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#1f1f22] border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {module.title}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {lessonsByModule[module._id]?.length > 0 ? (
                lessonsByModule[module._id].map((lesson: any, lIndex: number) => {
                  const lessonState = lessonStates[lesson._id];
                  const isCompleted = lessonState?.isCompleted;
                  const isLocked = lessonState?.isLocked;
                  return (
                    <Link
                      key={lesson._id}
                      href={isLocked ? `/portal/academy/courses/${course._id}` : `/portal/academy/courses/${course._id}/lessons/${lesson._id}`}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors group ${isLocked ? 'cursor-not-allowed opacity-70' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted 
                          ? 'border-green-500 bg-green-500 text-white' 
                          : isLocked
                            ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-brand-primary text-transparent'
                      }`}>
                        <span className="material-icons-outlined text-sm" style={{ fontSize: '14px' }}>{isLocked ? 'lock' : 'check'}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium transition-colors ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-brand-primary'}`}>
                          {lIndex + 1}. {lesson.title}
                        </h4>
                        {lesson.summary && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{lesson.summary}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {lesson.lessonType && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                            {lesson.lessonType}
                          </span>
                        )}
                        {lesson.estimatedDuration && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="material-icons-outlined text-[16px]">schedule</span>
                          {lesson.estimatedDuration}m
                        </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-6 py-4 text-sm text-gray-500 italic">No lessons in this module.</div>
              )}
            </div>

            {module.quiz?.questions?.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-[#1f1f22]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Module quiz</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{module.quiz.title || `${module.title} assessment`}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Pass mark: {module.quiz.passingScore}% · Attempt limit: {module.quiz.attemptLimit || 3}
                    </p>
                  </div>
                  {moduleStates.find((state: any) => state.moduleId === module._id)?.quizPassed ? (
                    <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                      Quiz passed
                    </span>
                  ) : moduleStates.find((state: any) => state.moduleId === module._id)?.completedLessons === moduleStates.find((state: any) => state.moduleId === module._id)?.totalLessons ? (
                    <Link
                      href={`/portal/academy/courses/${course._id}/modules/${module._id}/quiz`}
                      className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
                    >
                      Take module quiz
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Take module quiz
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {course.quiz?.questions?.length > 0 && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Final assessment</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{course.quiz.title || 'Course certification quiz'}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Pass mark: {course.quiz.passingScore}% · Attempt limit: {course.quiz.attemptLimit || 3}
              </p>
            </div>
            {courseQuizPassed ? (
              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                Final assessment passed
              </span>
            ) : percent === 100 ? (
              <Link
                href={`/portal/academy/courses/${course._id}/quiz`}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary"
              >
                Take final assessment
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Take final assessment
              </span>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
