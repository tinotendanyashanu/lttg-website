import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommissionLedgerType = 
  | 'commission_earned'
  | 'commission_approved'
  | 'commission_paid'
  | 'refund'
  | 'academy_bonus'
  | 'adjustment';

export interface ICommissionLedger extends Document {
  partnerId?: mongoose.Types.ObjectId;  // for partners
  accountId?: mongoose.Types.ObjectId;  // for interns/employees
  type: CommissionLedgerType;
  amount: number;
  relatedDealId?: mongoose.Types.ObjectId;
  relatedCaseId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionLedgerSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Partner', index: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', index: true },
  type: {
    type: String,
    enum: [
      'commission_earned',
      'commission_approved',
      'commission_paid',
      'refund',
      'academy_bonus',
      'adjustment'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  relatedDealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
  relatedCaseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  batchId: { type: Schema.Types.ObjectId, ref: 'PayoutBatch' },
}, { timestamps: true });

const CommissionLedger: Model<ICommissionLedger> = mongoose.models.CommissionLedger || mongoose.model<ICommissionLedger>('CommissionLedger', CommissionLedgerSchema);

export default CommissionLedger;
