import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { sendEmail, EmailTemplates } from '@/lib/email';

// This endpoint is meant to be called by Vercel Cron or another scheduler
export async function GET(request: Request) {
  try {
    // Basic security check: ensure it's called with a secret if configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();
    
    const now = new Date();
    
    // Find all active employees/interns whose deadline has passed
    const swallowedAccounts = await Account.find({
      roles: { $in: ['employee', 'intern'] },
      isActive: true,
      blackHoleDeadline: { $lt: now }
    });

    if (swallowedAccounts.length === 0) {
      return NextResponse.json({ success: true, message: 'No accounts swallowed.' });
    }

    const swallowedIds = swallowedAccounts.map(acc => acc._id);

    // Update their status to inactive
    await Account.updateMany(
      { _id: { $in: swallowedIds } },
      { $set: { isActive: false } }
    );

    // Send termination emails
    for (const account of swallowedAccounts) {
      await sendEmail({
        to: account.email,
        subject: 'Account Deactivation Notice - Action Required',
        html: EmailTemplates.blackHoleTermination(account.fullName),
      });
    }

    return NextResponse.json({ 
      success: true, 
      swallowedCount: swallowedAccounts.length,
      emailsSent: swallowedAccounts.length
    });
  } catch (error) {
    console.error('Blackhole Cron Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
