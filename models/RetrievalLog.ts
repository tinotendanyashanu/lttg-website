import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * One document per knowledge-retrieval call across the platform (public chatbot,
 * KB search, ticket AI, employee assistant). This is the analytics backbone for the
 * AI & Knowledge dashboard: most-searched topics, failed searches, low-confidence
 * responses, retrieval success rate, vector-vs-fallback mix and feedback analytics.
 *
 * Writes are best-effort and fire-and-forget — never block a user-facing response.
 */

export type RetrievalSource = 'chatbot' | 'kb_search' | 'ticket_ai' | 'employee_assistant';
export type RetrievalConfidence = 'high' | 'medium' | 'low';
export type RetrievalFeedback = 'helpful' | 'unhelpful';

export interface IRetrievalLog extends Document {
  source: RetrievalSource;
  query: string;
  route?: string;
  audience: string;
  country?: string;
  service?: string;
  resultCount: number;
  topScore: number;
  confidence: RetrievalConfidence;
  usedVectorSearch: boolean;
  articleIds: mongoose.Types.ObjectId[];
  escalated: boolean;
  feedback?: RetrievalFeedback;
  userEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RetrievalLogSchema = new Schema<IRetrievalLog>(
  {
    source: {
      type: String,
      enum: ['chatbot', 'kb_search', 'ticket_ai', 'employee_assistant'],
      required: true,
    },
    query: { type: String, default: '' },
    route: { type: String },
    audience: { type: String, default: 'public' },
    country: { type: String },
    service: { type: String },
    resultCount: { type: Number, default: 0 },
    topScore: { type: Number, default: 0 },
    confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
    usedVectorSearch: { type: Boolean, default: false },
    articleIds: [{ type: Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],
    escalated: { type: Boolean, default: false },
    feedback: { type: String, enum: ['helpful', 'unhelpful'] },
    userEmail: { type: String },
  },
  { timestamps: true }
);

RetrievalLogSchema.index({ source: 1, createdAt: -1 });
RetrievalLogSchema.index({ confidence: 1, createdAt: -1 });
RetrievalLogSchema.index({ createdAt: -1 });

export const RetrievalLog: Model<IRetrievalLog> =
  mongoose.models.RetrievalLog ||
  mongoose.model<IRetrievalLog>('RetrievalLog', RetrievalLogSchema);
