'use server';

import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import AuditLog from '@/models/AuditLog';
import { Partner as IPartner } from '@/types';
import { revalidatePath } from 'next/cache';
import { recordLedgerEntry } from '@/lib/services/ledger';

export async function submitExam(courseId: string, answers: number[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  await dbConnect();
  
  const course = await Course.findById(courseId);
  if (!course || !course.exam) {
    return { error: 'Course or Exam not found' };
  }

  // Calculate Score
  let correctCount = 0;
  course.exam.questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / course.exam.questions.length) * 100);
  const passed = score >= course.exam.passingScore;

  // Update Partner Progress
  const partner = await Partner.findById(session.user.id);
  
  if (!partner) {
    return { error: 'Partner not found' };
  }
  
  const progressIndex = partner.partnerProgress.findIndex((p) => p.courseId === courseId);
  
  if (progressIndex > -1) {
    partner.partnerProgress[progressIndex].examScore = score;
    partner.partnerProgress[progressIndex].examAttempts = (partner.partnerProgress[progressIndex].examAttempts || 0) + 1;
    if (passed) {
      partner.partnerProgress[progressIndex].isCompleted = true;
      partner.partnerProgress[progressIndex].progressPercentage = 100;
    }
  } else {
    partner.partnerProgress.push({
      courseId,
      completedLessons: [], // Should technically have lessons marked if they took exam?
      progressPercentage: passed ? 100 : 0,
      isCompleted: passed,
      examScore: score,
      examAttempts: 1
    });
  }

  // Check for All Courses Completed Bonus
  if (passed && !partner.hasReceivedAcademyBonus) {
      const allCourses = await Course.find({ published: true });
      
      const allCompleted = allCourses.every((c) => 
          partner.partnerProgress.some((p) => p.courseId === c._id.toString() && p.isCompleted)
      );

      if (allCompleted) {
          const mSession = await mongoose.startSession();
          mSession.startTransaction();

          try {
            // 1. Create separate Deal entry for bonus
            const bonusDeal = new Deal({
              partnerId: partner._id,
              clientName: "Internal Reward",
              serviceType: "Internal",
              dealStatus: "closed",
              paymentStatus: "received",
              commissionStatus: "Approved",
              commissionAmount: 10,
              commissionSource: "ACADEMY_BONUS",
              estimatedValue: 0,
              commissionRate: 0,
              paymentReceivedAt: new Date(),
              closedAt: new Date()
            });
            await bonusDeal.save({ session: mSession });

            // 2. Update Partner
            partner.hasReceivedAcademyBonus = true;
            partner.academyBonusIssuedAt = new Date();
            await partner.save({ session: mSession });

            // 2.5 Record Ledger Entry
            await recordLedgerEntry({
              partnerId: partner._id,
              type: 'academy_bonus',
              amount: 10
            }, mSession);

            // 3. Audit Log
            await AuditLog.create([{
              entityType: 'partner',
              entityId: partner._id,
              action: 'academy_bonus_issued',
              performedBy: 'system',
              metadata: { dealId: bonusDeal._id, amount: 10 }
            }], { session: mSession });

            await mSession.commitTransaction();
          } catch (error) {
            await mSession.abortTransaction();
            console.error("Failed to issue Academy Bonus:", error);
            // Return or handle as needed, but we don't want to fail the whole exam submission
            // We just failed the bonus, which is bad, but we still want to save progress
            throw error; 
          } finally {
            mSession.endSession();
          }
      } else {
         await partner.save();
      }
  } else {
     await partner.save();
  }

  revalidatePath(`/partner/dashboard/academy`);
  return { success: true, score, passed, passingScore: course.exam.passingScore };
}

export async function completeLesson(courseId: string, lessonSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  await dbConnect();
  
  const partner = await Partner.findById(session.user.id);
  if (!partner) return { error: 'Partner not found' };

  const course = await Course.findById(courseId);
  if (!course) return { error: 'Course not found' };

  const progressIndex = partner.partnerProgress.findIndex((p) => p.courseId === courseId);

  if (progressIndex > -1) {
    if (!partner.partnerProgress[progressIndex].completedLessons.includes(lessonSlug)) {
        partner.partnerProgress[progressIndex].completedLessons.push(lessonSlug);
    }
    
    // Update percentage (simple logic: lessons count)
    // Note: This logic assumes we know total lessons. 
    // For now, let's just stick to tracking the array.
    const completedCount = partner.partnerProgress[progressIndex].completedLessons.length;
    const totalLessons = course.lessons.length;
    partner.partnerProgress[progressIndex].progressPercentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    
  } else {
    partner.partnerProgress.push({
        courseId,
        completedLessons: [lessonSlug],
        progressPercentage: Math.round((1 / course.lessons.length) * 100),
        isCompleted: false,
    });
  }

  await partner.save();
  revalidatePath('/partner/dashboard/academy');
  return { success: true };
}

export async function getCourses() {
  await dbConnect();
  // Ensure courses exist
  const count = await Course.countDocuments();
  if (count === 0) {
    await seedCourses();
  }
  
  return await Course.find({ published: true }).sort({ createdAt: 1 }).lean();
}

export async function getCourse(slug: string) {
  await dbConnect();
  return await Course.findOne({ slug, published: true }).lean();
}

export async function getPartnerProgress(email: string) {
  await dbConnect();
  const partner = await Partner.findOne({ email }).lean() as unknown as IPartner;
  return partner?.partnerProgress || [];
}

import { courses as initialCourses } from '@/lib/data/academy-content';

export async function seedCourses() {
  await dbConnect();
  
  try {
    // Check if courses already exist to avoid overwriting/duplicating on every load
    // But for this demo, we might want to ensure they are up to date
    const count = await Course.countDocuments();
    if (count > 0) return;

    console.log('Seeding Academy Courses...');

    for (const courseData of initialCourses) {
      await Course.create({
        ...courseData,
        published: true,
      });
    }

    console.log('Seeding Complete');
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
}
