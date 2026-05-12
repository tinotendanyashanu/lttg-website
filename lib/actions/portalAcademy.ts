'use server';

import { auth } from '@/auth';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { portalAcademySeed } from '@/lib/data/portal-academy-seed';
import { PortalCourse } from '@/models/PortalCourse';
import { PortalModule } from '@/models/PortalModule';
import { PortalLesson } from '@/models/PortalLesson';
import { PortalCourseProgress } from '@/models/PortalCourseProgress';
import { PortalQuizAttempt } from '@/models/PortalQuizAttempt';
import { Account } from '@/models/Account';

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRole(role: string) {
  return String(role || '').trim().toLowerCase();
}

function toIdString(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && 'toString' in value) {
    return String((value as { toString: () => string }).toString());
  }
  return String(value);
}

function sameId(a: unknown, b: unknown) {
  return toIdString(a) === toIdString(b);
}

async function getAuthedAccount() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  await connectToDatabase();

  const account = await Account.findOne({ email: session.user.email });
  if (!account) {
    throw new Error('Account not found');
  }

  return account;
}

async function ensurePortalAcademySeeded() {
  const count = await PortalCourse.countDocuments();
  if (count > 0) {
    return;
  }

  for (const courseSeed of portalAcademySeed) {
    const course = await PortalCourse.create({
      title: courseSeed.title,
      slug: courseSeed.slug,
      summary: courseSeed.summary,
      description: courseSeed.description,
      targetRoles: courseSeed.targetRoles.map(normalizeRole),
      difficultyLevel: courseSeed.difficultyLevel,
      category: courseSeed.category,
      orderIndex: courseSeed.orderIndex,
      estimatedDurationMinutes: courseSeed.estimatedDurationMinutes,
      isRequired: courseSeed.isRequired,
      isPublished: courseSeed.isPublished,
      heroIcon: courseSeed.heroIcon,
      thumbnailUrl: courseSeed.thumbnailUrl,
      quiz: courseSeed.quiz,
    });

    for (const moduleSeed of courseSeed.modules) {
      const module = await PortalModule.create({
        courseId: course._id,
        title: moduleSeed.title,
        slug: moduleSeed.slug,
        description: moduleSeed.description,
        orderIndex: moduleSeed.orderIndex,
        unlockStrategy: moduleSeed.unlockStrategy,
        estimatedDurationMinutes: moduleSeed.estimatedDurationMinutes,
        isPublished: true,
        quiz: moduleSeed.quiz,
      });

      for (const lessonSeed of moduleSeed.lessons) {
        await PortalLesson.create({
          courseId: course._id,
          moduleId: module._id,
          title: lessonSeed.title,
          slug: lessonSeed.slug,
          lessonType: lessonSeed.lessonType,
          summary: lessonSeed.summary,
          content: lessonSeed.content,
          estimatedDuration: lessonSeed.estimatedDuration,
          orderIndex: lessonSeed.orderIndex,
          isPublished: true,
        });
      }
    }
  }
}

function buildRoleFilter(roles: string[]) {
  const normalizedRoles = roles.map(normalizeRole);
  if (normalizedRoles.includes('admin')) {
    return {};
  }

  return {
    targetRoles: { $in: [...normalizedRoles, 'all'] },
  };
}

async function getProgressDoc(accountId: mongoose.Types.ObjectId, courseId: string) {
  let progress = await PortalCourseProgress.findOne({ accountId, courseId });
  if (!progress) {
    progress = await PortalCourseProgress.create({
      accountId,
      courseId,
      completedLessonIds: [],
      lessonProgress: [],
      moduleProgress: [],
      passedModuleQuizIds: [],
      progressPercentage: 0,
      status: 'not_started',
      isCompleted: false,
    });
  }
  return progress;
}

