import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
export type LeadSource = 'manual' | 'referral_link' | 'contact_form' | 'consultation_form' | 'project_inquiry';

export interface ILead extends Document {
  partnerId: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  source: LeadSource;
  status: LeadStatus;
  relatedDealId?: mongoose.Types.ObjectId;
  // Legacy fields kept for backward compatibility
  bookedCall: boolean;
  converted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  source: {
    type: String,
    enum: ['manual', 'referral_link', 'contact_form', 'consultation_form', 'project_inquiry'],
    default: 'referral_link'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'rejected'],
    default: 'new'
  },
  relatedDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  // Legacy fields
  bookedCall: { type: Boolean, default: false },
  converted: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for query performance
LeadSchema.index({ partnerId: 1, createdAt: -1 });
LeadSchema.index({ partnerId: 1, status: 1 });
LeadSchema.index({ clientEmail: 1 }, { sparse: true });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
