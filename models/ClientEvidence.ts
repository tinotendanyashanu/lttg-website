import mongoose, { Schema, Document, Model } from 'mongoose';

export type EvidenceType =
  | 'screenshot'
  | 'document'
  | 'video'
  | 'link'
  | 'archive'
  | 'other';

export interface IClientEvidence extends Document {
  clientId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: EvidenceType;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientEvidenceSchema: Schema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['screenshot', 'document', 'video', 'link', 'archive', 'other'],
      default: 'document',
    },
    url: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ClientEvidenceSchema.index({ clientId: 1, createdAt: -1 });
ClientEvidenceSchema.index({ caseId: 1 });

export const ClientEvidence: Model<IClientEvidence> =
  mongoose.models.ClientEvidence ||
  mongoose.model<IClientEvidence>('ClientEvidence', ClientEvidenceSchema);
