import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommissionAllocationStatus = 'pending' | 'paid';

export interface ICommissionAllocation extends Document {
  caseCommissionId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  allocatedAmount: number;
  status: CommissionAllocationStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionAllocationSchema: Schema = new Schema({
  caseCommissionId: { type: Schema.Types.ObjectId, ref: 'CaseCommission', required: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  allocatedAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: { type: Date }
}, { timestamps: true });

CommissionAllocationSchema.index({ accountId: 1 });
CommissionAllocationSchema.index({ caseCommissionId: 1 });

export const CommissionAllocation: Model<ICommissionAllocation> =
  mongoose.models.CommissionAllocation || mongoose.model<ICommissionAllocation>('CommissionAllocation', CommissionAllocationSchema);
