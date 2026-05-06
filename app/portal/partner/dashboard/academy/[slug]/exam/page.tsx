import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import ExamInterface from '@/components/academy/ExamInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

import { Course as ICourse } from '@/types';

export const dynamic = 'force-dynamic';

async function getCourseWithExam(slug: string) {
  await dbConnect();
  const course = await Course.findOne({ slug }).lean() as unknown as ICourse;
  return course;
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/partner/login'); // Should be handled by middleware mostly

  const course = await getCourseWithExam(slug);

  if (!course) {
    return <div>Course not found</div>;
  }

  if (!course.exam || course.exam.questions.length === 0) {
    return (
        <div className="max-w-2xl mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Exam Available</h2>
            <p className="text-slate-500 mb-8">This course does not currently have a final exam.</p>
            <Link href={`/partner/dashboard/academy/${slug}`} className="text-emerald-600 hover:underline font-bold">
                Return to Course
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link 
            href={`/partner/dashboard/academy/${slug}`} 
            className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Course
        </Link>

        {/* Introduction / Start Screen could go here, but jumping straight to interface for now */}
        <ExamInterface 
            courseId={course._id.toString()} 
            courseTitle={course.title}
            questions={course.exam.questions}
            passingScore={course.exam.passingScore}
        />
      </div>
    </div>
  );
}
