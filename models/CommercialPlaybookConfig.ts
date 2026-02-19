import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPricingTier {
  serviceLevel: string;
  tier1: string;
  tier2: string;
  tier3: string;
}

export interface IServiceGuide {
  title: string;
  whoIsItFor: string;
  problemItSolves: string;
  includes: string[];
  doesNotInclude: string[];
  upgradePath: string;
}

export interface IRegionalGuideline {
  tier1: string;
  tier2: string;
  tier3: string;
  adjustmentExplanation: string;
}

export interface IScript {
  title: string;
  content: string;
  category: 'pricing' | 'objection' | 'closing' | 'other';
}

export interface ICommercialPlaybookConfig extends Document {
  pricingMatrix: IPricingTier[];
  serviceGuides: IServiceGuide[];
  regionalGuidelines: IRegionalGuideline;
  scripts: IScript[];
  escalationRules: string[];
  updatedBy?: string; // Admin email
  lastUpdated: Date;
}

const CommercialPlaybookSchema: Schema = new Schema({
  pricingMatrix: [{
    serviceLevel: { type: String, required: true },
    tier1: { type: String, required: true },
    tier2: { type: String, required: true },
    tier3: { type: String, required: true }
  }],
  serviceGuides: [{
    title: { type: String, required: true },
    whoIsItFor: { type: String, required: true },
    problemItSolves: { type: String, required: true },
    includes: [{ type: String }],
    doesNotInclude: [{ type: String }],
    upgradePath: { type: String, required: true }
  }],
  regionalGuidelines: {
    tier1: { type: String, default: "Full range" },
    tier2: { type: String, default: "20–30% lower" },
    tier3: { type: String, default: "40–50% lower, start smaller" },
    adjustmentExplanation: { type: String, default: "Adjust positioning tone based on client environment. Do not expose internal margin logic." }
  },
  scripts: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'pricing' }
  }],
  escalationRules: [{ type: String }],
  updatedBy: { type: String },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure we only have one config document? Or just fetch the latest one.
// We'll mostly just use findOne() for now.

const CommercialPlaybookConfig: Model<ICommercialPlaybookConfig> = mongoose.models.CommercialPlaybookConfig || mongoose.model<ICommercialPlaybookConfig>('CommercialPlaybookConfig', CommercialPlaybookSchema);

export default CommercialPlaybookConfig;
