import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  project: string;
  timeline?: string;
  budget?: string;
  message: string;
  company?: string;
  companyWebsite?: string;
  status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "closed";
  source?: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  consentAt?: Date;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
  },
  project: {
    type: String,
    required: [true, "Please specify the project type"],
  },
  timeline: {
    type: String,
    required: false,
  },
  budget: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: [true, "Please provide a message"],
  },
  company: { type: String, maxlength: 120 },
  companyWebsite: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "proposal", "won", "closed"],
    default: "new",
    index: true,
  },
  source: { type: String, maxlength: 100 },
  landingPath: { type: String, maxlength: 500 },
  utmSource: { type: String, maxlength: 100 },
  utmMedium: { type: String, maxlength: 100 },
  utmCampaign: { type: String, maxlength: 100 },
  referrer: { type: String, maxlength: 500 },
  consentAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent recompilation of model in development
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
