import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const { Account } = await import('../models/Account');

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30); // 30 days from now

  const result = await Account.updateMany(
    { roles: { $in: ['employee', 'intern'] }, isActive: true, blackHoleDeadline: { $exists: false } },
    { 
      $set: { 
        blackHoleDeadline: deadline,
        lifetimeDealsClosed: 0,
        lifetimeLeadsRegistered: 0
      } 
    }
  );

  console.log(`Updated ${result.modifiedCount} employee/intern accounts with a 30-day Black Hole deadline.`);
  process.exit(0);
}

run().catch(console.error);
