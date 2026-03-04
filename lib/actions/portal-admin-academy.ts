'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { PortalCourse } from '@/models/PortalCourse';
import { PortalModule } from '@/models/PortalModule';
import { PortalLesson } from '@/models/PortalLesson';
import { ActivityLog } from '@/models/ActivityLog';

export async function getAdminCourses() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const courses = await PortalCourse.find().sort({ updatedAt: -1 }).lean();

  return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
}

export async function getAdminCourseDetails(courseId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const modules = await PortalModule.find({ courseId }).sort({ orderIndex: 1 }).lean();
  const lessons = await PortalLesson.find({ courseId }).sort({ orderIndex: 1 }).lean();

  return { 
    success: true, 
    modules: JSON.parse(JSON.stringify(modules)), 
    lessons: JSON.parse(JSON.stringify(lessons)) 
  };
}

export async function createAdminCourse(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const course = await PortalCourse.create({ ...data });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_created',
    newValue: `Course created: ${course.title}`,
  });

  return { success: true, courseId: course._id.toString() };
}

export async function updateAdminCourse(courseId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const course = await PortalCourse.findByIdAndUpdate(courseId, { $set: data }, { new: true });
  if (!course) throw new Error('Course not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_updated',
    newValue: `Course updated: ${course.title}`,
  });

  return { success: true };
}

export async function deleteAdminCourse(courseId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const course = await PortalCourse.findByIdAndDelete(courseId);
  if (!course) throw new Error('Course not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_deleted',
    newValue: `Course deleted: ${course.title}`,
  });

  return { success: true };
}

// Module Management
export async function createAdminModule(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const module = await PortalModule.create({ ...data });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_module_created',
    newValue: `Module created: ${module.title}`,
  });

  return { success: true, module: JSON.parse(JSON.stringify(module)) };
}

export async function updateAdminModule(moduleId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const module = await PortalModule.findByIdAndUpdate(moduleId, { $set: data }, { new: true });
  if (!module) throw new Error('Module not found');

  return { success: true };
}

export async function deleteAdminModule(moduleId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  await PortalModule.findByIdAndDelete(moduleId);
  await PortalLesson.deleteMany({ moduleId });

  return { success: true };
}

// Lesson Management
export async function createAdminLesson(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const lesson = await PortalLesson.create({ ...data });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_lesson_created',
    newValue: `Lesson created: ${lesson.title}`,
  });

  return { success: true, lesson: JSON.parse(JSON.stringify(lesson)) };
}

export async function updateAdminLesson(lessonId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const lesson = await PortalLesson.findByIdAndUpdate(lessonId, { $set: data }, { new: true });
  if (!lesson) throw new Error('Lesson not found');

  return { success: true };
}

export async function deleteAdminLesson(lessonId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  await PortalLesson.findByIdAndDelete(lessonId);

  return { success: true };
}
