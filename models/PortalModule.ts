import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const PortalModuleSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
  title: { type: String, required: true },
  orderIndex: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const PortalModule: Model<IPortalModule> = mongoose.models.PortalModule || mongoose.model<IPortalModule>('PortalModule', PortalModuleSchema);
