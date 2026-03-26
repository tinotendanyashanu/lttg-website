'use server';

import { auth } from '@/auth';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { PortalCourse } from '@/models/PortalCourse';
import { PortalModule } from '@/models/PortalModule';
import { PortalLesson } from '@/models/PortalLesson';
import { PortalCourseProgress } from '@/models/PortalCourseProgress';
import { PortalQuizAttempt } from '@/models/PortalQuizAttempt';
import { Account } from '@/models/Account';

export async function getAvailableCourses() {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await connectToDatabase();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) throw new Error('Account not found');

    const userRoles = account.roles || [];

    // Find courses that are published and match at least one of the user's roles, or targetRoles includes 'All'
    // For MVP, we can just match any role. Or we can match if user is Admin, they see everything.
    let roleFilter = {};
    if (!userRoles.includes('Admin')) {
      roleFilter = {
        targetRoles: { $in: [...userRoles, 'All'] }
      };
    }

    const courses = await PortalCourse.find({
      isPublished: true,
      ...roleFilter
    }).sort({ createdAt: -1 });

    // Also fetch progress for each course
    const progresses = await PortalCourseProgress.find({ accountId: account._id });
    const progressMap = [...progresses].reduce((acc: Record<string, any>, progress) => {
      acc[progress.courseId.toString()] = progress;
      return acc;
    }, {});

    return { 
      success: true, 
      courses: courses.map(c => {
        const doc: any = c.toObject();
        doc._id = doc._id.toString();
        // Convert any ObjectIds to strings inside doc if necessary
        if (doc.createdBy) doc.createdBy = doc.createdBy.toString();
        return doc;
      }),
      progresses: Object.keys(progressMap).reduce((acc: Record<string, any>, key) => {
        acc[key] = {
          progressPercentage: progressMap[key].progressPercentage,
          isCompleted: progressMap[key].isCompleted
        };
        return acc;
      }, {})
    };
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return { success: false, error: error.message || 'Failed to fetch courses' };
  }
}

export async function getCourseWithDetails(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await connectToDatabase();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) throw new Error('Account not found');

    const course = await PortalCourse.findById(courseId);
    if (!course) throw new Error('Course not found');

    const modules = await PortalModule.find({ courseId }).sort({ orderIndex: 1 });
    const lessons = await PortalLesson.find({ courseId }).sort({ orderIndex: 1 });

    let progress = await PortalCourseProgress.findOne({ accountId: account._id, courseId });
    if (!progress) {
      progress = await PortalCourseProgress.create({
        accountId: account._id,
        courseId,
        completedLessonIds: [],
        progressPercentage: 0,
        isCompleted: false
      });
    }

    return {
      success: true,
      course: JSON.parse(JSON.stringify(course.toObject())),
      modules: JSON.parse(JSON.stringify(modules.map(m => m.toObject()))),
      lessons: JSON.parse(JSON.stringify(lessons.map(l => l.toObject()))),
      progress: JSON.parse(JSON.stringify(progress.toObject()))
    };
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return { success: false, error: error.message };
  }
}

export async function getLessonContent(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await connectToDatabase();
    const lesson = await PortalLesson.findById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const module = await PortalModule.findById(lesson.moduleId);
    const course = await PortalCourse.findById(lesson.courseId);

    // Get progress
    const account = await Account.findOne({ email: session.user.email });
    let progress = null;
    if (account) {
        progress = await PortalCourseProgress.findOne({ accountId: account._id, courseId: lesson.courseId });
    }

    return {
      success: true,
      lesson: JSON.parse(JSON.stringify(lesson.toObject())),
      moduleTitle: module?.title || 'Unknown Module',
      courseTitle: course?.title || 'Unknown Course',
      progress: progress ? JSON.parse(JSON.stringify(progress.toObject())) : null
    };
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return { success: false, error: error.message };
  }
}

export async function markLessonComplete(courseId: string, lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await connectToDatabase();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) throw new Error('Account not found');

    const course = await PortalCourse.findById(courseId);
    if (!course) throw new Error('Course not found');

    const totalLessonsCount = await PortalLesson.countDocuments({ courseId });
    
    let progress = await PortalCourseProgress.findOne({ accountId: account._id, courseId });
    if (!progress) {
      progress = new PortalCourseProgress({
        accountId: account._id,
        courseId,
        completedLessonIds: [],
        progressPercentage: 0,
        isCompleted: false
      });
    }

    if (!progress.completedLessonIds.includes(new mongoose.Types.ObjectId(lessonId))) {
      progress.completedLessonIds.push(new mongoose.Types.ObjectId(lessonId));
    }

    const completedCount = progress.completedLessonIds.length;
    let newPercentage = totalLessonsCount === 0 ? 0 : Math.round((completedCount / totalLessonsCount) * 100);
    if (newPercentage > 100) newPercentage = 100;

    progress.progressPercentage = newPercentage;

    // Check if course is fully complete only if there is no quiz
    // If there is a quiz, the course is complete when the quiz is passed.
    if (!course.quiz && newPercentage === 100) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    return { success: true, progressPercentage: progress.progressPercentage, isCompleted: progress.isCompleted };
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    return { success: false, error: error.message };
  }
}

export async function submitQuiz(courseId: string, answers: number[]) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await connectToDatabase();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) throw new Error('Account not found');

    const course = await PortalCourse.findById(courseId);
    if (!course || !course.quiz) throw new Error('Course not found or has no quiz');

    const questions = course.quiz.questions;
    if (answers.length !== questions.length) throw new Error('Answers do not match questions');

    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswerIndex) {
        correctCount++;
      }
    }

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= course.quiz.passingScore;

    const previousAttemptsCount = await PortalQuizAttempt.countDocuments({ accountId: account._id, courseId });

    const attempt = await PortalQuizAttempt.create({
      accountId: account._id,
      courseId,
      scorePercentage,
      passed,
      attemptCount: previousAttemptsCount + 1,
      answers
    });

    if (passed) {
      const progress = await PortalCourseProgress.findOne({ accountId: account._id, courseId });
      if (progress && !progress.isCompleted) {
        // Also ensure lessons are essentially marked 100% or just set course to complete
        progress.isCompleted = true;
        progress.completedAt = new Date();
        await progress.save();
      }
    }

    return {
      success: true,
      scorePercentage,
      passed,
      attempt: JSON.parse(JSON.stringify(attempt.toObject()))
    };

  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return { success: false, error: error.message };
  }
}
