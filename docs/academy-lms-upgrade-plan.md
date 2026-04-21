# Academy LMS Upgrade Plan

## Purpose

Upgrade the existing Academy feature into an enterprise-grade LMS without rebuilding it from scratch, without deleting data, and without breaking current behavior.

This plan is based on the current implementation in:

- [lib/actions/portalAcademy.ts](/home/tinotenda/Desktop/frontend/lib/actions/portalAcademy.ts)
- [lib/actions/portal-admin-academy.ts](/home/tinotenda/Desktop/frontend/lib/actions/portal-admin-academy.ts)
- [models/PortalCourse.ts](/home/tinotenda/Desktop/frontend/models/PortalCourse.ts)
- [models/PortalModule.ts](/home/tinotenda/Desktop/frontend/models/PortalModule.ts)
- [models/PortalLesson.ts](/home/tinotenda/Desktop/frontend/models/PortalLesson.ts)
- [models/PortalCourseProgress.ts](/home/tinotenda/Desktop/frontend/models/PortalCourseProgress.ts)
- [models/PortalQuizAttempt.ts](/home/tinotenda/Desktop/frontend/models/PortalQuizAttempt.ts)
- [models/Course.ts](/home/tinotenda/Desktop/frontend/models/Course.ts)
- [models/Partner.ts](/home/tinotenda/Desktop/frontend/models/Partner.ts)
- [app/portal/(dashboard)/academy/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/page.tsx)
- [app/portal/(dashboard)/academy/courses/[courseId]/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/courses/[courseId]/page.tsx)
- [app/portal/(dashboard)/academy/courses/[courseId]/lessons/[lessonId]/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/courses/[courseId]/lessons/[lessonId]/page.tsx)
- [app/portal/(dashboard)/admin/academy/AcademyManagerClient.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/admin/academy/AcademyManagerClient.tsx)

## Current Architecture Summary

### Legacy Academy path

- `Course` stores flat embedded lessons and an embedded final exam.
- `Partner.partnerProgress[]` stores progress inline per partner.
- Used by the partner dashboard Academy pages and legacy `lib/actions/academy.ts`.

### Portal Academy path

- `PortalCourse`, `PortalModule`, and `PortalLesson` already exist as separate collections.
- `PortalCourseProgress` already stores user progress separately.
- `PortalQuizAttempt` already stores quiz attempts separately.
- Used by portal Academy pages and admin Academy actions.

### Current gaps

- No deadline or required-course policy.
- No module-level unlock rules.
- Lesson completion allows skipping.
- Quiz logic is course-level only and has no attempt limit.
- No manager dashboard or analytics layer.
- Admin builder is functional but minimal and not enterprise-oriented.

## Recommended Upgrade Strategy

### Primary principle

Treat the portal Academy as the canonical LMS foundation and extend it additively.

### Compatibility principle

Preserve the legacy partner Academy for existing partner-facing usage, but do not expand its data model aggressively. Use a phased bridge if the business later wants the partner Academy migrated to the same LMS foundation.

### Why

- The portal path already has normalized course/module/lesson/progress/quiz collections.
- It is closer to the target LMS than the legacy embedded `Course` and `Partner.partnerProgress` model.
- Extending the portal path reduces migration risk and avoids destabilizing legacy partner bonus logic.

## 1. Safe Migration Plan

### Phase 1: additive schema changes

Make only additive changes to existing portal collections. Do not rename or remove current fields.

#### `PortalCourse`

Add:

- `slug?: string`
- `summary?: string`
- `estimatedDurationMinutes?: number`
- `orderIndex?: number`
- `isRequired?: boolean`
- `deadlineAt?: Date`
- `managerVisibility?: 'team' | 'department' | 'all'`
- `certificateEnabled?: boolean`
- `courseVersion?: number`
- `prerequisiteCourseIds?: ObjectId[]`
- `analyticsEnabled?: boolean`

Keep existing fields:

- `title`
- `description`
- `targetRoles`
- `difficultyLevel`
- `isPublished`
- `quiz`

#### `PortalModule`

Add:

- `description?: string`
- `slug?: string`
- `unlockRule?: 'sequential' | 'quiz_pass' | 'manual'`
- `requiredQuizId?: ObjectId`
- `estimatedDurationMinutes?: number`
- `isPublished?: boolean`

Keep:

- `courseId`
- `title`
- `orderIndex`

#### `PortalLesson`

Add:

