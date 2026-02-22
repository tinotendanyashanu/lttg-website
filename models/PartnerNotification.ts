import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPartnerNotification extends Document {
  partnerId: mongoose.Types.ObjectId;
  type: 'deal_registered' | 'payment_received' | 'commission_approved' | 'commission_paid' | 'tier_upgraded' | 'risk_flag_review';
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerNotificationSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
  type: {
    type: String,
    enum: ['deal_registered', 'payment_received', 'commission_approved', 'commission_paid', 'tier_upgraded', 'risk_flag_review'],
    required: true
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

PartnerNotificationSchema.index({ partnerId: 1, createdAt: -1 });
PartnerNotificationSchema.index({ partnerId: 1, read: 1 });

const PartnerNotification: Model<IPartnerNotification> = mongoose.models.PartnerNotification || mongoose.model<IPartnerNotification>('PartnerNotification', PartnerNotificationSchema);

export default PartnerNotification;
