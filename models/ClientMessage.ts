import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClientMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: string;
  content: string;
  attachments: { url: string; name: string; size: number; type: string }[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ClientMessageSchema: Schema = new Schema({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: true,
  },
  senderId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ url: String, name: String, size: Number, type: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  createdAt: { type: Date, default: Date.now },
});

ClientMessageSchema.index({ threadId: 1, createdAt: 1 });

export const ClientMessage: Model<IClientMessage> =
  mongoose.models.ClientMessage ||
  mongoose.model<IClientMessage>('ClientMessage', ClientMessageSchema);
