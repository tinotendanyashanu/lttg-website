import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  email: string;
  companyName?: string;
  password?: string; // Optional because initial signups might be OAuth or awaiting password set
  role: 'partner' | 'admin';
  partnerType: 'standard' | 'creator';
  tier: 'referral' | 'agency' | 'enterprise' | 'creator';
  referralCode?: string;
  status: 'active' | 'suspended' | 'pending';
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    sortCode?: string;
    iban?: string;
  };
  stats: {
    totalReferredRevenue: number;
    totalCommissionEarned: number;
    pendingCommission: number;
    approvedBalance: number;
    paidCommission: number;
    paidDealsSinceLastPayout: number;
    referralClicks: number;
    referralLeads: number;
  };
  countryOfResidence?: string;
  payoutMethod?: 'Wise' | 'Bank Transfer' | 'USDT (TRC20)' | 'PayPal' | 'Local Remittance';
  localRemittanceDetails?: {
    fullName: string;
    mobileNumber: string;
    city: string;
    preferredMethod: string;
  };
  hasReceivedAcademyBonus: boolean;
  hasCompletedOnboarding: boolean;
  partnerProgress: {
    courseId: string;
    completedLessons: string[];
    progressPercentage: number;
    isCompleted: boolean;
    examScore?: number;
    examAttempts?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
}

const PartnerSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['partner', 'admin'],
    default: 'partner' 
  },
  partnerType: {
    type: String,
    enum: ['standard', 'creator'],
    default: 'standard'
  },
  tier: { 
    type: String, 
    enum: ['referral', 'agency', 'enterprise', 'creator'],
    default: 'referral' 
  },
  referralCode: { type: String, unique: true, sparse: true },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'pending'],
    default: 'pending' 
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    sortCode: String,
    iban: String,
  },
  stats: {
    totalReferredRevenue: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    pendingCommission: { type: Number, default: 0 },
    approvedBalance: { type: Number, default: 0 },
    paidCommission: { type: Number, default: 0 },
    paidDealsSinceLastPayout: { type: Number, default: 0 },
    referralClicks: { type: Number, default: 0 },
    referralLeads: { type: Number, default: 0 },
  },
  countryOfResidence: { type: String },
  payoutMethod: {
    type: String,
    enum: ['Wise', 'Bank Transfer', 'USDT (TRC20)', 'PayPal', 'Local Remittance']
  },
  localRemittanceDetails: {
    fullName: String,
    mobileNumber: String,
    city: String,
    preferredMethod: String
  },
  hasReceivedAcademyBonus: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  hasCompletedOnboarding: { type: Boolean, default: false },
  partnerProgress: [{
    courseId: String,
    completedLessons: [String],
    progressPercentage: Number,
    isCompleted: Boolean,
    examScore: Number,
    examAttempts: { type: Number, default: 0 },
  }],
}, { timestamps: true });

// Prevent recompilation of model in development
const Partner: Model<IPartner> = mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner;
