import mongoose, { Schema, Document, Model } from 'mongoose';

export type AICallStatus = 'success' | 'failure';

export interface IAICallLog extends Document {
  provider: string;
  taskType: string;
  selectedModel: string;
  latencyMs: number;
  status: AICallStatus;
  fallbackUsed: boolean;
  fallbackStage?: string;
  confidence?: number;
  jsonParsingErrors: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  error?: string;
  createdAt: Date;
}

const AICallLogSchema = new Schema<IAICallLog>(
  {
    provider: { type: String, required: true, index: true },
    taskType: { type: String, required: true, index: true },
    selectedModel: { type: String, required: true },
    latencyMs: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'failure'], required: true, index: true },
    fallbackUsed: { type: Boolean, default: false },
    fallbackStage: { type: String },
    confidence: { type: Number },
    jsonParsingErrors: { type: Number, default: 0 },
    estimatedInputTokens: { type: Number, default: 0 },
    estimatedOutputTokens: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AICallLogSchema.index({ createdAt: -1 });
AICallLogSchema.index({ taskType: 1, createdAt: -1 });
AICallLogSchema.index({ selectedModel: 1, createdAt: -1 });

export const AICallLog: Model<IAICallLog> =
  mongoose.models.AICallLog || mongoose.model<IAICallLog>('AICallLog', AICallLogSchema);
