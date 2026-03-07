import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Define minimal schema for Account to run as a standalone script
const AccountSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const passwordHash = await bcrypt.hash('leotech@2026', 10);
    
    const testAccounts = [
      {
        fullName: 'Test Admin',
        email: 'admin@leotech.com',
        roles: ['admin'],
        passwordHash,
        isActive: true
      },
      {
        fullName: 'Test Employee',
        email: 'employee@leotech.com',
        roles: ['employee'],
        passwordHash,
        isActive: true
      },
      {
        fullName: 'Test Intern',
        email: 'intern@leotech.com',
        roles: ['intern'],
        passwordHash,
        isActive: true
      }
    ];

    for (const account of testAccounts) {
      // Upsert to handle re-running without duplicate key errors
      await Account.updateOne(
        { email: account.email },
        { $set: account },
        { upsert: true }
      );
      console.log(`Seeded or updated: ${account.email}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
