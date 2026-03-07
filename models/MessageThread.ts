import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessageThread extends Document {
  clientId: mongoose.Types.ObjectId;
  subject: string;
  participants: mongoose.Types.ObjectId[];
  caseId?: mongoose.Types.ObjectId;
  ticketId?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  lastMessagePreview?: string;
  unreadByClient: number;
  unreadByTeam: number;
  createdAt: Date;
  updatedAt: Date;
}

const MessageThreadSchema: Schema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    subject: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket' },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String },
    unreadByClient: { type: Number, default: 0 },
    unreadByTeam: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MessageThreadSchema.index({ clientId: 1, lastMessageAt: -1 });

export const MessageThread: Model<IMessageThread> =
  mongoose.models.MessageThread ||
  mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema);
