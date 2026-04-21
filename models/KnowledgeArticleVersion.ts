import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKnowledgeArticleVersion extends Document {
  articleId: mongoose.Types.ObjectId | string;
  content: string;
  title: string;
  authorId: string; // email or account ID
  versionNumber: number;
  changeSummary?: string;
  createdAt: Date;
}

const KnowledgeArticleVersionSchema: Schema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle', required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  authorId: { type: String, required: true },
  versionNumber: { type: Number, required: true },
  changeSummary: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

KnowledgeArticleVersionSchema.index({ articleId: 1, versionNumber: -1 });

export const KnowledgeArticleVersion: Model<IKnowledgeArticleVersion> =
  mongoose.models.KnowledgeArticleVersion || mongoose.model<IKnowledgeArticleVersion>('KnowledgeArticleVersion', KnowledgeArticleVersionSchema);
