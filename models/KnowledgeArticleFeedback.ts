import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKnowledgeArticleFeedback extends Document {
  articleId: mongoose.Types.ObjectId | string;
  userEmail: string;
  isHelpful: boolean;
  comment?: string;
  createdAt: Date;
}

const KnowledgeArticleFeedbackSchema: Schema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle', required: true },
  userEmail: { type: String, required: true },
  isHelpful: { type: Boolean, required: true },
  comment: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

KnowledgeArticleFeedbackSchema.index({ articleId: 1 });

export const KnowledgeArticleFeedback: Model<IKnowledgeArticleFeedback> =
  mongoose.models.KnowledgeArticleFeedback || mongoose.model<IKnowledgeArticleFeedback>('KnowledgeArticleFeedback', KnowledgeArticleFeedbackSchema);
