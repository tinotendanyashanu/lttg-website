import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  partnerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  source: string;
  bookedCall: boolean;
  converted: boolean;
  dealId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  source: { type: String, default: 'referral_link' },
  bookedCall: { type: Boolean, default: false },
  converted: { type: Boolean, default: false },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
}, { timestamps: true });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
