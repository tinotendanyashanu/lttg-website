import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectInquiry extends Document {
  name: string;
  email: string;
  whatsapp?: string;
  projectDescription: string;
  budget?: string;
  timeline?: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
}

const ProjectInquirySchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String },
  projectDescription: { type: String, required: true },
  budget: { type: String },
  timeline: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'closed'],
    default: 'new' 
  },
  createdAt: { type: Date, default: Date.now },
});

const ProjectInquiry: Model<IProjectInquiry> = mongoose.models.ProjectInquiry || mongoose.model<IProjectInquiry>('ProjectInquiry', ProjectInquirySchema);

export default ProjectInquiry;
