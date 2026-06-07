import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Employee AI Assistant conversation (Phase B, spec §5).
 *
 * Stores an internal RAG chat between a staff member and the assistant. Scoped to
 * the owning account; never exposes content beyond the asker's role (the retriever
 * applies role-based KB visibility, and sources are recorded for traceability).
 */

export type AssistantRole = 'user' | 'assistant';

export interface IAssistantSource {
  articleId?: mongoose.Types.ObjectId;
  title: string;
  slug?: string;
}

export interface IAssistantMessage {
  role: AssistantRole;
  content: string;
  sources?: IAssistantSource[];
  confidence?: string; // 'high' | 'medium' | 'low' for assistant turns
  createdAt: Date;
}

export interface IAssistantConversation extends Document {
  accountId: mongoose.Types.ObjectId;
  accountEmail: string;
  role: string; // role of the owner at creation (employee/admin/intern)
  title: string;
  messages: IAssistantMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AssistantSourceSchema = new Schema<IAssistantSource>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle' },
    title: { type: String, required: true },
    slug: { type: String },
  },
  { _id: false },
);

const AssistantMessageSchema = new Schema<IAssistantMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: { type: [AssistantSourceSchema], default: undefined },
    confidence: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AssistantConversationSchema: Schema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    accountEmail: { type: String, required: true },
    role: { type: String, default: 'employee' },
    title: { type: String, default: 'New conversation' },
    messages: { type: [AssistantMessageSchema], default: [] },
  },
  { timestamps: true },
);

AssistantConversationSchema.index({ accountId: 1, updatedAt: -1 });

export const AssistantConversation: Model<IAssistantConversation> =
  mongoose.models.AssistantConversation ||
  mongoose.model<IAssistantConversation>('AssistantConversation', AssistantConversationSchema);
