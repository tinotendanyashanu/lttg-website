import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
