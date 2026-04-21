import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvitationToken extends Document {
  email: string;
  fullName: string;
  roles: string[];
  token: string;
  expiresAt: Date;
  used: boolean;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InvitationTokenSchema: Schema = new Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  roles: { type: [String], default: ['employee'] },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  createdAt: { type: Date, default: Date.now },
});

InvitationTokenSchema.index({ token: 1 });
InvitationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InvitationToken: Model<IInvitationToken> =
  mongoose.models.InvitationToken ||
  mongoose.model<IInvitationToken>('InvitationToken', InvitationTokenSchema);
