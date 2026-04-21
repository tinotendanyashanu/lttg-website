import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalQuizAttempt extends Document {
  accountId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  quizScope: 'course' | 'module';
  scorePercentage: number;
  passed: boolean;
  attemptCount: number;
  answers: number[]; // user's selected option indices
  questionCount?: number;
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PortalQuizAttemptSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: 'PortalModule' },
  quizScope: {
    type: String,
    enum: ['course', 'module'],
    default: 'course',
  },
  scorePercentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  attemptCount: { type: Number, required: true, default: 1 },
  answers: [{ type: Number }],
  questionCount: { type: Number },
  passingScore: { type: Number },
}, { timestamps: true });

PortalQuizAttemptSchema.index({ accountId: 1, courseId: 1, moduleId: 1, attemptCount: -1 });

export const PortalQuizAttempt: Model<IPortalQuizAttempt> = mongoose.models.PortalQuizAttempt || mongoose.model<IPortalQuizAttempt>('PortalQuizAttempt', PortalQuizAttemptSchema);
