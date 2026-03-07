
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import Partner from '../models/Partner';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

if (!SEED_ADMIN_PASSWORD) {
  console.error('Please define SEED_ADMIN_PASSWORD in .env.local before running this script.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    const adminEmail = 'contact@leothetechguy.com';
    const existingAdmin = await Partner.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role.');
      }
    } else {
      const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD!, 10);

      const newAdmin = new Partner({
        name: 'Leo Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        tier: 'enterprise',
        status: 'active',
        stats: {
          totalReferredRevenue: 0,
          totalCommissionEarned: 0,
          pendingCommission: 0,
          paidCommission: 0,
        },
      });

      await newAdmin.save();
      console.log('Admin user created successfully. Email:', adminEmail);
    }

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedAdmin();
