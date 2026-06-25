import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAISettings extends Document {
  key: 'default';
  defaultProvider: string;
  defaultModel?: string;
  embeddingModel?: string;
  taskModels: Map<string, string>;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retryCount: number;
  featureToggles: Map<string, boolean>;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AISettingsSchema = new Schema<IAISettings>(
  {
    key: { type: String, enum: ['default'], default: 'default', unique: true },
    defaultProvider: { type: String, default: 'ollama_cloud' },
    defaultModel: { type: String },
    embeddingModel: { type: String },
    taskModels: { type: Map, of: String, default: {} },
    temperature: { type: Number, default: 0.35 },
    maxTokens: { type: Number, default: 800 },
    timeoutMs: { type: Number, default: 30000 },
    retryCount: { type: Number, default: 1 },
    featureToggles: { type: Map, of: Boolean, default: {} },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

export const AISettings: Model<IAISettings> =
  mongoose.models.AISettings || mongoose.model<IAISettings>('AISettings', AISettingsSchema);
