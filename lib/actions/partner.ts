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

