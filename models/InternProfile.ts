import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInternProfile extends Document {
  accountId: mongoose.Types.ObjectId;
  commissionRate: number;
  createdAt: Date;
}

const InternProfileSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  commissionRate: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const InternProfile: Model<IInternProfile> = mongoose.models.InternProfile || mongoose.model<IInternProfile>('InternProfile', InternProfileSchema);

export default InternProfile;
