import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortalQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface IPortalQuiz {
  questions: IPortalQuizQuestion[];
  passingScore: number; // percentage
}

export interface IPortalCourse extends Document {
  title: string;
  description: string;
  targetRoles: string[]; // e.g. ['Intern', 'Employee', 'Admin']
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdBy?: mongoose.Types.ObjectId;
  isPublished: boolean;
  quiz?: IPortalQuiz;
  createdAt: Date;
  updatedAt: Date;
}

const PortalQuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
});

const PortalQuizSchema = new Schema({
  questions: [PortalQuizQuestionSchema],
  passingScore: { type: Number, default: 80 },
});

const PortalCourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetRoles: { type: [String], required: true },
  difficultyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
  isPublished: { type: Boolean, default: false },
  quiz: { type: PortalQuizSchema },
}, { timestamps: true });

export const PortalCourse: Model<IPortalCourse> = mongoose.models.PortalCourse || mongoose.model<IPortalCourse>('PortalCourse', PortalCourseSchema);
