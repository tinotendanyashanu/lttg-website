import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected' | 'closed';
export type LeadSource = 'manual' | 'referral_link' | 'contact_form' | 'consultation_form' | 'project_inquiry' | 'chatbot';

export interface ILead extends Document {
  // Partner System fields
  partnerId?: mongoose.Types.ObjectId;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  source?: LeadSource;
  status: LeadStatus;
  relatedDealId?: mongoose.Types.ObjectId;
  bookedCall?: boolean;
  converted?: boolean;
  
  // Intern Lead System fields
  accountId?: mongoose.Types.ObjectId;
  businessName?: string;
  contactName?: string;
  phone?: string;
  serviceInterest?: string;
  notes?: string;
  dealValue?: number;
  teamId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  // Partner System
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' }, // Relaxed required
  clientName: { type: String }, // Relaxed required
  clientEmail: { type: String }, // Relaxed required
  clientPhone: { type: String },
  source: {
    type: String,
    enum: ['manual', 'referral_link', 'contact_form', 'consultation_form', 'project_inquiry', 'chatbot'],
    default: 'referral_link'
  },
  
  // Intern System
  accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  businessName: { type: String },
  contactName: { type: String },
  phone: { type: String },
  serviceInterest: { type: String },
  notes: { type: String },
  dealValue: { type: Number },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },

  // Shared
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'rejected', 'closed'],
    default: 'new'
  },
  relatedDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  bookedCall: { type: Boolean, default: false },
  converted: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for query performance
LeadSchema.index({ partnerId: 1, createdAt: -1 });
LeadSchema.index({ partnerId: 1, status: 1 });
LeadSchema.index({ clientEmail: 1 }, { sparse: true });
LeadSchema.index({ accountId: 1, createdAt: -1 });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
