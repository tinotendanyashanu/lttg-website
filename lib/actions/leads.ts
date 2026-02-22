'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Deal from '@/models/Deal';
import Partner from '@/models/Partner';
import PartnerNotification from '@/models/PartnerNotification';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runAllFraudChecks } from '@/lib/services/fraudDetection';
import type { LeadStatus } from '@/models/Lead';

// ─── Update Lead Status ────────────────────────────────────────────

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await dbConnect();

    const lead = await Lead.findOne({
      _id: leadId,
      partnerId: session.user.id,
    });

    if (!lead) {
      return { success: false, message: 'Lead not found' };
    }

    // Prevent changing status of already-converted leads
    if (lead.status === 'converted') {
      return { success: false, message: 'Cannot change status of a converted lead' };
    }

    lead.status = newStatus;
    if (newStatus === 'converted') {
      lead.converted = true;
    }
    await lead.save();

    revalidatePath('/partner/dashboard/leads');
    return { success: true, message: `Lead status updated to ${newStatus}` };
  } catch (error) {
    console.error('Update lead status error:', error);
    return { success: false, message: 'Failed to update lead status' };
  }
}

// ─── Convert Lead to Deal ──────────────────────────────────────────

const ConvertLeadSchema = z.object({
  estimatedValue: z.coerce.number().min(1, 'Estimated value must be > 0'),
  serviceType: z.enum(['SME', 'Startup', 'Enterprise', 'Individual']),
  notes: z.string().optional(),
});

export async function convertLeadToDeal(leadId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  const validated = ConvertLeadSchema.safeParse({
    estimatedValue: formData.get('estimatedValue'),
    serviceType: formData.get('serviceType'),
    notes: formData.get('notes'),
  });

  if (!validated.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { estimatedValue, serviceType, notes } = validated.data;

  try {
    await dbConnect();

    const lead = await Lead.findOne({
      _id: leadId,
      partnerId: session.user.id,
    });

    if (!lead) {
      return { success: false, message: 'Lead not found' };
    }

    if (lead.status === 'converted' || lead.relatedDealId) {
      return { success: false, message: 'Lead has already been converted to a deal' };
    }

    // Fetch partner for commission rate
    const partner = await Partner.findById(session.user.id);
    if (!partner) {
      return { success: false, message: 'Partner not found' };
    }

    // Create Deal from lead
    const deal = await Deal.create({
      partnerId: session.user.id,
      clientName: lead.clientName,
      clientEmail: lead.clientEmail?.toLowerCase().trim(),
      clientPhone: lead.clientPhone,
      estimatedValue,
      serviceType,
      notes,
      dealStatus: 'registered',
      commissionRate: 0.10,
    });

    // Update lead as converted
    lead.status = 'converted';
    lead.converted = true;
    lead.relatedDealId = deal._id;
    await lead.save();

    // Notification
    await PartnerNotification.create({
      partnerId: session.user.id,
      type: 'deal_registered',
      message: `Lead "${lead.clientName}" has been converted to a deal.`,
    });

    // Run fraud checks — non-blocking
    try {
      await runAllFraudChecks({
        partnerId: session.user.id,
        dealId: deal._id.toString(),
        clientEmail: lead.clientEmail?.toLowerCase().trim() || '',
        dealValue: estimatedValue,
      });
    } catch (fraudErr) {
      console.error('[FRAUD CHECK] convertLeadToDeal failed silently:', fraudErr);
    }

    revalidatePath('/partner/dashboard/leads');
    revalidatePath('/partner/dashboard/deals');
    return { success: true, message: 'Lead converted to deal successfully', dealId: deal._id.toString() };
  } catch (error) {
    console.error('Convert lead to deal error:', error);
    return { success: false, message: 'Failed to convert lead to deal' };
  }
}

// ─── Create Manual Lead ────────────────────────────────────────────

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const CreateLeadSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientEmail: z.string().email('A valid email is required'),
  clientPhone: z.string()
    .optional()
    .transform((val) => val ? val.replace(/[\s\-().]/g, '') : undefined)
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Please enter a valid phone number',
    }),
});

export async function createManualLead(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  const validated = CreateLeadSchema.safeParse({
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
    clientPhone: formData.get('clientPhone'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create lead.',
    };
  }

  const { clientName, clientEmail, clientPhone } = validated.data;

  try {
    await dbConnect();

    await Lead.create({
      partnerId: session.user.id,
      clientName,
      clientEmail: clientEmail.toLowerCase().trim(),
      clientPhone,
      source: 'manual',
      status: 'new',
    });

    revalidatePath('/partner/dashboard/leads');
    return { success: true, message: 'Lead created successfully' };
  } catch (error) {
    console.error('Create manual lead error:', error);
    return { message: 'Failed to create lead' };
  }
}
