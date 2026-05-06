import { auth } from '@/auth';
import { getCourses } from '@/lib/actions/academy';
import PartnerModel from '@/models/Partner';
import dbConnect from '@/lib/mongodb';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { Partner, Course } from '@/types';



export default async function AcademyPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const courses = await getCourses() as unknown as Course[];
  await dbConnect();
  const partner = await PartnerModel.findOne({ email: session.user.email }).select('partnerType partnerProgress').lean() as unknown as Partner;
  const progressList = partner?.partnerProgress || [];
  
  // Map new partnerType values to legacy academy audience types
  const audienceType = partner?.partnerType === 'influencer' ? 'creator' : 'standard';

  const filteredCourses = courses.filter((course) => {
      if (!course.targetAudience || course.targetAudience.includes('all')) return true;
      return course.targetAudience.includes(audienceType);
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Partner Academy</h2>
        <p className="text-slate-500">Level up your skills and earn more commissions.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
              const progress = progressList.find((p) => p.courseId === course._id.toString());
              const percent = progress?.progressPercentage || 0;
              const isCompleted = progress?.isCompleted;

              return (
                  <Link key={course._id} href={`/partner/dashboard/academy/${course.slug}`} className="group block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 w-full">
                          <Image 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                              <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-white/90 backdrop-blur text-slate-900`}>
                                  {course.level}
                              </span>
                          </div>
                      </div>
                      <div className="p-6">
                           <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">{course.category}</span>
                               {isCompleted && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">{course.title}</h3>
                           <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                           
                           {/* Progress Bar */}
                           <div className="space-y-2">
                               <div className="flex justify-between text-xs text-slate-500 font-medium">
                                   <span>{percent}% Complete</span>
                                   <span>{course.lessons.length} Lessons</span>
                               </div>
                               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                               </div>
                           </div>
                      </div>
                  </Link>
              );
          })}
      </div>
    </div>
  );
}
