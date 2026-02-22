import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson {
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  duration: string; // e.g. "5 mins"
  videoUrl?: string; // Optional
  imageUrls?: string[]; // For screenshot support
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'sales' | 'marketing' | 'product' | 'technical';
  targetAudience: ('standard' | 'creator' | 'all')[];
  lessons: ILesson[];
  exam?: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    passingScore: number;
  };
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, required: true },
  duration: { type: String },
  videoUrl: { type: String },
  imageUrls: [{ type: String }],
});

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option
});

const ExamSchema = new Schema({
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 80 }, // Percentage
});

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: {
    type: String,
    enum: ['sales', 'marketing', 'product', 'technical'],
    default: 'sales'
  },
  targetAudience: {
    type: [String],
    enum: ['standard', 'creator', 'all'],
    default: ['all']
  },
  lessons: [LessonSchema],
  exam: { type: ExamSchema },
  sortOrder: { type: Number, default: 99 },
  published: { type: Boolean, default: false },
}, { timestamps: true });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
