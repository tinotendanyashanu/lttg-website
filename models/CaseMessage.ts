import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICaseMessage extends Document {
  caseId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: 'client' | 'admin' | 'employee' | 'intern';
  body: string;
  readByAdmin: boolean;
  readByClient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CaseMessageSchema: Schema = new Schema(
  {
    caseId:        { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    authorId:      { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    authorRole:    { type: String, enum: ['client', 'admin', 'employee', 'intern'], required: true },
    body:          { type: String, required: true, maxlength: 4000, trim: true },
    readByAdmin:   { type: Boolean, default: false },
    readByClient:  { type: Boolean, default: false },
  },
  { timestamps: true },
);

CaseMessageSchema.index({ caseId: 1, createdAt: 1 });

const CaseMessage: Model<ICaseMessage> =
  mongoose.models.CaseMessage || mongoose.model<ICaseMessage>('CaseMessage', CaseMessageSchema);

export default CaseMessage;
