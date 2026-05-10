import mongoose, { Schema, Document, Model } from 'mongoose';

export type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'issued'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'rejected';

export type InvoiceApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected';

export interface IPaymentHistoryEntry {
  amount: number;
  currency: string;
  method: string;
  notes?: string;
  recordedBy?: mongoose.Types.ObjectId;
  recordedAt: Date;
}

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
  // Partial payment tracking
  amountPaid: number;
  remainingBalance: number;
  depositPaid: number;
  paymentHistory: IPaymentHistoryEntry[];
  // Multi-currency: USD equivalent at time of creation/payment
  usdAmount?: number;
  exchangeRateUsed?: number;
  // Employee invoice approval workflow
  createdByEmployeeId?: mongoose.Types.ObjectId;
  approvalStatus: InvoiceApprovalStatus;
  approvedByAdminId?: mongoose.Types.ObjectId;
  approvalNotes?: string;
  submittedForApprovalAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientInvoiceSchema: Schema<IClientInvoice> = new Schema<IClientInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'issued', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'rejected'],
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
    // Partial payment tracking (backward-compatible: existing docs default to 0 / full amount)
    amountPaid: { type: Number, default: 0 },
    depositPaid: { type: Number, default: 0 },
    remainingBalance: { type: Number },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        method: { type: String, required: true },
        notes: { type: String },
        recordedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    // Multi-currency USD snapshot (optional — populated by exchange rate service)
    usdAmount: { type: Number },
    exchangeRateUsed: { type: Number },
    // Employee invoice approval workflow
    createdByEmployeeId: { type: Schema.Types.ObjectId, ref: 'Account' },
    approvalStatus: {
      type: String,
      enum: ['not_required', 'pending', 'approved', 'rejected'],
      default: 'not_required',
    },
    approvedByAdminId: { type: Schema.Types.ObjectId, ref: 'Account' },
    approvalNotes: { type: String },
    submittedForApprovalAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

ClientInvoiceSchema.index({ clientId: 1, createdAt: -1 });
ClientInvoiceSchema.index({ status: 1 });

// Keep remainingBalance in sync whenever the document is saved
ClientInvoiceSchema.pre('save', function (this: IClientInvoice) {
  if (this.remainingBalance === undefined || this.remainingBalance === null) {
    this.remainingBalance = this.amount - ((this.depositPaid ?? 0) + (this.amountPaid ?? 0));
  }
});

export const ClientInvoice: Model<IClientInvoice> =
  mongoose.models.ClientInvoice ||
  mongoose.model<IClientInvoice>('ClientInvoice', ClientInvoiceSchema);
