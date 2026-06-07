import mongoose, { Schema, Document, Model } from 'mongoose';

export type RoleVisibility = 'intern' | 'employee' | 'admin' | 'client' | 'all';
export type KnowledgeType = 'article' | 'resource' | 'policy';
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface IKnowledgeArticle extends Document {
  title: string;
  subtitle?: string;
  slug: string;
  category: string; // Deprecated, use categoryId
  categoryId?: mongoose.Types.ObjectId | string;
  type: KnowledgeType;
  status: ArticleStatus;
  content: string; // supports markdown or block-based JSON
  tags: string[];
  attachments: {
    name: string;
    url: string; // Google Drive links
  }[];
  roleVisibility: RoleVisibility[];
  teamVisibility: string[];
  createdBy: string;
  lastEditedBy?: string;
  viewCount: number;
  searchTerms: string[];
  isPublished: boolean; // Deprecated, use status
  version: number;
  relatedArticles: (mongoose.Types.ObjectId | string)[];
  backlinks: (mongoose.Types.ObjectId | string)[];
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
  embeddingUpdatedAt?: Date;
  embeddingModel?: string;
  // Knowledge classification + service/region scoping (additive, all optional)
  kind?: string; // one of KB_KINDS
  services: string[];
  regions: string[];
  // Retrieval & feedback analytics counters
  helpfulCount: number;
  notHelpfulCount: number;
  retrievalCount: number;
  lastRetrievedAt?: Date;
}

const KnowledgeArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // Keeping for compatibility
  categoryId: { type: Schema.Types.ObjectId, ref: 'KnowledgeCategory' },
  type: { type: String, enum: ['article', 'resource', 'policy'], default: 'article' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true }
  }],
  roleVisibility: { type: [String], default: ['all'] },
  teamVisibility: { type: [String], default: [] },
  createdBy: { type: String, required: true },
  lastEditedBy: { type: String },
  viewCount: { type: Number, default: 0 },
  searchTerms: { type: [String], default: [] },
  isPublished: { type: Boolean, default: false }, // Keeping for compatibility
  version: { type: Number, default: 1 },
  relatedArticles: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
  backlinks: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
  lastReviewedAt: { type: Date },
  embedding: { type: [Number], default: undefined, select: false },
  embeddingUpdatedAt: { type: Date },
  embeddingModel: { type: String },
  // Knowledge classification + service/region scoping
  kind: { type: String },
  services: { type: [String], default: [] },
  regions: { type: [String], default: [] },
  // Retrieval & feedback analytics counters
  helpfulCount: { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 },
  retrievalCount: { type: Number, default: 0 },
  lastRetrievedAt: { type: Date },
}, { timestamps: true });

KnowledgeArticleSchema.index({ category: 1 });
KnowledgeArticleSchema.index({ isPublished: 1 });
KnowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
KnowledgeArticleSchema.index({ roleVisibility: 1 });
KnowledgeArticleSchema.index({ kind: 1, status: 1 });
KnowledgeArticleSchema.index({ services: 1 });
KnowledgeArticleSchema.index({ regions: 1 });

export const KnowledgeArticle: Model<IKnowledgeArticle> =
  mongoose.models.KnowledgeArticle || mongoose.model<IKnowledgeArticle>('KnowledgeArticle', KnowledgeArticleSchema);