async function getCourseStructure(courseId: string) {
  const [course, modules, lessons] = await Promise.all([
    PortalCourse.findById(courseId).lean(),
    PortalModule.find({ courseId, isPublished: { $ne: false } }).sort({ orderIndex: 1, createdAt: 1 }).lean(),
    PortalLesson.find({ courseId, isPublished: { $ne: false } }).sort({ moduleId: 1, orderIndex: 1, createdAt: 1 }).lean(),
  ]);

  if (!course) {
    throw new Error('Course not found');
  }

  const orderedModules = [...modules].sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const lessonsByModule = orderedModules.reduce<Record<string, any[]>>((acc, module: any) => {
    acc[toIdString(module._id)] = [...lessons]
      .filter((lesson: any) => sameId(lesson.moduleId, module._id))
      .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    return acc;
  }, {});

  return { course, modules: orderedModules, lessons, lessonsByModule };
}

function getLatestAttempts(attempts: any[], scope: 'course' | 'module', targetId?: string) {
  return attempts
    .filter((attempt) => attempt.quizScope === scope && (!targetId || sameId(attempt.moduleId, targetId)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function computeProgressSnapshot({
  course,
  modules,
  lessonsByModule,
  progress,
  attempts,
}: {
  course: any;
  modules: any[];
  lessonsByModule: Record<string, any[]>;
  progress: any;
  attempts: any[];
}) {
  const lessonProgressMap = new Map<string, any>();
  for (const item of progress?.lessonProgress || []) {
    lessonProgressMap.set(toIdString(item.lessonId), item);
  }

  const completedLessonIds = new Set<string>(
    (progress?.completedLessonIds || []).map((item: unknown) => toIdString(item))
  );

  for (const [lessonId, item] of lessonProgressMap.entries()) {
    if (item.completedAt) {
      completedLessonIds.add(lessonId);
    }
  }

  const passedModuleQuizIds = new Set<string>(
    (progress?.passedModuleQuizIds || []).map((item: unknown) => toIdString(item))
  );

  attempts
    .filter((attempt) => attempt.quizScope === 'module' && attempt.passed)
    .forEach((attempt) => passedModuleQuizIds.add(toIdString(attempt.moduleId)));

  const lessonStates: Record<string, {
    lessonId: string;
    moduleId: string;
    isCompleted: boolean;
    isLocked: boolean;
    position: number;
  }> = {};

  const moduleStates: Array<{
    moduleId: string;
    title: string;
    isUnlocked: boolean;
    completionPercentage: number;
    isCompleted: boolean;
    quizPassed: boolean;
    totalLessons: number;
    completedLessons: number;
  }> = [];

  let totalLessons = 0;
  let completedLessonsCount = 0;
  let canUnlockNextModule = true;
  let nextLessonId = '';

  for (const module of modules) {
    const moduleId = toIdString(module._id);
    const moduleLessons = lessonsByModule[moduleId] || [];
    const isUnlocked = moduleStates.length === 0 ? true : canUnlockNextModule;
    let previousLessonCompleted = true;
    let completedInModule = 0;

    moduleLessons.forEach((lesson, index) => {
      const lessonId = toIdString(lesson._id);
      const isCompleted = completedLessonIds.has(lessonId);
      const isLocked = !isUnlocked || !previousLessonCompleted;

      lessonStates[lessonId] = {
        lessonId,
        moduleId,
        isCompleted,
        isLocked,
        position: index + 1,
      };

      if (isCompleted) {
        completedInModule += 1;
        completedLessonsCount += 1;
      } else if (!isLocked && !nextLessonId) {
        nextLessonId = lessonId;
      }

      previousLessonCompleted = isCompleted;
      totalLessons += 1;
    });

    const completionPercentage = moduleLessons.length === 0
      ? 0
      : Math.round((completedInModule / moduleLessons.length) * 100);
    const hasQuiz = Boolean(module.quiz?.questions?.length);
    const quizPassed = hasQuiz ? passedModuleQuizIds.has(moduleId) : true;
    const lessonsComplete = moduleLessons.length > 0 && completedInModule === moduleLessons.length;
    const isCompleted = lessonsComplete && quizPassed;

    moduleStates.push({
      moduleId,
      title: module.title,
      isUnlocked,
      completionPercentage,
      isCompleted,
      quizPassed,
      totalLessons: moduleLessons.length,
      completedLessons: completedInModule,
    });

    canUnlockNextModule = isCompleted;
  }

  const courseQuizAttempts = getLatestAttempts(attempts, 'course');
  const courseQuizPassed = course.quiz?.questions?.length ? courseQuizAttempts.some((attempt) => attempt.passed) : true;
  const allModulesComplete = moduleStates.every((module) => module.isCompleted || module.totalLessons === 0);
  const progressPercentage = totalLessons === 0 ? 0 : Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100));
  const isCompleted = allModulesComplete && courseQuizPassed && totalLessons > 0;
  const isOverdue = Boolean(course.isRequired && course.deadlineAt && new Date(course.deadlineAt).getTime() < Date.now() && !isCompleted);

  return {
    completedLessonIds: [...completedLessonIds],
    passedModuleQuizIds: [...passedModuleQuizIds],
    lessonStates,
    moduleStates,
    totalLessons,
    completedLessonsCount,
    progressPercentage,
    isCompleted,
    isOverdue,
    status: isCompleted ? 'completed' : progressPercentage > 0 ? (isOverdue ? 'overdue' : 'in_progress') : (isOverdue ? 'overdue' : 'not_started'),
    nextLessonId,
    courseQuizPassed,
    courseQuizAttempts,
  };
}

async function syncProgressState({
  course,
  modules,
  lessonsByModule,
  progress,
  attempts,
}: {
  course: any;
  modules: any[];
  lessonsByModule: Record<string, any[]>;
  progress: any;
  attempts: any[];
}) {
  const snapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });

  progress.completedLessonIds = snapshot.completedLessonIds.map((lessonId) => new mongoose.Types.ObjectId(lessonId));
  progress.moduleProgress = snapshot.moduleStates.map((state) => ({
    moduleId: new mongoose.Types.ObjectId(state.moduleId),
    completionPercentage: state.completionPercentage,
    isCompleted: state.isCompleted,
    quizPassed: state.quizPassed,
    completedAt: state.isCompleted ? new Date() : undefined,
  }));
  progress.passedModuleQuizIds = snapshot.passedModuleQuizIds.map((moduleId) => new mongoose.Types.ObjectId(moduleId));
  progress.progressPercentage = snapshot.progressPercentage;
  progress.status = snapshot.status;
  progress.isCompleted = snapshot.isCompleted;
  progress.startedAt = progress.startedAt || (snapshot.progressPercentage > 0 ? new Date() : undefined);
  progress.completedAt = snapshot.isCompleted ? (progress.completedAt || new Date()) : undefined;
  progress.lastActivityAt = snapshot.progressPercentage > 0 ? new Date() : progress.lastActivityAt;

  await progress.save();

  return snapshot;
}

