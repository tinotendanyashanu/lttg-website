import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPortalQuiz } from './PortalCourse';

export interface IPortalModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  slug?: string;
  description?: string;
  orderIndex: number;
  unlockStrategy?: 'sequential' | 'quiz';
  estimatedDurationMinutes?: number;
  isPublished?: boolean;
  quiz?: IPortalQuiz;
  createdAt: Date;
  updatedAt: Date;
}

const PortalModuleQuizQuestionSchema = new Schema({
  id: { type: String },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String },
});

const PortalModuleQuizSchema = new Schema({
  title: { type: String },
  questions: [PortalModuleQuizQuestionSchema],
  passingScore: { type: Number, default: 80 },
  attemptLimit: { type: Number, default: 3 },
});

const PortalModuleSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  orderIndex: { type: Number, required: true, default: 0 },
  unlockStrategy: {
    type: String,
    enum: ['sequential', 'quiz'],
    default: 'sequential',
  },
  estimatedDurationMinutes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  quiz: { type: PortalModuleQuizSchema },
}, { timestamps: true });

PortalModuleSchema.index({ courseId: 1, orderIndex: 1 });

export const PortalModule: Model<IPortalModule> = mongoose.models.PortalModule || mongoose.model<IPortalModule>('PortalModule', PortalModuleSchema);
