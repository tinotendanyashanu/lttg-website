import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { getPartnerProgress, completeLesson } from '@/lib/actions/academy';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, PlayCircle } from 'lucide-react';

import { Course, Lesson, PartnerProgress } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CompleteLessonButton from '@/components/academy/CompleteLessonButton';

export const dynamic = 'force-dynamic';

async function getLessonData(slug: string) {
  await dbConnect();
  const course = await CourseModel.findOne({ slug }).lean() as unknown as Course;
  return course;
}

export default async function LessonPage(props: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.email) return null;

  const course = await getLessonData(params.slug);
  if (!course) notFound();

  const lesson = course.lessons.find((l) => l.slug === params.lessonSlug);
  if (!lesson) notFound();

  const currentIndex = course.lessons.findIndex((l) => l.slug === params.lessonSlug);
  const nextLesson = course.lessons[currentIndex + 1];
  const prevLesson = course.lessons[currentIndex - 1];

  const progressList = await getPartnerProgress(session.user.email);
  const progress = progressList.find((p) => p.courseId === course._id.toString());
  const isCompleted = progress?.completedLessons?.includes(lesson.slug) || false;

  return (
    <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
            <Link href={`/partner/dashboard/academy/${params.slug}`} className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Link>
            <div className="flex items-center space-x-4">
                {prevLesson && (
                    <Link href={`/partner/dashboard/academy/${params.slug}/${prevLesson.slug}`} className="text-sm font-medium text-slate-500 hover:text-purple-600">
                        &larr; Previous
                    </Link>
                )}
                {nextLesson && (
                    <Link href={`/partner/dashboard/academy/${params.slug}/${nextLesson.slug}`} className="text-sm font-medium text-slate-500 hover:text-purple-600">
                        Next &rarr;
                    </Link>
                )}
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            {/* Hero Image Section */}
            <div className="relative h-64 w-full bg-slate-900 group">
                 <img 
                    src={course.thumbnailUrl} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500"
                 />
                 <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                     <p className="text-white text-sm font-medium flex items-center">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {lesson.duration} Read
                     </p>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                        <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                 </div>
            </div>

            <div className="p-8 flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">{lesson.title}</h1>
                
                <div className="prose prose-slate max-w-none mb-12">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.content}
                    </ReactMarkdown>
                </div>

                {lesson.imageUrls && lesson.imageUrls.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Lesson Visuals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lesson.imageUrls.map((url, idx) => (
                                <div key={idx} className="relative h-48 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={url} alt={`Screenshot ${idx + 1}`} className="object-cover w-full h-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-slate-100 pt-8 flex justify-end">
                    <CompleteLessonButton 
                        courseId={course._id.toString()}
                        lessonSlug={lesson.slug}
                        isCompleted={isCompleted}
                        nextLessonSlug={nextLesson?.slug}
                        courseSlug={course.slug}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}