async function buildTeamInsights(account: any) {
  const isManager = account.roles.includes('manager') || account.roles.includes('admin');
  if (!isManager || !account.teamId) {
    return null;
  }

  const teamMembers = await Account.find({
    teamId: account.teamId,
    isActive: { $ne: false },
  }).lean();

  const memberIds = teamMembers.map((member: any) => member._id);
  const [courses, progresses, attempts] = await Promise.all([
    PortalCourse.find({ isPublished: true }).lean(),
    PortalCourseProgress.find({ accountId: { $in: memberIds } }).lean(),
    PortalQuizAttempt.find({ accountId: { $in: memberIds } }).lean(),
  ]);

  const memberRows = teamMembers.map((member: any) => {
    const memberProgress = progresses.filter((progress: any) => sameId(progress.accountId, member._id));
    const memberAttempts = attempts.filter((attempt: any) => sameId(attempt.accountId, member._id));
    const avgCompletion = memberProgress.length === 0
      ? 0
      : Math.round(memberProgress.reduce((sum: number, item: any) => sum + (item.progressPercentage || 0), 0) / memberProgress.length);
    const avgScoreItems = memberAttempts.filter((attempt: any) => typeof attempt.scorePercentage === 'number');
    const avgScore = avgScoreItems.length === 0
      ? null
      : Math.round(avgScoreItems.reduce((sum: number, item: any) => sum + item.scorePercentage, 0) / avgScoreItems.length);
    const requiredCourses = courses.filter((course: any) => course.isRequired);
    const completedRequired = memberProgress.filter((item: any) => item.isCompleted).length;

    return {
      accountId: toIdString(member._id),
      fullName: member.fullName,
      roles: member.roles,
      completionRate: avgCompletion,
      averageScore: avgScore,
      requiredCompleted: completedRequired,
      requiredTotal: requiredCourses.length,
      overdueCourses: memberProgress.filter((item: any) => item.status === 'overdue').length,
    };
  });

  return {
    teamSize: memberRows.length,
    completionRate: memberRows.length === 0
      ? 0
      : Math.round(memberRows.reduce((sum, row) => sum + row.completionRate, 0) / memberRows.length),
    lowPerformers: memberRows.filter((row) => row.completionRate < 50 || (row.averageScore !== null && row.averageScore < 70)),
    members: memberRows,
  };
}

