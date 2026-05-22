import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestimonial extends Document {
  clientName: string;
  clientRole: string;
  clientCompany?: string;
  content: string;
  image?: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Types.ObjectId;
}

const TestimonialSchema: Schema = new Schema({
  clientName: { type: String, required: true },
  clientRole: { type: String, required: true },
  clientCompany: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  isApproved: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;
