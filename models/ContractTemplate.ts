import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContractTemplate extends Document {
  name: string;
  description?: string;
  category: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContractTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, default: 'General' },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ContractTemplateSchema.index({ category: 1, isActive: 1 });

export const ContractTemplate: Model<IContractTemplate> =
  mongoose.models.ContractTemplate ||
  mongoose.model<IContractTemplate>('ContractTemplate', ContractTemplateSchema);
