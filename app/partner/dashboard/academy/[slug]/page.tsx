import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';

import { getPartnerProgress } from '@/lib/actions/academy';
import { redirect, notFound } from 'next/navigation';
import { Course } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PlayCircle, CheckCircle, Lock, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCourse(slug: string) {
  await dbConnect();
  const course = await CourseModel.findOne({ slug }).lean() as unknown as Course;
  return course;
}

export default async function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const course = await getCourse(params.slug);
  if (!course) notFound();

  const progressList = await getPartnerProgress(session.user.email);
  const progress = progressList.find((p) => p.courseId === course._id.toString());
  const completedLessons = progress?.completedLessons || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <Link href="/partner/dashboard/academy" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Academy
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-64 w-full">
               <Image 
                src={course.thumbnailUrl} 
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent flex items-end">
                  <div className="p-8 text-white">
                      <span className="inline-block px-2 py-1 rounded bg-purple-600 text-xs font-bold uppercase tracking-wide mb-2">{course.category}</span>
                      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                      <p className="text-slate-200 max-w-2xl">{course.description}</p>
                  </div>
              </div>
          </div>

          <div className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Course Content</h3>
              <div className="space-y-4">
                  {course.lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.includes(lesson.slug);
                       // Simple logic: First lesson always unlocked, others unlock if previous completed
                      const isLocked = index > 0 && !completedLessons.includes(course.lessons[index - 1].slug);
                      
                      return (
                          <Link 
                            key={lesson.slug} 
                            href={isLocked ? '#' : `/partner/dashboard/academy/${course.slug}/${lesson.slug}`}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                isLocked 
                                ? 'bg-slate-50 border-slate-100 opacity-75 cursor-not-allowed' 
                                : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm'
                            }`}
                          >
                              <div className="flex items-center space-x-4">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 
                                      isLocked ? 'bg-slate-200 text-slate-500' : 
                                      'bg-purple-100 text-purple-600'
                                  }`}>
                                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : 
                                       isLocked ? <Lock className="h-4 w-4" /> :
                                       <PlayCircle className="h-5 w-5" />}
                                  </div>
                                  <div>
                                      <p className={`font-medium ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{index + 1}. {lesson.title}</p>
                                      <p className="text-xs text-slate-500">{lesson.duration}</p>
                                  </div>
                              </div>
                              {isCompleted && <span className="text-xs font-bold text-emerald-600">COMPLETED</span>}
                          </Link>
                      );
                  })}

                  {/* Final Exam Link */}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                      <Link 
                          href={`/partner/dashboard/academy/${course.slug}/exam`}
                          className="flex items-center justify-between p-4 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-all group"
                      >
                          <div className="flex items-center space-x-4">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Award className="h-5 w-5" />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900">Final Exam</p>
                                  <p className="text-xs text-slate-500">Pass to complete the course</p>
                              </div>
                          </div>
                          <span className="text-sm font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">Start Exam &rarr;</span>
                      </Link>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
