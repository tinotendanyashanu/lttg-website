import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  email: string;
  companyName?: string;
  password?: string; // Optional because initial signups might be OAuth or awaiting password set
  role: 'partner' | 'admin';
  partnerType: 'partner' | 'influencer';
  primaryPlatform?: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'blog' | 'other';
  profileUrl?: string;
  audienceSize?: 'under_1k' | '1k_10k' | '10k_50k' | '50k_100k' | 'over_100k';
  tier: 'referral' | 'agency' | 'enterprise' | 'creator';
  referralCode?: string;
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
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
    referralClicks: number;
    referralLeads: number;
  };
  debtBalance: number;
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
  academyBonusIssuedAt?: Date;
  partnerProgress: {
    courseId: string;
    completedLessons: string[];
    progressPercentage: number;
    isCompleted: boolean;
    examScore?: number;
    examAttempts?: number;
  }[];
  // Tier Governance
  tierOverride: boolean;
  tierLocked: boolean;
  tierOverrideReason?: string;
  tierLastChangedAt?: Date;
  tierLastChangedBy?: string;
  // Legal & Compliance
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  termsAcceptedIp?: string;
  termsVersion?: string;
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
    enum: ['partner', 'influencer'],
    default: 'partner'
  },
  primaryPlatform: {
    type: String,
    enum: ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'other']
  },
  profileUrl: { type: String },
  audienceSize: {
    type: String,
    enum: ['under_1k', '1k_10k', '10k_50k', '50k_100k', 'over_100k']
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
    default: 'active' 
  },
  emailVerified: { type: Boolean, default: false },
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
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
    referralClicks: { type: Number, default: 0 },
    referralLeads: { type: Number, default: 0 },
  },
  debtBalance: { type: Number, default: 0 },
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
  // Tier Governance
  tierOverride: { type: Boolean, default: false },
  tierLocked: { type: Boolean, default: false },
  tierOverrideReason: { type: String },
  tierLastChangedAt: { type: Date },
  tierLastChangedBy: { type: String },
  // Legal & Compliance
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  termsAcceptedIp: { type: String },
  termsVersion: { type: String },
  hasReceivedAcademyBonus: { type: Boolean, default: false },
  academyBonusIssuedAt: Date,
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
