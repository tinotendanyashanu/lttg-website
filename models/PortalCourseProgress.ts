import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalCourseProgress extends Document {
  accountId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessonIds: mongoose.Types.ObjectId[];
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PortalCourseProgressSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  completedLessonIds: [{ type: Schema.Types.ObjectId, ref: 'PortalLesson' }],
  progressPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

export const PortalCourseProgress: Model<IPortalCourseProgress> = mongoose.models.PortalCourseProgress || mongoose.model<IPortalCourseProgress>('PortalCourseProgress', PortalCourseProgressSchema);
