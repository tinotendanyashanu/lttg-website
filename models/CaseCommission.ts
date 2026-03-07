import mongoose, { Schema, Document, Model } from 'mongoose';

export type CaseCommissionStatus = 'pending' | 'paid';

export interface ICaseCommission extends Document {
  caseId: mongoose.Types.ObjectId;
  totalCommission: number;
  status: CaseCommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CaseCommissionSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
  totalCommission: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, { timestamps: true });

export const CaseCommission: Model<ICaseCommission> =
  mongoose.models.CaseCommission || mongoose.model<ICaseCommission>('CaseCommission', CaseCommissionSchema);
