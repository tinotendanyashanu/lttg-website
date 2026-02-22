'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import Partner from '@/models/Partner';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';
import { runAllFraudChecks } from '@/lib/services/fraudDetection';
import PartnerNotification from '@/models/PartnerNotification';
import AuditLog from '@/models/AuditLog';
import crypto from 'crypto';
import mongoose from 'mongoose';

const DealSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  clientEmail: z.string().email("A valid client email is required"),
  estimatedValue: z.coerce.number().min(1, "Estimated value must be greater than 0"),
  serviceType: z.enum(['SME', 'Startup', 'Enterprise', 'Individual']),
  notes: z.string().optional(),
});

export async function registerDeal(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  const validatedFields = DealSchema.safeParse({
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    estimatedValue: formData.get('estimatedValue'),
    serviceType: formData.get('serviceType'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register Deal.',
    };
  }

  const { clientName, clientEmail, estimatedValue, serviceType, notes } = validatedFields.data;

  let dealId: string | null = null;

  try {
    await dbConnect();

    const deal = await Deal.create({
      partnerId: session.user.id,
      clientName,
      clientEmail: clientEmail.toLowerCase().trim(),
      estimatedValue,
      serviceType,
      notes,
      dealStatus: 'registered',
      commissionRate: 0.10, // Default, admin can change
    });

    dealId = deal._id.toString();

    // Notify Partner silently
    await PartnerNotification.create({
      partnerId: session.user.id,
      type: 'deal_registered',
      message: `Your deal for ${clientName} has been registered successfully.`,
    });

    // Notify Admin
    await sendEmail({
      to: 'contact@leothetechguy.com',
      subject: `New Deal Registered by ${session.user.name}`,
      html: `<p>Partner <strong>${session.user.name}</strong> registered a new deal for <strong>${clientName}</strong> with estimated value of <strong>$${estimatedValue}</strong>.</p><a href="https://leosystems.ai/admin/deals">Review Deal</a>`,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('Failed to create partner application');
  }

  // Run fraud checks AFTER deal creation — non-blocking, never stops the flow
  if (dealId) {
    try {
      await runAllFraudChecks({
        partnerId: session.user.id,
        dealId,
        clientEmail: clientEmail.toLowerCase().trim(),
        dealValue: estimatedValue,
      });
    } catch (fraudErr) {
      // Fraud check failure is logged but NEVER surfaces to the partner
      console.error('[FRAUD CHECK] runAllFraudChecks failed silently:', fraudErr);
    }
  }

  revalidatePath('/partner/dashboard/deals');
  redirect('/partner/dashboard/deals');
}

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return;

  await dbConnect();
  await Partner.findByIdAndUpdate(session.user.id, { hasCompletedOnboarding: true });
  revalidatePath('/partner/dashboard');
}

export async function switchTier(targetTier: 'referral' | 'creator') {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await dbConnect();
    const partner = await Partner.findById(session.user.id);
    
    if (!partner) {
      return { success: false, message: 'Partner not found' };
    }

    if (partner.tierLocked) {
      return { success: false, message: 'Your tier is locked by an administrator. Please contact support.' };
    }

    if (partner.tier === targetTier) {
      return { success: true, message: `You are already in the ${targetTier} tier.` };
    }

    const previousTier = partner.tier;
    const updates: any = {
      tier: targetTier,
      partnerType: targetTier === 'creator' ? 'influencer' : 'partner'
    };

    // Generate referral code if switching to creator and missing
    if (targetTier === 'creator' && !partner.referralCode) {
      const slugBase = partner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const randomSuffix = crypto.randomBytes(3).toString('hex');
      updates.referralCode = `leo-${slugBase}-${randomSuffix}`;
    }

    await Partner.findByIdAndUpdate(session.user.id, updates);

    // Audit Log
    await AuditLog.create({
      entityType: 'partner',
      entityId: partner._id as mongoose.Types.ObjectId,
      action: 'tier_switch',
      performedBy: partner._id as mongoose.Types.ObjectId,
      details: { from: previousTier, to: targetTier },
    });

    // Notification
    await PartnerNotification.create({
      partnerId: partner._id,
      type: 'tier_updated',
      message: `You have successfully switched to the ${targetTier === 'creator' ? 'Creator' : 'Referral'} tier.`,
    });

    revalidatePath('/partner/dashboard');
    revalidatePath('/partner/dashboard/settings');
    revalidatePath('/partner/dashboard/tier');

    return { 
      success: true, 
      message: `Successfully switched to ${targetTier === 'creator' ? 'Creator' : 'Referral'} tier.`,
      referralCode: updates.referralCode || partner.referralCode
    };

  } catch (error) {
    console.error('Tier switch error:', error);
    return { success: false, message: 'Failed to switch tier. Please try again.' };
  }
}

export async function generateReferralCode() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await dbConnect();
    const partner = await Partner.findById(session.user.id);
    
    if (!partner) {
      return { success: false, message: 'Partner not found' };
    }

    if (partner.tier !== 'creator') {
      return { success: false, message: 'Only Creator partners can have referral links.' };
    }

    if (partner.referralCode) {
      return { success: true, message: 'Referral code already exists.', referralCode: partner.referralCode };
    }

    const slugBase = partner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const referralCode = `leo-${slugBase}-${randomSuffix}`;

    await Partner.findByIdAndUpdate(session.user.id, { referralCode });

    // Notification
    await PartnerNotification.create({
      partnerId: partner._id,
      type: 'tier_updated',
      message: `Your unique referral code has been generated: ${referralCode}`,
    });

    revalidatePath('/partner/dashboard');
    revalidatePath('/partner/dashboard/settings');

    return { 
      success: true, 
      message: 'Referral code generated successfully!',
      referralCode
    };

  } catch (error) {
    console.error('Code generation error:', error);
    return { success: false, message: 'Failed to generate referral code. Please try again.' };
  }
}