- `lessonType?: 'video' | 'text' | 'file' | 'quiz' | 'task'`
- `slug?: string`
- `richContent?: string`
- `fileAssets?: { url: string; name?: string; mimeType?: string; sizeBytes?: number }[]`
- `isRequired?: boolean`
- `completionMode?: 'manual' | 'video_watch' | 'quiz_pass' | 'task_submit'`
- `minWatchPercent?: number`
- `taskConfig?: { instructions?: string; submissionType?: 'text' | 'file' | 'link' }`
- `unlockAfterLessonId?: ObjectId`
- `isPublished?: boolean`

Keep:

- `moduleId`
- `courseId`
- `title`
- `content`
- `videoUrl`
- `attachments`
- `estimatedDuration`
- `orderIndex`

### Phase 2: new supporting collections

Add new collections rather than overloading existing ones.

#### `PortalModuleQuiz`

Use when a quiz belongs to a module rather than the whole course.

Fields:

- `courseId`
- `moduleId`
- `title`
- `questions[]`
- `passingScore`
- `attemptLimit?: number`
- `isRequiredToUnlockNextModule`

#### `PortalLessonProgress`

Normalized lesson-level progress. Keep `PortalCourseProgress` for compatibility and rollups.

Fields:

- `accountId`
- `courseId`
- `moduleId`
- `lessonId`
- `status: 'not_started' | 'in_progress' | 'completed' | 'locked'`
- `startedAt?`
- `completedAt?`
- `lastVisitedAt?`
- `watchPercent?: number`
- `completionSource?: 'manual' | 'auto' | 'admin_override'`

Indexes:

- unique `{ accountId, lessonId }`
- `{ accountId, courseId, moduleId }`

#### `PortalModuleProgress`

Optional materialized rollup for fast reporting.

Fields:

- `accountId`
- `courseId`
- `moduleId`
- `completedLessonCount`
- `totalLessonCount`
- `completionPercentage`
- `quizPassed`
- `isUnlocked`
- `completedAt?`

#### `PortalTaskSubmission`

Fields:

- `accountId`
- `courseId`
- `moduleId`
- `lessonId`
- `submissionType`
- `textValue?`
- `fileUrl?`
- `linkUrl?`
- `status: 'submitted' | 'reviewed' | 'approved' | 'rejected'`
- `reviewedBy?`
- `reviewedAt?`

### Phase 3: data backfill

Run idempotent backfill jobs.

1. Backfill `slug`, `orderIndex`, and `isPublished` defaults on `PortalCourse`, `PortalModule`, and `PortalLesson`.
2. For each `PortalCourseProgress.completedLessonIds`, create or upsert `PortalLessonProgress` rows with `status = completed`.
3. Compute `PortalModuleProgress` from lesson progress.
4. Leave existing `PortalCourseProgress` intact and continue writing to it during the transition.

### Phase 4: dual-write period

For a limited period:

- Write lesson completion to `PortalLessonProgress`
- Recompute and persist rollups to `PortalCourseProgress`
- Continue reading `PortalCourseProgress` in old UI until upgraded pages are shipped

### Phase 5: compatibility bridge for legacy partner Academy

Do not migrate legacy `Course` and `Partner.partnerProgress` immediately unless there is a business requirement to unify both academies.

If unification becomes necessary:

1. Create mapping records from `Course` to `PortalCourse`
2. Map embedded lessons to `PortalLesson`
3. Backfill `PortalLessonProgress` from `Partner.partnerProgress.completedLessons`
4. Keep legacy partner pages reading old data until parity is proven

## 2. Updated Database Schema

### Canonical enterprise LMS schema

#### Courses

- `PortalCourse`
- `PortalModule`
- `PortalLesson`
- `PortalModuleQuiz`

#### Learner state

- `PortalLessonProgress`
- `PortalModuleProgress`
- `PortalCourseProgress`
- `PortalQuizAttempt`
- `PortalTaskSubmission`

#### Reporting

Optional materialized analytics collections if scale requires them later:

- `PortalCourseAnalyticsDaily`
- `PortalTeamTrainingSnapshot`

### Relationship model

`PortalCourse`
-> has many `PortalModule`

`PortalModule`
-> has many `PortalLesson`
-> may have one or more `PortalModuleQuiz`

`Account`
-> has many `PortalLessonProgress`
-> has many `PortalCourseProgress`
-> has many `PortalQuizAttempt`

