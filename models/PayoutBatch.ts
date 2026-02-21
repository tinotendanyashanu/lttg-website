import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayoutBatch extends Document {
  payoutMonth: string; // e.g., '2023-10'
  payoutDate: Date; // e.g., 5th of the month
  totalAmount: number;
  status: 'Processing' | 'Completed';
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutBatchSchema: Schema = new Schema({
  payoutMonth: { type: String, required: true },
  payoutDate: { type: Date, required: true },
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Processing', 'Completed'],
    default: 'Processing' 
  },
  referenceNumber: { type: String },
}, { timestamps: true });

const PayoutBatch: Model<IPayoutBatch> = mongoose.models.PayoutBatch || mongoose.model<IPayoutBatch>('PayoutBatch', PayoutBatchSchema);

export default PayoutBatch;
