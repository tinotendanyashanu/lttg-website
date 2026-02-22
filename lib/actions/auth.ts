'use server';

import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { SignupSchema } from '@/lib/schemas';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { headers } from 'next/headers';
import { CURRENT_TERMS_VERSION } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import AffiliateRiskFlag from '@/models/AffiliateRiskFlag';
import AuditLog from '@/models/AuditLog';


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    let email = formData.get('email') as string;
    if (email) email = email.toLowerCase();
    await dbConnect();
    const user = await Partner.findOne({ email });
    
    // Default redirect
    let redirectTo = '/partner/dashboard';
    
    if (user && user.role === 'admin') {
        redirectTo = '/admin';
    }

    await signIn('credentials', { ...Object.fromEntries(formData), redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

import crypto from 'crypto';

// ... (existing helper function authenticate if needed, but we are replacing the whole file content for cleanliness or partials?)
// I'll stick to replacing chunks to be safe.

// ... authenticate function ...

export async function registerPartner(prevState: unknown, formData: FormData) {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    country: formData.get('country'),
    partnerType: formData.get('partnerType'),
    primaryPlatform: formData.get('primaryPlatform') || undefined,
    profileUrl: formData.get('profileUrl') || undefined,
    audienceSize: formData.get('audienceSize') || undefined,
    termsAccepted: formData.get('termsAccepted'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register.',
    };
  }

  let { name, email, password, country, partnerType, primaryPlatform, profileUrl, audienceSize } = validatedFields.data;
  email = email.toLowerCase();

  try {
    await dbConnect();

    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return {
        message: 'Email already in use.',
      };
    }

    let referralCode = undefined;
    let tier = 'creator';

    if (partnerType === 'influencer') {
        const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        referralCode = `leo-${slugBase}-${randomSuffix}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Extract IP for legal compliance
    let clientIp = 'unknown';
    try {
      const headersList = await headers();
      clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || headersList.get('x-real-ip') 
        || 'unknown';
    } catch (e) {
      // Ignore if called outside request scope (e.g. testing scripts)
    }

    const newPartner = await Partner.create({
      name,
      email,
      password: hashedPassword,
      countryOfResidence: country,
      role: 'partner',
      partnerType,
      primaryPlatform,
      profileUrl,
      audienceSize,
      tier,
      referralCode,
      status: 'active', 
      emailVerified: false,
      kycStatus: 'not_started',
      riskLevel: 'low',
      debtBalance: 0,
      verificationToken,
      verificationTokenExpiry,
      // Legal & Compliance — immutable after creation
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsAcceptedIp: clientIp,
      termsVersion: CURRENT_TERMS_VERSION,
    });

    // Check for multiple accounts from the same IP
    if (clientIp !== 'unknown') {
      const accountsCount = await Partner.countDocuments({ termsAcceptedIp: clientIp });
      if (accountsCount > 1) {
        await AffiliateRiskFlag.create({
          partnerId: newPartner._id,
          type: 'multiple_accounts_ip',
          severity: 'low',
          message: `Multiple accounts created from IP: ${clientIp}`
        });
      }
    }

    await AuditLog.create({
      entityType: 'partner',
      entityId: newPartner._id as mongoose.Types.ObjectId,
      action: 'partner_signup',
      performedBy: newPartner._id as mongoose.Types.ObjectId,
      details: { partnerType, country },
    });
    
    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/partner/verify?token=${verificationToken}`;
    
    await sendEmail({
        to: email,
        subject: 'Activate your Leo The Tech Guy Account',
        html: EmailTemplates.verifyEmail(name, verificationLink),
    });

    // NO Admin Notification

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error?.name === 'ValidationError') {
       const fieldErrors: Record<string, string[]> = {};
       for (const field in error.errors) {
         fieldErrors[field] = [error.errors[field].message];
       }
       return {
         message: 'Validation Error: Please check your inputs.',
         errors: fieldErrors,
       };
    }

    return {
      message: error instanceof Error ? error.message : 'Database Error: Failed to Register.',
    };
  }

  return { success: true, message: 'Account created! Please check your email to activate your account.' };
}