async function buildAdminInsights() {
  const [courses, progresses, attempts] = await Promise.all([
    PortalCourse.find({ isPublished: true }).lean(),
    PortalCourseProgress.find().lean(),
    PortalQuizAttempt.find().lean(),
  ]);

  const completionStats = courses.map((course: any) => {
    const courseProgress = progresses.filter((progress: any) => sameId(progress.courseId, course._id));
    const courseAttempts = attempts.filter((attempt: any) => sameId(attempt.courseId, course._id));
    const completedCount = courseProgress.filter((progress: any) => progress.isCompleted).length;
    const avgScoreItems = courseAttempts.filter((attempt: any) => attempt.quizScope === 'course');
    const averageScore = avgScoreItems.length === 0
      ? null
      : Math.round(avgScoreItems.reduce((sum: number, item: any) => sum + item.scorePercentage, 0) / avgScoreItems.length);

    return {
      courseId: toIdString(course._id),
      title: course.title,
      learners: courseProgress.length,
      completedCount,
      completionRate: courseProgress.length === 0 ? 0 : Math.round((completedCount / courseProgress.length) * 100),
      averageScore,
    };
  });

  return {
    totalCourses: courses.length,
    activeLearners: new Set(progresses.map((progress: any) => toIdString(progress.accountId))).size,
    overdueEnrollments: progresses.filter((progress: any) => progress.status === 'overdue').length,
    completionStats,
  };
}

export async function getAvailableCourses() {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const courses = await PortalCourse.find({
      isPublished: true,
      ...buildRoleFilter(account.roles || []),
    })
      .sort({ orderIndex: 1, createdAt: 1 })
      .lean();

    const courseIds = courses.map((course: any) => course._id);
    const [modules, lessons, progresses, attempts, managerInsights, adminInsights] = await Promise.all([
      PortalModule.find({ courseId: { $in: courseIds }, isPublished: { $ne: false } }).lean(),
      PortalLesson.find({ courseId: { $in: courseIds }, isPublished: { $ne: false } }).lean(),
      PortalCourseProgress.find({ accountId: account._id, courseId: { $in: courseIds } }).lean(),
      PortalQuizAttempt.find({ accountId: account._id, courseId: { $in: courseIds } }).lean(),
      buildTeamInsights(account),
      account.roles.includes('admin') ? buildAdminInsights() : Promise.resolve(null),
    ]);

    const progressMap = new Map(progresses.map((progress: any) => [toIdString(progress.courseId), progress]));
    const attemptMap = new Map<string, any[]>();
    attempts.forEach((attempt: any) => {
      const key = toIdString(attempt.courseId);
      const list = attemptMap.get(key) || [];
      list.push(attempt);
      attemptMap.set(key, list);
    });

    const courseCards = courses.map((course: any) => {
      const courseModules = modules
        .filter((module: any) => sameId(module.courseId, course._id))
        .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      const lessonsByModule = courseModules.reduce<Record<string, any[]>>((acc, module: any) => {
        acc[toIdString(module._id)] = lessons
          .filter((lesson: any) => sameId(lesson.moduleId, module._id))
          .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        return acc;
      }, {});

      const progress = progressMap.get(toIdString(course._id)) || {
        completedLessonIds: [],
        lessonProgress: [],
        moduleProgress: [],
        passedModuleQuizIds: [],
        progressPercentage: 0,
        status: 'not_started',
        isCompleted: false,
      };

      const snapshot = computeProgressSnapshot({
        course,
        modules: courseModules,
        lessonsByModule,
        progress,
        attempts: attemptMap.get(toIdString(course._id)) || [],
      });

      return {
        ...course,
        moduleCount: courseModules.length,
        lessonCount: Object.values(lessonsByModule).flat().length,
        progressPercentage: snapshot.progressPercentage,
        isCompleted: snapshot.isCompleted,
        nextLessonId: snapshot.nextLessonId,
        overdue: snapshot.isOverdue,
        status: snapshot.status,
        courseQuizPassed: snapshot.courseQuizPassed,
      };
    });

    return {
      success: true,
      viewer: {
        roles: account.roles,
        teamId: account.teamId ? toIdString(account.teamId) : null,
        canManageAcademy: account.roles.includes('admin'),
        canViewTeamInsights: account.roles.includes('admin') || account.roles.includes('manager'),
      },
      courses: serialize(courseCards),
      managerInsights: serialize(managerInsights),
      adminInsights: serialize(adminInsights),
    };
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return { success: false, error: error.message || 'Failed to fetch courses' };
  }
}

