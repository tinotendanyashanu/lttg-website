import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
  email: string;
  passwordHash: string;
  roles: string[];
  teamId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const AccountSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: [] },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
