import mongoose, { Schema, Document, Model } from 'mongoose';

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface IClientInvoice extends Document {
  invoiceNumber: string;
  clientId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  issuedAt?: Date;
  dueAt?: Date;
  paidAt?: Date;
  pdfUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientInvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    description: { type: String },
    lineItems: [
      {
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number },
        total: { type: Number },
      },
    ],
    issuedAt: { type: Date },
    dueAt: { type: Date },
    paidAt: { type: Date },
    pdfUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

ClientInvoiceSchema.index({ clientId: 1, createdAt: -1 });
ClientInvoiceSchema.index({ status: 1 });

export const ClientInvoice: Model<IClientInvoice> =
  mongoose.models.ClientInvoice ||
  mongoose.model<IClientInvoice>('ClientInvoice', ClientInvoiceSchema);
