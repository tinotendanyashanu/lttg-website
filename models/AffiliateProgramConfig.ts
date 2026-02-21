import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAffiliateProgramConfig extends Document {
  dealValueSpikeMultiplier: number; // e.g., 3 means flag at 3× historical median
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateProgramConfigSchema: Schema = new Schema(
  {
    dealValueSpikeMultiplier: { type: Number, default: 3 },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const AffiliateProgramConfig: Model<IAffiliateProgramConfig> =
  mongoose.models.AffiliateProgramConfig ||
  mongoose.model<IAffiliateProgramConfig>('AffiliateProgramConfig', AffiliateProgramConfigSchema);

export default AffiliateProgramConfig;
