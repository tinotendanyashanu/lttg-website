import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKnowledgeCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeCategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'KnowledgeCategory', default: null },
  icon: { type: String, default: 'folder' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

KnowledgeCategorySchema.index({ slug: 1 });
KnowledgeCategorySchema.index({ parent: 1 });

export const KnowledgeCategory: Model<IKnowledgeCategory> =
  mongoose.models.KnowledgeCategory || mongoose.model<IKnowledgeCategory>('KnowledgeCategory', KnowledgeCategorySchema);
