import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalQuizAttempt extends Document {
  accountId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  scorePercentage: number;
  passed: boolean;
  attemptCount: number;
  answers: number[]; // user's selected option indices
  createdAt: Date;
  updatedAt: Date;
}

const PortalQuizAttemptSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  scorePercentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  attemptCount: { type: Number, required: true, default: 1 },
  answers: [{ type: Number }],
}, { timestamps: true });

export const PortalQuizAttempt: Model<IPortalQuizAttempt> = mongoose.models.PortalQuizAttempt || mongoose.model<IPortalQuizAttempt>('PortalQuizAttempt', PortalQuizAttemptSchema);
