import mongoose, { Schema, Document, Model } from 'mongoose';
import type { QuestMetric } from '@/lib/types/quest';

export type { QuestMetric } from '@/lib/types/quest';

export interface IQuest extends Document {
  title: string;
  description: string;
  metric: QuestMetric;
  targetValue: number;
  startsAt: Date;
  endsAt: Date;
  rewardLabel?: string;
  isActive: boolean;
  /** 'all' or specific roles: employee, intern */
  targetRoles: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    metric: {
      type: String,
      enum: ['converted_leads', 'new_leads', 'qualified_leads', 'revenue'],
      required: true,
    },
    targetValue: { type: Number, required: true, min: 1 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    rewardLabel: { type: String, maxlength: 200 },
    isActive: { type: Boolean, default: true },
    targetRoles: { type: [String], default: ['all'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  },
  { timestamps: true }
);

QuestSchema.index({ isActive: 1, endsAt: -1, startsAt: 1 });

const Quest: Model<IQuest> = mongoose.models.Quest || mongoose.model<IQuest>('Quest', QuestSchema);

export default Quest;
