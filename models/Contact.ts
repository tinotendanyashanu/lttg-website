import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  project: string;
  budget?: string;
  message: string;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  project: {
    type: String,
    required: [true, 'Please specify the project type'],
  },
  budget: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent recompilation of model in development
const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
