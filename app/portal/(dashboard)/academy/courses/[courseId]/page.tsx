import { getCourseWithDetails } from '@/lib/actions/portalAcademy';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CourseOverviewPage({ params }: { params: { courseId: string } }) {
  const result = await getCourseWithDetails(params.courseId);

  if (!result.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Error loading course</h2>
        <p>{result.error}</p>
        <Link href="/portal/academy" className="text-brand-primary hover:underline mt-4 inline-block">Back to Academy</Link>
      </div>
    );
  }

  const { course, modules = [], lessons = [], progress } = result as { course: any, modules?: any[], lessons?: any[], progress?: any };
  const percent = progress?.progressPercentage || 0;

  // Group lessons by module
  const lessonsByModule: Record<string, any[]> = {};
  modules.forEach((m: any) => {
    lessonsByModule[m._id] = lessons.filter((l: any) => l.moduleId === m._id);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            {course.description}
          </p>

          <div className="bg-gray-50 dark:bg-[#1f1f22] rounded-xl p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-6">
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
            {lessons.length > 0 && (
              <Link 
                href={`/portal/academy/courses/${course._id}/lessons/${lessons[0]._id}`}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm shrink-0 whitespace-nowrap"
              >
                {percent > 0 ? "Continue" : "Start Course"}
              </Link>
            )}
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
                  const isCompleted = progress?.completedLessonIds?.includes(lesson._id);
                  return (
                    <Link 
                      key={lesson._id} 
                      href={`/portal/academy/courses/${course._id}/lessons/${lesson._id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted 
                          ? 'border-green-500 bg-green-500 text-white' 
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-brand-primary text-transparent'
                      }`}>
                        <span className="material-icons-outlined text-sm" style={{ fontSize: '14px' }}>check</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium transition-colors ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-brand-primary'}`}>
                          {lIndex + 1}. {lesson.title}
                        </h4>
                      </div>

                      {lesson.estimatedDuration && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="material-icons-outlined text-[16px]">schedule</span>
                          {lesson.estimatedDuration}m
                        </div>
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className="px-6 py-4 text-sm text-gray-500 italic">No lessons in this module.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
