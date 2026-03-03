import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommissionStatus = 'pending' | 'paid';

export interface ICommission extends Document {
  accountId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  amount: number;
  status: CommissionStatus;
  paidAt?: Date | null;
  createdAt: Date;
}

const CommissionSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Index for idempotency checks
CommissionSchema.index({ leadId: 1 }, { unique: true });

const Commission: Model<ICommission> = mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);

export default Commission;
