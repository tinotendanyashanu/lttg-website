import mongoose, { Schema, Document, Model } from 'mongoose';

export type ChatStatus = 'bot' | 'pending_human' | 'human_active' | 'resolved';
export type MessageRole = 'bot' | 'visitor' | 'employee';

export interface IChatMessage {
  role: MessageRole;
  content: string;
  senderName?: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  status: ChatStatus;
  messages: IChatMessage[];
  assignedTo?: mongoose.Types.ObjectId;
  assignedEmployeeName?: string;
  employeeNotifiedAt?: Date;
  visitorNotifiedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['bot', 'visitor', 'employee'], required: true },
    content: { type: String, required: true },
    senderName: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorName: { type: String },
    visitorEmail: { type: String },
    status: {
      type: String,
      enum: ['bot', 'pending_human', 'human_active', 'resolved'],
      default: 'bot',
    },
    messages: { type: [ChatMessageSchema], default: [] },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },
    assignedEmployeeName: { type: String },
    employeeNotifiedAt: { type: Date },
    visitorNotifiedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

ChatSessionSchema.index({ status: 1, updatedAt: -1 });
ChatSessionSchema.index({ visitorEmail: 1 }, { sparse: true });

export const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
