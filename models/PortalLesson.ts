import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalLesson extends Document {
  moduleId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  slug?: string;
  lessonType?: 'video' | 'text' | 'file' | 'task';
  summary?: string;
  content: string; // Markdown or rich text
  videoUrl?: string; // Optional video
  attachments?: string[]; // URLs directly to files
  estimatedDuration?: number; // In minutes
  isRequired?: boolean;
  isPublished?: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const PortalLessonSchema: Schema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'PortalModule', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  title: { type: String, required: true },
  slug: { type: String },
  lessonType: {
    type: String,
    enum: ['video', 'text', 'file', 'task'],
    default: 'text',
  },
  summary: { type: String },
  content: { type: String, required: true },
  videoUrl: { type: String },
  attachments: [{ type: String }],
  estimatedDuration: { type: Number }, // internal representation in minutes
  isRequired: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  orderIndex: { type: Number, required: true, default: 0 },
}, { timestamps: true });

PortalLessonSchema.index({ courseId: 1, moduleId: 1, orderIndex: 1 });

export const PortalLesson: Model<IPortalLesson> = mongoose.models.PortalLesson || mongoose.model<IPortalLesson>('PortalLesson', PortalLessonSchema);
