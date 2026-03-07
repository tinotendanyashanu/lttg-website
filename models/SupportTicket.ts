import mongoose, { Schema, Document, Model } from 'mongoose';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_client'
  | 'resolved'
  | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ISupportTicket extends Document {
  ticketId: string;
  clientId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  category?: string;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: { url: string; name: string; size: number }[];
  messages: { senderRole: string; senderName: string; content: string; createdAt: Date }[];
  assignedTo?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  internalNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'general' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'],
      default: 'open',
    },
    attachments: [{ url: String, name: String, size: Number }],
    messages: [
      {
        senderRole: String,
        senderName: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    internalNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ clientId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1 });

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
