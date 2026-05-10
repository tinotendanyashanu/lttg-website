import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IPortalQuiz {
  title?: string;
  questions: IPortalQuizQuestion[];
  passingScore: number; // percentage
  attemptLimit?: number;
}

export interface IPortalCourse extends Document {
  title: string;
  slug?: string;
  summary?: string;
  description: string;
  targetRoles: string[]; // e.g. ['Intern', 'Employee', 'Admin']
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: 'Operations' | 'Sales' | 'Customer Success' | 'Compliance' | 'Product' | 'Leadership';
  orderIndex?: number;
  estimatedDurationMinutes?: number;
  isRequired?: boolean;
  deadlineAt?: Date;
  heroIcon?: string;
  thumbnailUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  isPublished: boolean;
  quiz?: IPortalQuiz;
  analyticsEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortalQuizQuestionSchema = new Schema({
  id: { type: String },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String },
});

const PortalQuizSchema = new Schema({
  title: { type: String },
  questions: [PortalQuizQuestionSchema],
  passingScore: { type: Number, default: 80 },
  attemptLimit: { type: Number, default: 3 },
});

const PortalCourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, sparse: true, unique: true },
  summary: { type: String },
  description: { type: String, default: '' },
  targetRoles: { type: [String], required: true },
  difficultyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    enum: ['Operations', 'Sales', 'Customer Success', 'Compliance', 'Product', 'Leadership'],
    default: 'Operations',
  },
  orderIndex: { type: Number, default: 0 },
  estimatedDurationMinutes: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: false },
  deadlineAt: { type: Date },
  heroIcon: { type: String, default: 'school' },
  thumbnailUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
  isPublished: { type: Boolean, default: false },
  quiz: { type: PortalQuizSchema },
  analyticsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

PortalCourseSchema.index({ isPublished: 1, orderIndex: 1 });

export const PortalCourse: Model<IPortalCourse> = mongoose.models.PortalCourse || mongoose.model<IPortalCourse>('PortalCourse', PortalCourseSchema);
