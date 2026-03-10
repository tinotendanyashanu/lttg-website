import mongoose, { Schema, Document, Model } from 'mongoose';

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'under_review'
  | 'signed'
  | 'active'
  | 'expired'
  | 'terminated';

export interface IClientContract extends Document {
  contractNumber: string;
  clientId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  title: string;
  type: string;
  status: ContractStatus;
  content?: string;
  startDate?: Date;
  endDate?: Date;
  signedAt?: Date;
  signerName?: string;
  signerIp?: string;
  documentUrl?: string;
  value?: number;
  currency?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientContractSchema: Schema = new Schema(
  {
    contractNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    title: { type: String, required: true },
    type: { type: String, default: 'Service Agreement' },
    status: {
      type: String,
      enum: [
        'draft',
        'sent',
        'under_review',
        'signed',
        'active',
        'expired',
        'terminated',
      ],
      default: 'draft',
    },
    content: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    signedAt: { type: Date },
    signerName: { type: String },
    signerIp: { type: String },
    documentUrl: { type: String },
    value: { type: Number },
    currency: { type: String, default: 'USD' },
    notes: { type: String },
  },
  { timestamps: true }
);

ClientContractSchema.index({ clientId: 1, createdAt: -1 });

export const ClientContract: Model<IClientContract> =
  mongoose.models.ClientContract ||
  mongoose.model<IClientContract>('ClientContract', ClientContractSchema);
