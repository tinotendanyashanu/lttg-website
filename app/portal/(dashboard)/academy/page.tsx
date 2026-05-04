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

  const { courses = [], viewer, managerInsights, adminInsights } = result as {
    courses?: any[];
    viewer?: any;
    managerInsights?: any;
    adminInsights?: any;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#27272a] p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              Internal LMS
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academy</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                Structured training for employees, leads, and admins. Complete required courses, track progress across modules, and use assessment results to drive coaching.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Courses</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Required</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{courses.filter((course) => course.isRequired).length}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Completed</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{courses.filter((course) => course.isCompleted).length}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Overdue</p>
              <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{courses.filter((course) => course.overdue).length}</p>
            </div>
          </div>
        </div>
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
            return (
              <Link key={course._id} href={`/portal/academy/courses/${course._id}`}>
                <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full overflow-hidden">
                  {/* Course Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">school</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 flex items-center gap-1 rounded-md ${
                      course.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      course.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {course.difficultyLevel}
                      </span>
                      {course.isRequired && (
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                          Required
                        </span>
                      )}
                      {course.overdue && (
                        <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                          Overdue
                        </span>
                      )}
                    </div>
                    {course.isCompleted && <span className="material-icons-outlined text-green-500" title="Completed">check_circle</span>}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {course.summary || course.description}
                  </p>

                  <div className="mb-5 grid grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-[#1f1f22]">
                      <p className="uppercase tracking-[0.14em] text-[10px]">Modules</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{course.moduleCount}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-[#1f1f22]">
                      <p className="uppercase tracking-[0.14em] text-[10px]">Lessons</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{course.lessonCount}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-[#1f1f22]">
                      <p className="uppercase tracking-[0.14em] text-[10px]">Status</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 capitalize dark:text-white">{String(course.status).replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Progress</span>
                      <span>{course.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${course.isCompleted ? 'bg-green-500' : 'bg-brand-primary'}`} 
                        style={{ width: `${course.progressPercentage}%` }}
                      ></div>
                    </div>
                    {course.deadlineAt && (
                      <p className={`text-xs font-medium ${course.overdue ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        Deadline: {new Date(course.deadlineAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {viewer?.canViewTeamInsights && managerInsights && (
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Training Visibility</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track completion, spot lagging learners, and coach from the Academy instead of chasing updates manually.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-[#1f1f22]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Team size</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{managerInsights.teamSize}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-[#1f1f22]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Avg completion</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{managerInsights.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-gray-400">
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Roles</th>
                  <th className="pb-3 pr-4">Completion</th>
                  <th className="pb-3 pr-4">Avg score</th>
                  <th className="pb-3 pr-4">Required</th>
                  <th className="pb-3 pr-4">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {managerInsights.members.map((member: any) => (
                  <tr key={member.accountId}>
                    <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">{member.fullName}</td>
                    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400">{member.roles.join(', ')}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-200">{member.completionRate}%</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-200">{member.averageScore ?? 'No quiz data'}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-200">{member.requiredCompleted}/{member.requiredTotal}</td>
                    <td className="py-4 pr-4 text-rose-600 dark:text-rose-400">{member.overdueCourses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {viewer?.canManageAcademy && adminInsights && (
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academy Analytics</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Internal completion and assessment signals across the training catalog.</p>
            </div>
            <Link href="/portal/admin/academy" className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary">
              Manage Academy
            </Link>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Courses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{adminInsights.totalCourses}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Active learners</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{adminInsights.activeLearners}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Overdue enrollments</p>
              <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">{adminInsights.overdueEnrollments}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {adminInsights.completionStats.map((stat: any) => (
              <div key={stat.courseId} className="rounded-2xl border border-gray-100 p-5 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{stat.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.learners} learner{stat.learners === 1 ? '' : 's'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Completion</p>
                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{stat.completionRate}%</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Completed: {stat.completedCount}</span>
                  <span>Average score: {stat.averageScore ?? 'No data'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
