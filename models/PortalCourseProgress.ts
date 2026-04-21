import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPortalLessonProgressItem {
  lessonId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
}

interface IPortalModuleProgressItem {
  moduleId: mongoose.Types.ObjectId;
  completionPercentage: number;
  isCompleted: boolean;
  quizPassed: boolean;
  completedAt?: Date;
}

export interface IPortalCourseProgress extends Document {
  accountId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessonIds: mongoose.Types.ObjectId[];
  lessonProgress: IPortalLessonProgressItem[];
  moduleProgress: IPortalModuleProgressItem[];
  passedModuleQuizIds: mongoose.Types.ObjectId[];
  progressPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
  lastLessonId?: mongoose.Types.ObjectId;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PortalLessonProgressItemSchema = new Schema({
  lessonId: { type: Schema.Types.ObjectId, ref: 'PortalLesson', required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: 'PortalModule', required: true },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { _id: false });

const PortalModuleProgressItemSchema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'PortalModule', required: true },
  completionPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  quizPassed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { _id: false });

const PortalCourseProgressSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  completedLessonIds: [{ type: Schema.Types.ObjectId, ref: 'PortalLesson' }],
  lessonProgress: { type: [PortalLessonProgressItemSchema], default: [] },
  moduleProgress: { type: [PortalModuleProgressItemSchema], default: [] },
  passedModuleQuizIds: [{ type: Schema.Types.ObjectId, ref: 'PortalModule' }],
  progressPercentage: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'overdue'],
    default: 'not_started',
  },
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastLessonId: { type: Schema.Types.ObjectId, ref: 'PortalLesson' },
  lastActivityAt: { type: Date },
}, { timestamps: true });

PortalCourseProgressSchema.index({ accountId: 1, courseId: 1 }, { unique: true });

export const PortalCourseProgress: Model<IPortalCourseProgress> = mongoose.models.PortalCourseProgress || mongoose.model<IPortalCourseProgress>('PortalCourseProgress', PortalCourseProgressSchema);
