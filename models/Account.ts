import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  roles: string[];
  linkedClientAccountId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  isActive: boolean;
  profileImageUrl?: string;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  commissionStats: {
    pendingCommission: number;
    approvedBalance: number;
    paidCommission: number;
    totalEarned: number;
  };
  clientProfile?: {
    companyName?: string;
    companyAddress?: string;
    phone?: string;
    website?: string;
    industry?: string;
    companySize?: string;
    notes?: string;
  };
  passwordSetupRequired?: boolean;
}

const AccountSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: [] },
  linkedClientAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  isActive: { type: Boolean, default: true },
  profileImageUrl: { type: String },
  jobTitle: { type: String },
  department: { type: String },
  phoneNumber: { type: String },
  location: { type: String },
  bio: { type: String },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  commissionStats: {
    pendingCommission: { type: Number, default: 0 },
    approvedBalance: { type: Number, default: 0 },
    paidCommission: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
  clientProfile: {
    companyName: { type: String },
    companyAddress: { type: String },
    phone: { type: String },
    website: { type: String },
    industry: { type: String },
    companySize: { type: String },
    notes: { type: String },
  },
  passwordSetupRequired: { type: Boolean, default: false },
});

AccountSchema.index({ linkedClientAccountId: 1 });

export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