export async function getCourseWithDetails(courseId: string) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const snapshot = await syncProgressState({ course, modules, lessonsByModule, progress, attempts });
    const flattenedLessons = modules.flatMap((module: any) => lessonsByModule[toIdString(module._id)] || []);

    return {
      success: true,
      course: serialize(course),
      modules: serialize(modules),
      lessons: serialize(flattenedLessons),
      progress: serialize(progress.toObject()),
      lessonStates: serialize(snapshot.lessonStates),
      moduleStates: serialize(snapshot.moduleStates),
      nextLessonId: snapshot.nextLessonId,
      courseQuizPassed: snapshot.courseQuizPassed,
      courseQuizAttempts: serialize(snapshot.courseQuizAttempts),
      overdue: snapshot.isOverdue,
    };
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return { success: false, error: error.message || 'Failed to fetch course details' };
  }
}

export async function getLessonContent(lessonId: string) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const lesson = await PortalLesson.findById(lessonId).lean();
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const { course, modules, lessonsByModule } = await getCourseStructure(toIdString(lesson.courseId));
    const progress = await getProgressDoc(account._id, toIdString(lesson.courseId));

    const lessonProgressIndex = (progress.lessonProgress || []).findIndex((item: any) => sameId(item.lessonId, lesson._id));
    if (lessonProgressIndex === -1) {
      progress.lessonProgress.push({
        lessonId: new mongoose.Types.ObjectId(toIdString(lesson._id)),
        moduleId: new mongoose.Types.ObjectId(toIdString(lesson.moduleId)),
        startedAt: new Date(),
      });
    } else if (!progress.lessonProgress[lessonProgressIndex].startedAt) {
      progress.lessonProgress[lessonProgressIndex].startedAt = new Date();
    }

    progress.startedAt = progress.startedAt || new Date();
    progress.lastLessonId = new mongoose.Types.ObjectId(toIdString(lesson._id));
    progress.lastActivityAt = new Date();
    await progress.save();

    const attempts = await PortalQuizAttempt.find({
      accountId: account._id,
      courseId: toIdString(lesson.courseId),
    }).lean();
    const snapshot = await syncProgressState({ course, modules, lessonsByModule, progress, attempts });

    const orderedLessons = modules.flatMap((module: any) => lessonsByModule[toIdString(module._id)] || []);
    const lessonIndex = orderedLessons.findIndex((item: any) => sameId(item._id, lesson._id));
    const previousLesson = lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : null;
    const nextLesson = lessonIndex >= 0 && lessonIndex < orderedLessons.length - 1 ? orderedLessons[lessonIndex + 1] : null;
    const module = modules.find((item: any) => sameId(item._id, lesson.moduleId));
    const lessonState = snapshot.lessonStates[toIdString(lesson._id)];

    return {
      success: true,
      lesson: serialize(lesson),
      module: serialize(module),
      course: serialize(course),
      progress: serialize(progress.toObject()),
      lessonState: serialize(lessonState),
      moduleStates: serialize(snapshot.moduleStates),
      navigation: serialize({
        previousLessonId: previousLesson ? toIdString(previousLesson._id) : null,
        nextLessonId: nextLesson ? toIdString(nextLesson._id) : null,
        nextRecommendedLessonId: snapshot.nextLessonId || null,
      }),
      isLocked: lessonState?.isLocked ?? false,
      unlockReason: lessonState?.isLocked ? 'Complete the previous lesson and any required module quiz to continue.' : null,
    };
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return { success: false, error: error.message || 'Failed to fetch lesson' };
  }
}

