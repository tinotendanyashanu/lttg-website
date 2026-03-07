import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResourceRoleVisibility = 'intern' | 'employee' | 'admin' | 'all';

export interface IResource extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  roleVisibility: ResourceRoleVisibility[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  roleVisibility: { type: [String], default: ['all'] },
}, { timestamps: true });

ResourceSchema.index({ createdAt: -1 });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
