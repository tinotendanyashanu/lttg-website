import { getAvailableCourses } from '@/lib/actions/portalAcademy';
import Link from 'next/link';

export default async function AcademyDashboard() {
  const result = await getAvailableCourses();

  if (!result.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Error loading courses</h2>
        <p>{result.error}</p>
      </div>
    );
  }

  const { courses = [], progresses = {} } = result as { courses?: any[], progresses?: Record<string, any> };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academy</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Structured learning to build your skills and certify readiness.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">school</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No courses available</h3>
          <p className="text-gray-500 mt-2">There are currently no published courses available for your role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => {
            const progress = progresses[course._id];
            const percent = progress?.progressPercentage || 0;
            const completed = progress?.isCompleted || false;

            return (
              <Link key={course._id} href={`/portal/academy/courses/${course._id}`}>
                <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-semibold px-2 py-1 flex items-center gap-1 rounded-md ${
                      course.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      course.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {course.difficultyLevel}
                    </span>
                    {completed && <span className="material-icons-outlined text-green-500" title="Completed">check_circle</span>}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {course.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-brand-primary'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
