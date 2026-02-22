import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeal extends Document {
  partnerId: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail?: string;
  estimatedValue: number;
  finalValue?: number;
  commissionRate: number; // e.g., 0.10 for 10%
  commissionAmount?: number;
  commissionStatus: 'Pending' | 'Approved' | 'Reversed' | 'Refunded' | 'Paid';
  saleDate?: Date;
  approvalDate?: Date;
  payoutBatchId?: mongoose.Types.ObjectId;
  dealStatus: 'registered' | 'under_review' | 'approved' | 'closed' | 'rejected';
  paymentStatus: 'pending' | 'received';
  paymentMethod?: 'cash' | 'bank_transfer' | 'stripe' | 'other';
  serviceType: 'SME' | 'Startup' | 'Enterprise' | 'Individual' | 'Internal';
  notes?: string;
  closedAt?: Date;
  paymentReceivedAt?: Date;
  commissionSource: 'DEAL' | 'ACADEMY_BONUS';
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  estimatedValue: { type: Number, required: true },
  finalValue: { type: Number },
  commissionRate: { type: Number, default: 0.10 }, // Default 10% commissioned
  commissionAmount: { type: Number },
  commissionStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Reversed', 'Refunded', 'Paid'],
    default: 'Pending'
  },
  saleDate: { type: Date },
  approvalDate: { type: Date },
  payoutBatchId: { type: Schema.Types.ObjectId, ref: 'PayoutBatch' },
  dealStatus: { 
    type: String, 
    enum: ['registered', 'under_review', 'approved', 'closed', 'rejected'],
    default: 'registered' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'received'],
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'stripe', 'other'] 
  },
  serviceType: {
    type: String,
    enum: ['SME', 'Startup', 'Enterprise', 'Individual', 'Internal'],
    required: true
  },
  notes: { type: String },
  closedAt: { type: Date },
  paymentReceivedAt: { type: Date },
  commissionSource: {
    type: String,
    enum: ['DEAL', 'ACADEMY_BONUS'],
    default: 'DEAL'
  }
}, { timestamps: true });

// Indexes for performant fraud detection queries
// sparse: true excludes legacy deals that don't have clientEmail yet
DealSchema.index({ clientEmail: 1 }, { sparse: true });
DealSchema.index({ partnerId: 1, clientEmail: 1 }, { sparse: true });

const Deal: Model<IDeal> = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);

export default Deal;
