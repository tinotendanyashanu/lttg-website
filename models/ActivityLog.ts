import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  caseId: mongoose.Types.ObjectId;
  actorAccountId: mongoose.Types.ObjectId;
  actionType: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  actorAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  actionType: { type: String, required: true },
  previousValue: { type: String },
  newValue: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

ActivityLogSchema.index({ caseId: 1, createdAt: -1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
