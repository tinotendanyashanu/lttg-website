import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordSetupToken extends Document {
  accountId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordSetupTokenSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

PasswordSetupTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordSetupToken: Model<IPasswordSetupToken> =
  mongoose.models.PasswordSetupToken ||
  mongoose.model<IPasswordSetupToken>('PasswordSetupToken', PasswordSetupTokenSchema);