export async function markLessonComplete(courseId: string, lessonId: string) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    const lesson = Object.values(lessonsByModule).flat().find((item: any) => sameId(item._id, lessonId));
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const beforeSnapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });
    const lessonState = beforeSnapshot.lessonStates[lessonId];

    if (!lessonState || lessonState.isLocked) {
      throw new Error('This lesson is still locked. Complete the required lesson path first.');
    }

    const lessonProgressIndex = (progress.lessonProgress || []).findIndex((item: any) => sameId(item.lessonId, lessonId));
    const now = new Date();
    if (lessonProgressIndex === -1) {
      progress.lessonProgress.push({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        moduleId: new mongoose.Types.ObjectId(toIdString(lesson.moduleId)),
        startedAt: now,
        completedAt: now,
      });
    } else {
      progress.lessonProgress[lessonProgressIndex].startedAt = progress.lessonProgress[lessonProgressIndex].startedAt || now;
      progress.lessonProgress[lessonProgressIndex].completedAt = now;
    }

    if (!(progress.completedLessonIds || []).some((item: any) => sameId(item, lessonId))) {
      progress.completedLessonIds.push(new mongoose.Types.ObjectId(lessonId));
    }

    progress.lastLessonId = new mongoose.Types.ObjectId(lessonId);
    progress.lastActivityAt = now;
    progress.startedAt = progress.startedAt || now;

    const afterSnapshot = await syncProgressState({ course, modules, lessonsByModule, progress, attempts });

    revalidatePath('/portal/employee/academy');
    revalidatePath(`/portal/employee/academy/courses/${courseId}`);
    revalidatePath(`/portal/employee/academy/courses/${courseId}/lessons/${lessonId}`);

    return {
      success: true,
      progressPercentage: afterSnapshot.progressPercentage,
      isCompleted: afterSnapshot.isCompleted,
      nextLessonId: afterSnapshot.nextLessonId || null,
      needsCourseQuiz: Boolean(course.quiz?.questions?.length && !afterSnapshot.courseQuizPassed && afterSnapshot.progressPercentage === 100),
      needsModuleQuiz: afterSnapshot.moduleStates.some((state) => state.moduleId === toIdString(lesson.moduleId) && state.completedLessons === state.totalLessons && !state.quizPassed),
    };
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    return { success: false, error: error.message || 'Failed to complete lesson' };
  }
}

async function submitQuizAttempt({
  accountId,
  course,
  module,
  answers,
}: {
  accountId: mongoose.Types.ObjectId;
  course: any;
  module?: any;
  answers: number[];
}) {
  const quiz = module?.quiz || course.quiz;
  if (!quiz?.questions?.length) {
    throw new Error('Quiz not found');
  }

  if (answers.length !== quiz.questions.length) {
    throw new Error('Please answer every question before submitting.');
  }

  const quizScope: 'course' | 'module' = module ? 'module' : 'course';
  const existingAttempts = await PortalQuizAttempt.find({
    accountId,
    courseId: toIdString(course._id),
    moduleId: module ? toIdString(module._id) : null,
    quizScope,
  }).sort({ attemptCount: -1 }).lean();

  const nextAttemptCount = (existingAttempts[0]?.attemptCount || 0) + 1;
  const attemptLimit = quiz.attemptLimit || 3;
  if (nextAttemptCount > attemptLimit) {
    throw new Error('Attempt limit reached for this quiz.');
  }

  let correctCount = 0;
  quiz.questions.forEach((question: any, index: number) => {
    if (answers[index] === question.correctAnswerIndex) {
      correctCount += 1;
    }
  });

  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercentage >= quiz.passingScore;

  const attempt = await PortalQuizAttempt.create({
    accountId,
    courseId: course._id,
    moduleId: module?._id,
    quizScope,
    scorePercentage,
    passed,
    attemptCount: nextAttemptCount,
    answers,
    questionCount: quiz.questions.length,
    passingScore: quiz.passingScore,
  });

  return { attempt, scorePercentage, passed };
}

