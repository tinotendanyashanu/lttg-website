import mongoose, { Schema, Document, Model } from 'mongoose';

export type CaseStatus = 'new' | 'active' | 'needs_assistance' | 'closed';
export type CasePaymentStatus = 'pending' | 'partial' | 'received';

export interface ICase extends Document {
  caseId: string;
  businessName?: string;
  contactName: string;
  email: string;
  phone: string;
  industry?: string;
  location?: string;
  serviceInterest: string;
  urgencyLevel?: string;
  source?: string;
  notes?: string;
  dealValue?: number;
  status: CaseStatus;
  paymentStatus: CasePaymentStatus;
  paymentReceivedAt?: Date;
  ownerId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  assistingMembers: mongoose.Types.ObjectId[];
  teamId?: mongoose.Types.ObjectId;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema({
  caseId: { type: String, required: true, unique: true },
  businessName: { type: String },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  industry: { type: String },
  location: { type: String },
  serviceInterest: { type: String, required: true },
  urgencyLevel: { type: String },
  source: { type: String },
  notes: { type: String },
  dealValue: { type: Number },
  status: {
    type: String,
    enum: ['new', 'active', 'needs_assistance', 'closed'],
    default: 'new'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'received'],
    default: 'pending'
  },
  paymentReceivedAt: { type: Date },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  assistingMembers: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  closedAt: { type: Date }
}, { timestamps: true });

CaseSchema.index({ ownerId: 1, createdAt: -1 });
CaseSchema.index({ status: 1 });

export const Case: Model<ICase> =
  mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
