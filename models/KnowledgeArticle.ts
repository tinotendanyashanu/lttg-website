import mongoose, { Schema, Document, Model } from 'mongoose';

export type RoleVisibility = 'intern' | 'employee' | 'admin' | 'all';
export type KnowledgeType = 'article' | 'resource' | 'policy';

export interface IKnowledgeArticle extends Document {
  title: string;
  slug: string;
  category: string;
  type: KnowledgeType;
  content: string; // markdown
  tags: string[];
  roleVisibility: RoleVisibility[];
  teamVisibility: string[];
  createdBy: string;
  viewCount: number;
  searchTerms: string[];
  isPublished: boolean;
  version: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['article', 'resource', 'policy'], default: 'article' },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  roleVisibility: { type: [String], default: ['all'] },
  teamVisibility: { type: [String], default: [] },
  createdBy: { type: String, required: true },
  viewCount: { type: Number, default: 0 },
  searchTerms: { type: [String], default: [] },
  isPublished: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  lastReviewedAt: { type: Date },
}, { timestamps: true });

KnowledgeArticleSchema.index({ category: 1 });
KnowledgeArticleSchema.index({ isPublished: 1 });
KnowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
KnowledgeArticleSchema.index({ roleVisibility: 1 });

export const KnowledgeArticle: Model<IKnowledgeArticle> =
  mongoose.models.KnowledgeArticle || mongoose.model<IKnowledgeArticle>('KnowledgeArticle', KnowledgeArticleSchema);
