import mongoose, { Schema, Document, Model } from 'mongoose';

export type VisibilityLevel = 'team' | 'all';

export interface IComment extends Document {
  caseId: mongoose.Types.ObjectId;
  authorAccountId: mongoose.Types.ObjectId;
  message: string;
  visibilityLevel: VisibilityLevel;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  authorAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  message: { type: String, required: true },
  visibilityLevel: { type: String, enum: ['team', 'all'], default: 'team' },
}, { timestamps: true });

CommentSchema.index({ caseId: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
