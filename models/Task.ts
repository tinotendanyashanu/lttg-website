import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo?: mongoose.Types.ObjectId;
  relatedCaseId?: mongoose.Types.ObjectId;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },
  relatedCaseId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: { type: Date },
}, { timestamps: true });

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ relatedCaseId: 1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
