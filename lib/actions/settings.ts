'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const BankDetailsSchema = z.object({
  accountName: z.string().min(2, "Account Name is required"),
  bankName: z.string().min(2, "Bank Name is required"),
  accountNumber: z.string().min(5, "Account Number is required"),
  sortCode: z.string().optional(),
  iban: z.string().optional(),
});

export async function updateBankDetails(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Unauthorized', success: false };
  }

  const validatedFields = BankDetailsSchema.safeParse({
    accountName: formData.get('accountName'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    sortCode: formData.get('sortCode'),
    iban: formData.get('iban'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your inputs.',
      success: false,
    };
  }

  const { accountName, bankName, accountNumber, sortCode, iban } = validatedFields.data;

  try {
    await dbConnect();
    
    await Partner.findOneAndUpdate(
        { email: session.user.email },
        { 
            bankDetails: {
                accountName,
                bankName,
                accountNumber,
                sortCode,
                iban
            }
        }
    );

    revalidatePath('/partner/dashboard/settings');
    revalidatePath('/partner/dashboard/earnings'); // In case we show payment info there
    
    return {
        message: 'Bank details updated successfully.',
        success: true,
        errors: {}
    };

  } catch (error) {
    console.error('Settings update error:', error);
    return {
      message: 'Failed to update settings. Please try again.',
      success: false,
    };
  }
}

const PayoutSettingsSchema = z.object({
  countryOfResidence: z.string().min(2, "Country is required"),
  payoutMethod: z.enum(['Wise', 'Bank Transfer', 'USDT (TRC20)', 'PayPal', 'Local Remittance']),
  localRemittanceDetails: z.object({
    fullName: z.string().optional(),
    mobileNumber: z.string().optional(),
    city: z.string().optional(),
    preferredMethod: z.string().optional(),
  }).optional(),
});

export async function updatePayoutSettings(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Unauthorized', success: false };
  }

  // Check 3-day restriction
  const now = new Date();
  const date = now.getDate();
  if (date >= 2 && date <= 5) {
    return { success: false, message: 'Payout method cannot be changed within 3 days before the payout date (5th).' };
  }

  const payoutMethod = formData.get('payoutMethod') as string;
  
  const payload: Record<string, unknown> = {
    countryOfResidence: formData.get('countryOfResidence'),
    payoutMethod,
  };

  if (payoutMethod === 'Local Remittance') {
    payload.localRemittanceDetails = {
      fullName: formData.get('fullName'),
      mobileNumber: formData.get('mobileNumber'),
      city: formData.get('city'),
      preferredMethod: formData.get('preferredMethod'),
    };
  }

  const validatedFields = PayoutSettingsSchema.safeParse(payload);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check your inputs.',
      success: false,
    };
  }

  try {
    await dbConnect();
    
    await Partner.findOneAndUpdate(
        { email: session.user.email },
        { 
            countryOfResidence: payload.countryOfResidence,
            payoutMethod: payload.payoutMethod,
            localRemittanceDetails: payload.localRemittanceDetails
        }
    );

    revalidatePath('/partner/dashboard/settings');
    revalidatePath('/partner/dashboard/earnings');
    
    return {
        message: 'Payout settings updated successfully.',
        success: true,
        errors: {}
    };

  } catch (error) {
    console.error('Settings update error:', error);
    return {
      message: 'Failed to update payout settings. Please try again.',
      success: false,
    };
  }
}
