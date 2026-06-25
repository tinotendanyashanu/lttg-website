import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WaMessage {
  direction: 'inbound' | 'outbound';
  text: string;
  timestamp: Date;
  waMessageId?: string;
}

export interface WaLeadProfile {
  contactName?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  serviceNeeded?: string;
  hasWebsite?: boolean;
  email?: string;
  leadScore: number;
  notes?: string;
}

export type WaConversationStatus = 'active' | 'needs_human' | 'qualified' | 'resolved';

export interface IWaConversation extends Document {
  phone: string;
  displayName?: string;
  status: WaConversationStatus;
  messages: WaMessage[];
  leadProfile: WaLeadProfile;
  ticketRef?: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaMessageSchema = new Schema<WaMessage>(
  {
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    waMessageId: { type: String },
  },
  { _id: false },
);

const WaLeadProfileSchema = new Schema<WaLeadProfile>(
  {
    contactName: String,
    businessName: String,
    businessType: String,
    city: String,
    serviceNeeded: String,
    hasWebsite: Boolean,
    email: String,
    leadScore: { type: Number, default: 0 },
    notes: String,
  },
  { _id: false },
);

const WaConversationSchema = new Schema<IWaConversation>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    displayName: String,
    status: {
      type: String,
      enum: ['active', 'needs_human', 'qualified', 'resolved'],
      default: 'active',
    },
    messages: { type: [WaMessageSchema], default: [] },
    leadProfile: { type: WaLeadProfileSchema, default: () => ({ leadScore: 0 }) },
    ticketRef: String,
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

WaConversationSchema.index({ status: 1, lastMessageAt: -1 });

export const WaConversation: Model<IWaConversation> =
  mongoose.models.WaConversation ||
  mongoose.model<IWaConversation>('WaConversation', WaConversationSchema);
