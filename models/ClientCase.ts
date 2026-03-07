import mongoose, { Schema, Document, Model } from 'mongoose';

export type ClientCaseStatus =
  | 'submitted'
  | 'reviewing'
  | 'investigating'
  | 'in_progress'
  | 'awaiting_client'
  | 'resolved'
  | 'closed';
export type ClientCasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface IClientCaseTimeline {
  event: string;
  description?: string;
  performedBy?: mongoose.Types.ObjectId;
  performedByName?: string;
  createdAt: Date;
}

export interface IClientCase extends Document {
  caseNumber: string;
  clientId: mongoose.Types.ObjectId;
  caseType: string;
  title: string;
  description?: string;
  status: ClientCaseStatus;
  priority: ClientCasePriority;
  assignedTeam?: string;
  assignedTo?: mongoose.Types.ObjectId;
  timeline: IClientCaseTimeline[];
  internalCaseId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientCaseSchema: Schema = new Schema(
  {
    caseNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    caseType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: [
        'submitted',
        'reviewing',
        'investigating',
        'in_progress',
        'awaiting_client',
        'resolved',
        'closed',
      ],
      default: 'submitted',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTeam: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },
    timeline: [
      {
        event: { type: String, required: true },
        description: { type: String },
        performedBy: { type: Schema.Types.ObjectId, ref: 'Account' },
        performedByName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    internalCaseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

ClientCaseSchema.index({ clientId: 1, createdAt: -1 });
ClientCaseSchema.index({ status: 1 });

export const ClientCase: Model<IClientCase> =
  mongoose.models.ClientCase ||
  mongoose.model<IClientCase>('ClientCase', ClientCaseSchema);