export async function submitQuiz(courseId: string, answers: number[]) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    if (!course.quiz?.questions?.length) {
      throw new Error('Course quiz not found');
    }

    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const snapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });
    if (snapshot.progressPercentage < 100) {
      throw new Error('Complete all lessons before taking the final assessment.');
    }

    const result = await submitQuizAttempt({ accountId: account._id, course, answers });
    const refreshedAttempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const syncedSnapshot = await syncProgressState({ course, modules, lessonsByModule, progress, attempts: refreshedAttempts });

    revalidatePath('/portal/employee/academy');
    revalidatePath(`/portal/employee/academy/courses/${courseId}`);

    return {
      success: true,
      scorePercentage: result.scorePercentage,
      passed: result.passed,
      isCompleted: syncedSnapshot.isCompleted,
      attempt: serialize(result.attempt.toObject()),
    };
  } catch (error: any) {
    console.error('Error submitting final quiz:', error);
    return { success: false, error: error.message || 'Failed to submit quiz' };
  }
}

export async function submitModuleQuiz(courseId: string, moduleId: string, answers: number[]) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    const module = modules.find((item: any) => sameId(item._id, moduleId));
    if (!module?.quiz?.questions?.length) {
      throw new Error('Module quiz not found');
    }

    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const snapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });
    const moduleState = snapshot.moduleStates.find((state) => state.moduleId === moduleId);
    if (!moduleState?.isUnlocked) {
      throw new Error('This module is still locked.');
    }
    if ((moduleState?.completedLessons || 0) < (moduleState?.totalLessons || 0)) {
      throw new Error('Complete all lessons in the module before taking the quiz.');
    }

    const result = await submitQuizAttempt({ accountId: account._id, course, module, answers });
    const refreshedAttempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const syncedSnapshot = await syncProgressState({ course, modules, lessonsByModule, progress, attempts: refreshedAttempts });

    revalidatePath('/portal/employee/academy');
    revalidatePath(`/portal/employee/academy/courses/${courseId}`);

    return {
      success: true,
      scorePercentage: result.scorePercentage,
      passed: result.passed,
      moduleUnlocked: syncedSnapshot.moduleStates.find((state) => state.moduleId === moduleId)?.quizPassed || false,
      attempt: serialize(result.attempt.toObject()),
    };
  } catch (error: any) {
    console.error('Error submitting module quiz:', error);
    return { success: false, error: error.message || 'Failed to submit module quiz' };
  }
}

export async function getModuleQuizView(courseId: string, moduleId: string) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    const module = modules.find((item: any) => sameId(item._id, moduleId));
    if (!module?.quiz?.questions?.length) {
      throw new Error('Module quiz not found');
    }

    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const snapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });
    const moduleState = snapshot.moduleStates.find((state) => state.moduleId === moduleId);

    return {
      success: true,
      course: serialize(course),
      module: serialize(module),
      moduleState: serialize(moduleState),
      attempts: serialize(getLatestAttempts(attempts, 'module', moduleId)),
    };
  } catch (error: any) {
    console.error('Error loading module quiz:', error);
    return { success: false, error: error.message || 'Failed to load module quiz' };
  }
}

export async function getCourseQuizView(courseId: string) {
  try {
    const account = await getAuthedAccount();
    await ensurePortalAcademySeeded();

    const { course, modules, lessonsByModule } = await getCourseStructure(courseId);
    if (!course.quiz?.questions?.length) {
      throw new Error('Course quiz not found');
    }

    const progress = await getProgressDoc(account._id, courseId);
    const attempts = await PortalQuizAttempt.find({ accountId: account._id, courseId }).lean();
    const snapshot = computeProgressSnapshot({ course, modules, lessonsByModule, progress, attempts });

    return {
      success: true,
      course: serialize(course),
      progress: serialize(progress.toObject()),
      canTakeQuiz: snapshot.progressPercentage === 100,
      attempts: serialize(getLatestAttempts(attempts, 'course')),
    };
  } catch (error: any) {
    console.error('Error loading course quiz:', error);
    return { success: false, error: error.message || 'Failed to load course quiz' };
  }
}