export async function verifyEmail(token: string) {
    try {
        await dbConnect();
        const partner = await Partner.findOne({ 
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() }
        });

        if (!partner) {
            return { success: false, message: 'Invalid or expired token.' };
        }

        await Partner.updateOne(
            { _id: partner._id },
            { 
               $set: { status: 'active', emailVerified: true },
               $unset: { verificationToken: "", verificationTokenExpiry: "" }
            }
        );

        return { success: true, message: 'Account activated successfully!' };
    } catch(err: any) {
        console.error('Verify Email Error:', err);
        return { success: false, message: 'Server error during activation.' };
    }
}

export async function resendVerificationEmail() {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false, message: 'Not logged in' };
        
        await dbConnect();
        const partner = await Partner.findOne({ email: session.user.email });
        if (!partner) return { success: false, message: 'Partner not found.' };
        if (partner.emailVerified) return { success: false, message: 'Email already verified.' };

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

        await Partner.updateOne(
            { _id: partner._id },
            { $set: { verificationToken, verificationTokenExpiry } }
        );

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
        const verificationLink = `${baseUrl}/partner/verify?token=${verificationToken}`;
        
        await sendEmail({
            to: partner.email,
            subject: 'Activate your Leo The Tech Guy Account',
            html: EmailTemplates.verifyEmail(partner.name, verificationLink),
        });

        return { success: true, message: 'Verification email sent!' };
    } catch(err: any) {
         console.error("resendVerificationEmail error", err);
         return { success: false, message: "Failed to resend verification email." };
    }
}

export async function forgotPassword(prevState: unknown, formData: FormData) {
    const email = formData.get('email');
    if (!email || typeof email !== 'string') return { message: 'Invalid email' };

    await dbConnect();
    const partner = await Partner.findOne({ email });

    if (!partner) {
        // Do not reveal if user exists
        return { success: true, message: 'If an account exists, a reset link has been sent.' }; 
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    partner.resetPasswordToken = resetToken;
    partner.resetPasswordTokenExpiry = resetTokenExpiry;
    await partner.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
    const resetLink = `${baseUrl}/partner/reset-password?token=${resetToken}`;

    await sendEmail({
        to: partner.email,
        subject: 'Reset your Password',
        html: EmailTemplates.resetPassword(partner.name, resetLink),
    });

    return { success: true, message: 'If an account exists, a reset link has been sent.' };
}

export async function resetPassword(prevState: unknown, formData: FormData) {
    const token = formData.get('token');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        return { message: 'Passwords do not match' };
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) { 
        return { message: 'Password must be at least 6 characters' };
    }
    
    if (!token || typeof token !== 'string') {
        return { message: 'Missing token' };
    }

    await dbConnect();
    const partner = await Partner.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { $gt: new Date() }
    });

    if (!partner) {
        return { message: 'Invalid or expired token' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    partner.password = hashedPassword;
    partner.resetPasswordToken = undefined;
    partner.resetPasswordTokenExpiry = undefined;
    await partner.save();

    return { success: true, message: 'Password reset successfully! You can now login.' };
}

export async function handleSignOut() {
    await signOut();
}

// --- Legal & Compliance: Terms Re-Acceptance ---

export async function acceptTerms(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  const accepted = formData.get('termsAccepted');
  if (accepted !== 'true') {
    return { message: 'You must accept the Affiliate Agreement.' };
  }

  await dbConnect();

  const headersList = await headers();
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || headersList.get('x-real-ip') 
    || 'unknown';

  await Partner.findByIdAndUpdate(session.user.id, {
    termsAccepted: true,
    termsAcceptedAt: new Date(),
    termsAcceptedIp: clientIp,
    termsVersion: CURRENT_TERMS_VERSION,
  });

  revalidatePath('/partner/dashboard');
  redirect('/partner/dashboard');
}
