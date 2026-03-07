import mongoose, { Schema, Document, Model } from 'mongoose';

export type AnnouncementCategory = 
  | 'Company Updates'
  | 'Campaign Focus'
  | 'Commission Policy Changes'
  | 'New Service Launch'
  | 'Performance Recognition'
  | 'System Updates'
  | 'Urgent Alerts';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Critical';
export type AnnouncementVisibility = 'intern' | 'employee' | 'admin' | 'all';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  category: AnnouncementCategory;
  priorityLevel: AnnouncementPriority;
  isPinned: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  targetRoles: AnnouncementVisibility[];
  targetTeams?: mongoose.Types.ObjectId[];
  attachments?: string[];
  link?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Company Updates', 
      'Campaign Focus', 
      'Commission Policy Changes', 
      'New Service Launch', 
      'Performance Recognition', 
      'System Updates', 
      'Urgent Alerts'
    ]
  },
  priorityLevel: { 
    type: String, 
    required: true,
    enum: ['Normal', 'Important', 'Critical'],
    default: 'Normal'
  },
  isPinned: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  targetRoles: { type: [String], default: ['all'] },
  targetTeams: { type: [Schema.Types.ObjectId], ref: 'Team' },
  attachments: { type: [String] },
  link: { type: String },
  expiresAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });

AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index if expiresAt is set

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
