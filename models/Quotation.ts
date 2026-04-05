import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface IQuotation extends Document {
  quotationNumber: string;
  clientId?: mongoose.Types.ObjectId;
  prospectName?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  status: QuotationStatus;
  amount: number;
  currency: string;
  description?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  message?: string;
  notes?: string;
  validUntil?: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  convertedInvoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema: Schema<IQuotation> = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: false },
    prospectName: { type: String },
    prospectEmail: { type: String },
    prospectPhone: { type: String },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft',
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    description: { type: String },
    lineItems: [
      {
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number },
        total: { type: Number },
      },
    ],
    message: { type: String },
    notes: { type: String },
    validUntil: { type: Date },
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    convertedInvoiceId: { type: Schema.Types.ObjectId, ref: 'ClientInvoice' },
  },
  { timestamps: true }
);

QuotationSchema.index({ clientId: 1, createdAt: -1 });
QuotationSchema.index({ status: 1 });

export const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>('Quotation', QuotationSchema);
