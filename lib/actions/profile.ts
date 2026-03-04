'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import { revalidatePath } from 'next/cache';

import { uploadFileToR2 } from '@/lib/r2';

export async function updateProfileImage(imageUrl: string) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) return { success: false, message: 'Account not found' };

    account.profileImageUrl = imageUrl;
    await account.save();

    revalidatePath('/portal/profile');
    return { success: true, message: 'Profile image updated successfully' };
  } catch (error) {
    console.error('Update profile image error:', error);
    return { success: false, message: 'Failed to update profile image' };
  }
}

export async function uploadProfileImage(formData: FormData) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  const imageFile = formData.get('imageFile') as File;
  if (!imageFile || imageFile.size === 0) {
    return { success: false, message: 'No file provided' };
  }

  try {
    await dbConnect();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) return { success: false, message: 'Account not found' };

    // Prepare file for R2 upload
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `profiles/${account._id}-${Date.now()}.${fileExtension}`;
    
    // Upload to R2
    const publicUrl = await uploadFileToR2(buffer, fileName, imageFile.type);

    // Save URL to account
    account.profileImageUrl = publicUrl;
    await account.save();

    revalidatePath('/portal/profile');
    return { success: true, message: 'Profile image uploaded successfully' };
  } catch (error) {
    console.error('Upload profile image error:', error);
    return { success: false, message: 'Failed to upload profile image' };
  }
}

export async function updateProfileDetails(formData: FormData) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  const fullName = formData.get('fullName') as string;
  const jobTitle = formData.get('jobTitle') as string;
  const department = formData.get('department') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const location = formData.get('location') as string;
  const bio = formData.get('bio') as string;

  try {
    await dbConnect();
    const account = await Account.findOne({ email: session.user.email });
    if (!account) return { success: false, message: 'Account not found' };

    if (fullName) account.fullName = fullName;
    account.jobTitle = jobTitle;
    account.department = department;
    account.phoneNumber = phoneNumber;
    account.location = location;
    account.bio = bio;

    await account.save();
    revalidatePath('/portal/profile');
    return { success: true, message: 'Profile details updated successfully' };
  } catch (error) {
    console.error('Update profile details error:', error);
    return { success: false, message: 'Failed to update profile details' };
  }
}

export async function logLogin() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return;

  try {
    await dbConnect();
    await Account.updateOne(
      { email: session.user.email },
      { $set: { lastLoginAt: new Date() } }
    );
  } catch (error) {
    console.error('Log login error:', error);
  }
}
