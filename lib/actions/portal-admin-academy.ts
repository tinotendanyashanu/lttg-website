'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { PortalCourse } from '@/models/PortalCourse';
import { PortalModule } from '@/models/PortalModule';
import { PortalLesson } from '@/models/PortalLesson';
import { ActivityLog } from '@/models/ActivityLog';

function normalizeRole(role: string) {
  return String(role || '').trim().toLowerCase();
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseQuizPayload(rawQuiz: any) {
  if (!rawQuiz) return undefined;
  if (typeof rawQuiz === 'string') {
    const trimmed = rawQuiz.trim();
    if (!trimmed) return undefined;
    return JSON.parse(trimmed);
  }
  return rawQuiz;
}

async function requireAdmin() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  return account;
}

export async function getAdminCourses() {
  await requireAdmin();

  const courses = await PortalCourse.find().sort({ orderIndex: 1, updatedAt: -1 }).lean();

  return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
}

export async function getAdminCourseDetails(courseId: string) {
  await requireAdmin();

  const [course, modules, lessons] = await Promise.all([
    PortalCourse.findById(courseId).lean(),
    PortalModule.find({ courseId }).sort({ orderIndex: 1 }).lean(),
    PortalLesson.find({ courseId }).sort({ orderIndex: 1 }).lean(),
  ]);

  return { 
    success: true, 
    course: JSON.parse(JSON.stringify(course)),
    modules: JSON.parse(JSON.stringify(modules)), 
    lessons: JSON.parse(JSON.stringify(lessons)) 
  };
}

export async function createAdminCourse(data: any) {
  const account = await requireAdmin();

  const payload = {
    ...data,
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    targetRoles: Array.isArray(data.targetRoles) ? data.targetRoles.map(normalizeRole) : [],
    quiz: parseQuizPayload(data.quiz),
    thumbnailUrl: data.thumbnailUrl ?? undefined,
  };

  const course = await PortalCourse.create(payload);

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_created',
    newValue: `Course created: ${course.title}`,
  });

  return { success: true, courseId: course._id.toString() };
}

export async function updateAdminCourse(courseId: string, data: any) {
  const account = await requireAdmin();

  const payload = {
    ...data,
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    targetRoles: Array.isArray(data.targetRoles) ? data.targetRoles.map(normalizeRole) : [],
    quiz: parseQuizPayload(data.quiz),
    thumbnailUrl: data.thumbnailUrl ?? undefined,
  };

  const course = await PortalCourse.findByIdAndUpdate(courseId, { $set: payload }, { new: true });
  if (!course) throw new Error('Course not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_updated',
    newValue: `Course updated: ${course.title}`,
  });

  return { success: true };
}

export async function deleteAdminCourse(courseId: string) {
  const account = await requireAdmin();

  const course = await PortalCourse.findByIdAndDelete(courseId);
  if (!course) throw new Error('Course not found');
  const modules = await PortalModule.find({ courseId }).lean();
  const moduleIds = modules.map((module: any) => module._id);
  await PortalModule.deleteMany({ courseId });
  await PortalLesson.deleteMany({
    $or: [
      { courseId },
      { moduleId: { $in: moduleIds } },
    ],
  });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_deleted',
    newValue: `Course deleted: ${course.title}`,
  });

  return { success: true };
}

// Module Management
export async function createAdminModule(data: any) {
  const account = await requireAdmin();

  const module = await PortalModule.create({
    ...data,
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    quiz: parseQuizPayload(data.quiz),
  });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_module_created',
    newValue: `Module created: ${module.title}`,
  });

  return { success: true, module: JSON.parse(JSON.stringify(module)) };
}

export async function updateAdminModule(moduleId: string, data: any) {
  await requireAdmin();

  const module = await PortalModule.findByIdAndUpdate(moduleId, {
    $set: {
      ...data,
      slug: data.slug ? slugify(data.slug) : slugify(data.title),
      quiz: parseQuizPayload(data.quiz),
    }
  }, { new: true });
  if (!module) throw new Error('Module not found');

  return { success: true, module: JSON.parse(JSON.stringify(module.toObject())) };
}

export async function deleteAdminModule(moduleId: string) {
  await requireAdmin();

  await PortalModule.findByIdAndDelete(moduleId);
  await PortalLesson.deleteMany({ moduleId });

  return { success: true };
}

// Lesson Management
export async function createAdminLesson(data: any) {
  const account = await requireAdmin();

  const attachments = Array.isArray(data.attachments)
    ? data.attachments
    : String(data.attachments || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const lesson = await PortalLesson.create({
    ...data,
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    attachments,
  });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'course_lesson_created',
    newValue: `Lesson created: ${lesson.title}`,
  });

  return { success: true, lesson: JSON.parse(JSON.stringify(lesson)) };
}

export async function updateAdminLesson(lessonId: string, data: any) {
  await requireAdmin();

  const attachments = Array.isArray(data.attachments)
    ? data.attachments
    : String(data.attachments || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const lesson = await PortalLesson.findByIdAndUpdate(lessonId, {
    $set: {
      ...data,
      slug: data.slug ? slugify(data.slug) : slugify(data.title),
      attachments,
      audioUrl: data.audioUrl ?? undefined,
      thumbnailUrl: data.thumbnailUrl ?? undefined,
    }
  }, { new: true });
  if (!lesson) throw new Error('Lesson not found');

  return { success: true, lesson: JSON.parse(JSON.stringify(lesson.toObject())) };
}

export async function deleteAdminLesson(lessonId: string) {
  await requireAdmin();

  await PortalLesson.findByIdAndDelete(lessonId);

  return { success: true };
}