`Account.teamId`
-> used for manager-level reporting and team completion rollups

## 3. API Extension Plan

### Guiding rule

Extend the existing action layer and add new routes or server actions. Do not replace existing functions such as:

- `getAvailableCourses`
- `getCourseWithDetails`
- `getLessonContent`
- `markLessonComplete`
- `submitQuiz`

### Existing behavior to preserve

- Course listing by target role
- Course detail loading
- Basic lesson completion
- Basic course quiz submission
- Existing admin CRUD for courses, modules, lessons

### Extend server actions first

Recommended additions in `lib/actions/portalAcademy.ts` and adjacent files:

- `getCourseOutline(courseId)`
- `getLessonNavigation(courseId, lessonId)`
- `validateLessonUnlock(courseId, lessonId)`
- `markLessonStarted(courseId, lessonId)`
- `markLessonComplete(courseId, lessonId, context?)`
- `submitModuleQuiz(moduleId, answers)`
- `getCourseProgressSummary(courseId)`
- `getRequiredCourses()`
- `getOverdueCourses()`
- `getManagerTeamAcademyOverview(teamId?)`
- `getManagerEmployeeProgress(employeeId)`
- `getAdminAcademyAnalytics(filters?)`

### Route surface to add

If the codebase wants REST endpoints in parallel with server actions:

- `GET /api/academy/modules?courseId=...`
- `GET /api/academy/lessons?courseId=...&moduleId=...`
- `POST /api/academy/progress/lessons/:lessonId/complete`
- `POST /api/academy/quizzes/modules/:moduleId/submit`
- `GET /api/academy/progress/courses/:courseId`
- `GET /api/academy/analytics/courses/:courseId`
- `GET /api/academy/manager/team-progress`

### Backward-compatible response evolution

When extending existing course-detail responses, add fields rather than reshaping existing ones.

For `getCourseWithDetails(courseId)`, add:

- `moduleProgress`
- `lessonStates`
- `nextLessonId`
- `lockedLessonIds`
- `required`
- `deadlineAt`
- `overdue`
- `quizRequirements`

For `getLessonContent(lessonId)`, add:

- `isLocked`
- `unlockReason`
- `navigation`
- `completionPolicy`
- `moduleQuizStatus`

### Locking and completion logic

`markLessonComplete` should stop being permissive.

Validation sequence:

1. Ensure course exists and user has access.
2. Ensure lesson exists and belongs to the course.
3. Ensure previous lesson in sequence is completed.
4. If lesson is in a locked module, reject completion.
5. If lesson completion mode requires a watch threshold or task submission, validate it.
6. Upsert `PortalLessonProgress`.
7. Recompute module and course rollups.
8. If module is fully complete and its quiz is required, keep next module locked until quiz is passed.

### Quiz rules

Extend `PortalQuizAttempt` rather than replacing it.

Add:

- `moduleId?: ObjectId`
- `quizId?: ObjectId`
- `passingScoreSnapshot?: number`
- `attemptLimitSnapshot?: number`
- `questionCount?: number`
- `submittedAt?: Date`

Validation:

1. Check the quiz belongs to the learner’s visible course/module.
2. Enforce attempt limit.
3. Store every attempt.
4. Update module unlock state when passed.

## 4. Frontend Upgrade Plan

### Principle

Enhance the existing UI rather than redesigning it.

### Existing pages to extend

- [app/portal/(dashboard)/academy/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/page.tsx)
- [app/portal/(dashboard)/academy/courses/[courseId]/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/courses/[courseId]/page.tsx)
- [app/portal/(dashboard)/academy/courses/[courseId]/lessons/[lessonId]/page.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/academy/courses/[courseId]/lessons/[lessonId]/page.tsx)
- [app/portal/(dashboard)/admin/academy/AcademyManagerClient.tsx](/home/tinotenda/Desktop/frontend/app/portal/(dashboard)/admin/academy/AcademyManagerClient.tsx)

### Learner Academy dashboard

Keep current course-card layout, but add:

- required-course badge
- deadline badge
- overdue state
- locked/unlocked course status if prerequisite courses exist
- quick progress breakdown:
  - lessons complete
  - module count
  - quiz status

### Course detail page

Keep the current curriculum card layout, but add:

- left sidebar or sticky outline for modules and lessons
- lesson lock icon
- module completion percentage
- module quiz row after lessons
- next recommended lesson CTA
- required training banner
- overdue warning banner

