import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminLoginToken extends Document {
  accountId: mongoose.Types.ObjectId;
  otpHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  requestIp?: string;
}

const AdminLoginTokenSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  otpHash:   { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  requestIp: { type: String },
});

// Auto-delete expired tokens
AdminLoginTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AdminLoginToken: Model<IAdminLoginToken> =
  mongoose.models.AdminLoginToken ||
  mongoose.model<IAdminLoginToken>('AdminLoginToken', AdminLoginTokenSchema);
