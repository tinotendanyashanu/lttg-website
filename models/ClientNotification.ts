import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'case_update'
  | 'new_message'
  | 'ticket_response'
  | 'invoice_alert'
  | 'payment_received'
  | 'contract_update'
  | 'system';

export interface IClientNotification extends Document {
  clientId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
}

const ClientNotificationSchema: Schema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: {
    type: String,
    enum: [
      'case_update',
      'new_message',
      'ticket_response',
      'invoice_alert',
      'payment_received',
      'contract_update',
      'system',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

ClientNotificationSchema.index({ clientId: 1, read: 1, createdAt: -1 });

export const ClientNotification: Model<IClientNotification> =
  mongoose.models.ClientNotification ||
  mongoose.model<IClientNotification>(
    'ClientNotification',
    ClientNotificationSchema
  );
