/**
 * Migration: backfill payment fields on invoices created before the payment system.
 *
 * Old invoices are missing: currency, amountPaid, depositPaid, remainingBalance, paymentHistory
 * This script finds them and sets safe defaults so the pay page works correctly.
 *
 * Run with:
 *   npx tsx scripts/migrate-invoices-payment-fields.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in .env.local');

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;
  const col = db.collection('clientinvoices');

  // Find invoices missing any of the payment fields
  const stale = await col
    .find({
      $or: [
        { currency: { $exists: false } },
        { currency: null },
        { amountPaid: { $exists: false } },
        { depositPaid: { $exists: false } },
        { remainingBalance: { $exists: false } },
        { remainingBalance: null },
        { paymentHistory: { $exists: false } },
      ],
    })
    .toArray();

  if (stale.length === 0) {
    console.log('No invoices need migrating. All good.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${stale.length} invoice(s) to migrate:`);

  let updated = 0;
  for (const inv of stale) {
    const amountPaid   = inv.amountPaid   ?? 0;
    const depositPaid  = inv.depositPaid  ?? 0;
    const amount       = inv.amount       ?? 0;
    const currency     = inv.currency     || 'USD';
    const remainingBalance = amount - depositPaid - amountPaid;

    await col.updateOne(
      { _id: inv._id },
      {
        $set: {
          currency,
          amountPaid,
          depositPaid,
          remainingBalance,
          paymentHistory: inv.paymentHistory ?? [],
        },
      },
    );

    console.log(
      `  ✓ ${inv.invoiceNumber ?? inv._id}  amount=${amount}  currency=${currency}  remaining=${remainingBalance}`,
    );
    updated++;
  }

  console.log(`\nMigrated ${updated} invoice(s) successfully.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
