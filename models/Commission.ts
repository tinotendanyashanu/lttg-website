import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommissionStatus = 'pending' | 'approved' | 'paid';

export interface ICommission extends Document {
  accountId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  commissionRate: number;
  role: 'intern' | 'employee';
  amount: number;
  status: CommissionStatus;
  approvedAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
}

const CommissionSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  commissionRate: { type: Number, required: true },
  role: { type: String, enum: ['intern', 'employee'], required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid'],
    default: 'pending'
  },
  approvedAt: { type: Date, default: null },
  paidAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Index for looking up by account and case
CommissionSchema.index({ accountId: 1, status: 1 });
CommissionSchema.index({ caseId: 1 });

const Commission: Model<ICommission> = mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);

export default Commission;
