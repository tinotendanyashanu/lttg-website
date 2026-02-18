import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  path: string;
  visitorId: string; // Hashed IP + UA or some identifier
  sessionId: string; // Session ID from client
  userAgent?: string;
  ip?: string; // Optional, maybe hashed
  timestamp: Date;
  country?: string;
  region?: string;
  city?: string;
}

const AnalyticsSchema: Schema = new Schema(
  {
    path: { type: String, required: true },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Prevent overwrite during hot reload
const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