### Lesson page

Keep the current content shell, but add:

- previous/next lesson navigation
- completion rule messaging
- disabled completion CTA when prerequisites are unmet
- locked-state guard before rendering lesson content
- module progress block
- quiz launch CTA when the module is complete

### Admin course builder

Extend `AcademyManagerClient` instead of replacing it.

Add:

- module description editing
- lesson type selector
- lesson rich-text editor
- video URL field
- attachment upload management
- quiz builder per module
- course required/deadline settings
- drag-and-drop ordering for modules and lessons
- validation panel for publish readiness

### Manager dashboard

Add a new page under the portal dashboard, for example:

- `/portal/manager/academy`

Sections:

- team completion summary
- required-course compliance
- overdue learners
- low quiz performers
- per-course team matrix
- drill-down to an employee learning profile

Use `Account.teamId` plus `roles` to scope the data.

### Admin analytics

Add a new tab or page extension under admin Academy:

- completion rates per course
- average score by course/module
- attempt distribution
- drop-off lesson/module
- required-course compliance trend

## 5. Rollout Sequence

### Release 1

- Add additive schema fields
- Add `PortalLessonProgress`
- Dual-write progress updates
- Add course required/deadline metadata support

### Release 2

- Enforce sequential lesson completion
- Add module unlock rules
- Add module quiz support
- Add attempt-limit enforcement

### Release 3

- Upgrade admin builder
- Ship learner UI enhancements
- Add manager dashboard

### Release 4

- Add analytics and drop-off reporting
- Backfill materialized reporting snapshots if needed

## 6. Risk Points And How To Avoid Breaking The System

### Risk: breaking current progress display

Cause:

- Replacing `PortalCourseProgress` reads too early

Mitigation:

- Keep `PortalCourseProgress` as the UI-compatible rollup model during rollout
- Compute it from `PortalLessonProgress`
- Do not remove `completedLessonIds`, `progressPercentage`, or `isCompleted`

### Risk: existing admin screens stop working

Cause:

- Changing required payloads for course/module/lesson CRUD

Mitigation:

- Make all new fields optional
- Default missing values in the model layer
- Add new admin controls incrementally

### Risk: learners get locked out unexpectedly

Cause:

- Turning on progression enforcement for old progress records without backfill

Mitigation:

- Backfill lesson progress before enabling locks
- Feature-flag progression enforcement
- Allow admin override on progress state

### Risk: quiz attempts become inconsistent

Cause:

- Reusing `PortalQuizAttempt` without distinguishing course-level and module-level attempts

Mitigation:

- Add `moduleId` and `quizId`
- Keep old course-level records valid with nullable module fields

### Risk: reporting queries become too slow

Cause:

- Aggregating team analytics directly from raw lesson progress at runtime

Mitigation:

- Add targeted indexes
- Use materialized rollups for manager/admin dashboards if needed
- Cache analytics summaries where acceptable

### Risk: legacy partner Academy is accidentally broken

Cause:

- Mixing portal LMS changes into `Course`, `Partner`, or `lib/actions/academy.ts`

Mitigation:

- Treat legacy partner Academy as a separate compatibility boundary
- Do not migrate or rewrite it in the first LMS upgrade phase
- Introduce bridging only when explicit parity and migration requirements exist

### Risk: deadlines become advisory only

Cause:

- UI-only deadline display with no query support

Mitigation:

- Store `isRequired` and `deadlineAt` on the course model
- Add overdue-calculation helpers in the server layer
- Expose overdue state in both learner and manager queries

## 7. Recommended First Implementation Slice

The safest first production slice is:

1. Add additive fields to `PortalCourse`, `PortalModule`, `PortalLesson`, and `PortalQuizAttempt`
2. Add `PortalLessonProgress`
3. Update `markLessonComplete` to dual-write rollups, but keep permissive mode behind a feature flag
4. Extend `getCourseWithDetails` and `getLessonContent` to return lock and deadline metadata
5. Add learner UI badges for required and overdue courses
6. Add admin fields for required course and deadline

This delivers visible LMS progress without destabilizing the current Academy paths.

## Decision Summary

- Do not rebuild Academy.
- Use the portal Academy collections as the enterprise LMS foundation.
- Keep legacy partner Academy intact during the first upgrade phases.
- Introduce normalized lesson progress and additive policy fields first.
- Roll out locked progression, module quizzes, manager views, and analytics in phases.
