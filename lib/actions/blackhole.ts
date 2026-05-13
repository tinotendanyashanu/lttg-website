'use server';

import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function getBlackHoleMetrics(accountId: string) {
  try {
    await dbConnect();
    const account = await Account.findById(accountId);
    if (!account) return null;

    if (!account.blackHoleDeadline) {
      // Initialize if missing (60 days)
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 60);
      account.blackHoleDeadline = deadline;
      account.lifetimeDealsClosed = 0;
      account.lifetimeLeadsRegistered = 0;
      await account.save();
    }

    const now = new Date();
    const deadline = new Date(account.blackHoleDeadline);
    const msRemaining = deadline.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    let status = 'safe';
    if (daysRemaining <= 0 || !account.isActive) status = 'swallowed';
    else if (daysRemaining <= 7) status = 'critical';
    else if (daysRemaining <= 14) status = 'warning';

    return {
      deadline: account.blackHoleDeadline,
      daysRemaining,
      status,
      deals: account.lifetimeDealsClosed || 0,
      leads: account.lifetimeLeadsRegistered || 0,
      isActive: account.isActive
    };
  } catch (error) {
    console.error('Failed to get black hole metrics:', error);
    return null;
  }
}

export async function extendBlackHoleDeadline(accountId: string | mongoose.Types.ObjectId, type: 'deal' | 'lead') {
  try {
    await dbConnect();
    const account = await Account.findById(accountId);
    if (!account) return { success: false, message: 'Account not found' };

    if (!account.blackHoleDeadline) {
      account.blackHoleDeadline = new Date();
    }

    // Convert to Date object if it's a string
    const currentDeadline = new Date(account.blackHoleDeadline);
    const now = new Date();
    
    // If they were already swallowed but someone manually reinstated them, start from now
    const baseDate = currentDeadline > now ? currentDeadline : now;

    if (type === 'deal') {
      baseDate.setDate(baseDate.getDate() + 15);
      account.lifetimeDealsClosed = (account.lifetimeDealsClosed || 0) + 1;
    } else if (type === 'lead') {
      baseDate.setDate(baseDate.getDate() + 2);
      account.lifetimeLeadsRegistered = (account.lifetimeLeadsRegistered || 0) + 1;
    }

    // Apply the 120-day maximum capacity cap
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 120);
    
    if (baseDate > maxDate) {
      account.blackHoleDeadline = maxDate;
    } else {
      account.blackHoleDeadline = baseDate;
    }
    await account.save();

    return { success: true, newDeadline: baseDate };
  } catch (error) {
    console.error('Error extending black hole deadline:', error);
    return { success: false, error };
  }
}

export async function processBlackHoleSwallow(email: string) {
  try {
    await dbConnect();
    const account = await Account.findOne({ email });
    
    if (!account || !account.isActive || !account.blackHoleDeadline) return { success: false };

    const now = new Date();
    const deadline = new Date(account.blackHoleDeadline);

    if (now > deadline) {
      // SWALLOW
      account.isActive = false;
      await account.save();

      // Send termination email
      await sendEmail({
        to: account.email,
        subject: 'Account Deactivation Notice',
        html: EmailTemplates.blackHoleTermination(account.fullName),
      });

      return { success: true, swallowed: true };
    }

    return { success: true, swallowed: false };
  } catch (error) {
    console.error('Error processing black hole:', error);
    return { success: false };
  }
}
