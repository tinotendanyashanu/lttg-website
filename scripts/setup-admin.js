/**
 * Production Admin Account Setup Script
 *
 * Creates (or updates) the real admin account in MongoDB.
 * Reads credentials from environment variables — nothing is hardcoded.
 *
 * Required env vars in .env.local:
 *   MONGODB_URI        — your MongoDB connection string
 *   ADMIN_EMAIL        — the email address for the admin account
 *   ADMIN_PASSWORD     — the password for the admin account (min 12 chars recommended)
 *
 * Usage:
 *   node scripts/setup-admin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const AccountSchema = new mongoose.Schema({
  fullName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles:        { type: [String], default: [] },
  isActive:     { type: Boolean, default: true },
  createdAt:    { type: Date, default: Date.now },
  commissionStats: {
    pendingCommission: { type: Number, default: 0 },
    approvedBalance:   { type: Number, default: 0 },
    paidCommission:    { type: Number, default: 0 },
    totalEarned:       { type: Number, default: 0 },
  },
});

const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);

async function setup() {
  const uri          = process.env.MONGODB_URI;
  const adminEmail   = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Validate required env vars
  if (!uri) {
    console.error('❌  MONGODB_URI is not set in .env.local');
    process.exit(1);
  }
  if (!adminEmail) {
    console.error('❌  ADMIN_EMAIL is not set in .env.local');
    process.exit(1);
  }
  if (!adminPassword) {
    console.error('❌  ADMIN_PASSWORD is not set in .env.local');
    process.exit(1);
  }
  if (adminPassword.length < 12) {
    console.error('❌  ADMIN_PASSWORD must be at least 12 characters for security.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const result = await Account.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      $set: {
        fullName:     'Leo',
        email:        adminEmail.toLowerCase(),
        passwordHash,
        roles:        ['admin'],
        isActive:     true,
      },
    },
    { upsert: true, new: true },
  );

  const action = result.createdAt && new Date() - result.createdAt < 5000 ? 'Created' : 'Updated';
  console.log(`✅  ${action} admin account: ${result.email}`);
  console.log('   Role:   admin');
  console.log('   Active: true\n');
  console.log('Admin login is ready at /admin/login');

  await mongoose.disconnect();
  process.exit(0);
}

setup().catch((err) => {
  console.error('❌  Setup failed:', err.message);
  process.exit(1);
});
