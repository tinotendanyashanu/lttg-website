import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralClick extends Document {
  partnerId: mongoose.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralClickSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// Index for query performance
ReferralClickSchema.index({ partnerId: 1, createdAt: -1 });

const ReferralClick: Model<IReferralClick> = mongoose.models.ReferralClick || mongoose.model<IReferralClick>('ReferralClick', ReferralClickSchema);

export default ReferralClick;
