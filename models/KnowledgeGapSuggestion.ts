import mongoose, { Schema, Document, Model } from 'mongoose';

export type GapStatus = 'pending' | 'approved' | 'rejected';

export interface IKnowledgeGapSuggestion extends Document {
  sessionId: string;
  userQuery: string;
  suggestedTitle: string;
  suggestedContent: string;
  status: GapStatus;
  confidence: number;
  adminNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeGapSuggestionSchema = new Schema<IKnowledgeGapSuggestion>(
  {
    sessionId: { type: String, required: true, index: true },
    userQuery: { type: String, required: true },
    suggestedTitle: { type: String, required: true },
    suggestedContent: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    confidence: { type: Number, default: 0 },
    adminNote: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

KnowledgeGapSuggestionSchema.index({ status: 1, createdAt: -1 });

export const KnowledgeGapSuggestion: Model<IKnowledgeGapSuggestion> =
  mongoose.models.KnowledgeGapSuggestion ||
  mongoose.model<IKnowledgeGapSuggestion>('KnowledgeGapSuggestion', KnowledgeGapSuggestionSchema);
