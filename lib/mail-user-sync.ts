import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';

const mailDbName = process.env.MONGODB_MAIL_DB_NAME || 'mailcases';

/**
 * Ensures the mail backend `users` collection has a row keyed by Account `_id`
 * (same id as NextAuth `session.user.id`).
 */
export async function upsertMailBackendUser(params: {
  accountId: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}): Promise<void> {
  await dbConnect();
  const mailDb = mongoose.connection.useDb(mailDbName);
  const _id = new mongoose.Types.ObjectId(params.accountId);
  await mailDb.collection('users').updateOne(
    { _id },
    {
      $set: {
        name: params.name,
        email: params.email.trim().toLowerCase(),
        role: params.role,
      },
    },
    { upsert: true },
  );
}
