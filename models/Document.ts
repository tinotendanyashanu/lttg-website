import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocEntityType = 'case' | 'client' | 'partner';

export interface IDocument extends Document {
  entityType: DocEntityType;
  entityId: mongoose.Types.ObjectId;
  name: string;
  url?: string;        // external URL (Google Drive, Dropbox, etc.)
  fileKey?: string;    // local file path relative to /public/uploads (if uploaded)
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    entityType: { type: String, enum: ['case', 'client', 'partner'], required: true },
    entityId:   { type: Schema.Types.ObjectId, required: true },
    name:       { type: String, required: true, trim: true, maxlength: 200 },
    url:        { type: String },
    fileKey:    { type: String },
    mimeType:   { type: String },
    sizeBytes:  { type: Number },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  },
  { timestamps: true },
);

DocumentSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

const DocModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocModel;
