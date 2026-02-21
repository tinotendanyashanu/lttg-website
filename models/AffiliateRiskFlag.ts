import mongoose, { Schema, Document, Model } from 'mongoose';

export type RiskFlagType =
  | 'duplicate_client'
  | 'cross_affiliate_email'
  | 'self_referral'
  | 'deal_value_spike';

export type RiskFlagSeverity = 'low' | 'medium' | 'high';

export interface IAffiliateRiskFlag extends Document {
  partnerId: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  type: RiskFlagType;
  severity: RiskFlagSeverity;
  message: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateRiskFlagSchema: Schema = new Schema(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
    type: {
      type: String,
      enum: ['duplicate_client', 'cross_affiliate_email', 'self_referral', 'deal_value_spike'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

// Index for efficient querying by partner and deal
AffiliateRiskFlagSchema.index({ partnerId: 1, resolved: 1 });
AffiliateRiskFlagSchema.index({ dealId: 1 });
// Compound index for deduplication guard: isDuplicateFlag() query path
AffiliateRiskFlagSchema.index({ partnerId: 1, type: 1, resolved: 1 });

const AffiliateRiskFlag: Model<IAffiliateRiskFlag> =
  mongoose.models.AffiliateRiskFlag ||
  mongoose.model<IAffiliateRiskFlag>('AffiliateRiskFlag', AffiliateRiskFlagSchema);

export default AffiliateRiskFlag;
