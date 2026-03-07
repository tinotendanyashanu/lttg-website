import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Minimal Account schema to run as a standalone script
const AccountSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  clientProfile: {
    companyName: { type: String },
    industry: { type: String },
  },
});

const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const passwordHash = await bcrypt.hash('client@2026', 10);

    const testClients = [
      {
        fullName: 'Alice Johnson',
        email: 'alice@testclient.com',
        roles: ['client'],
        passwordHash,
        isActive: true,
        clientProfile: { companyName: 'Johnson & Co', industry: 'Finance' },
      },
      {
        fullName: 'Bob Smith',
        email: 'bob@testclient.com',
        roles: ['client'],
        passwordHash,
        isActive: true,
        clientProfile: { companyName: 'Smith Enterprises', industry: 'Technology' },
      },
    ];

    for (const client of testClients) {
      await Account.updateOne(
        { email: client.email },
        { $set: client },
        { upsert: true }
      );
      console.log(`Seeded: ${client.email}`);
    }

    console.log('\nDone. Test client credentials:');
    console.log('  Email:    alice@testclient.com  |  Password: client@2026');
    console.log('  Email:    bob@testclient.com    |  Password: client@2026');
    process.exit(0);

  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
