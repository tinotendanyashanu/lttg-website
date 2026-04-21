import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  caseId?: mongoose.Types.ObjectId;
  targetEntityId?: mongoose.Types.ObjectId;
  targetEntityType?: 'user' | 'client' | 'case' | 'team';
  actorAccountId: mongoose.Types.ObjectId;
  actionType: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case' }, // Keep for backward compatibility
  targetEntityId: { type: Schema.Types.ObjectId },
  targetEntityType: { type: String, enum: ['user', 'client', 'case', 'team'] },
  actorAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  actionType: { type: String, required: true },
  previousValue: { type: String },
  newValue: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

ActivityLogSchema.index({ caseId: 1, createdAt: -1 });
ActivityLogSchema.index({ targetEntityId: 1, createdAt: -1 });
ActivityLogSchema.index({ actorAccountId: 1, createdAt: -1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
