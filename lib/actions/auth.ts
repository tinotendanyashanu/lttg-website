'use server';

import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import bcrypt from 'bcryptjs';
import { SignupSchema } from '@/lib/schemas';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { headers } from 'next/headers';
import { CURRENT_TERMS_VERSION } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
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
    companyName: formData.get('companyName'),
    partnerType: formData.get('partnerType'),
    termsAccepted: formData.get('termsAccepted'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register.',
    };
  }

  const { name, email, password, companyName } = validatedFields.data;

  try {
    await dbConnect();

    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return {
        message: 'Email already in use.',
      };
    }

    const { partnerType } = validatedFields.data;
    let referralCode = undefined;
    let tier = 'referral';

    if (partnerType === 'creator') {
        tier = 'creator';
        // Generate a base slug from name
        const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const randomSuffix = crypto.randomBytes(3).toString('hex');
        referralCode = `leo-${slugBase}-${randomSuffix}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Extract IP for legal compliance
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || headersList.get('x-real-ip') 
      || 'unknown';

    await Partner.create({
      name,
      email,
      companyName,
      password: hashedPassword,
      role: 'partner',
      partnerType,
      tier,
      referralCode,
      status: 'pending', 
      verificationToken,
      verificationTokenExpiry,
      // Legal & Compliance — immutable after creation
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsAcceptedIp: clientIp,
      termsVersion: CURRENT_TERMS_VERSION,
    });
    
    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/partner/verify?token=${verificationToken}`;
    
    await sendEmail({
        to: email,
        subject: 'Activate your Leo The Tech Guy Account',
        html: EmailTemplates.verifyEmail(name, verificationLink),
    });

    // NO Admin Notification

  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: 'Database Error: Failed to Register.',
    };
  }

  return { success: true, message: 'Account created! Please check your email to activate your account.' };
}

export async function verifyEmail(token: string) {
    await dbConnect();
    const partner = await Partner.findOne({ 
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!partner) {
        return { success: false, message: 'Invalid or expired token.' };
    }

    partner.status = 'active';
    partner.verificationToken = undefined;
    partner.verificationTokenExpiry = undefined;
    await partner.save();

    return { success: true, message: 'Account activated successfully!' };
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
        resetPasswordTokenExpiry: { $gt: Date.now() }
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
