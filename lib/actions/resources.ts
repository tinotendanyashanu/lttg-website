'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import { Resource } from '@/models/Resource';
import { uploadFileToR2 } from '@/lib/r2';
import { revalidatePath } from 'next/cache';

export async function uploadResource(formData: FormData) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const roleVisibility = formData.get('roleVisibility') as string; // 'all', 'admin', 'employee', 'intern'
  const file = formData.get('file') as File;

  if (!title || !file || file.size === 0) {
    return { success: false, message: 'Title and file are required' };
  }

  try {
    await dbConnect();
    
    // Upload file to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `resources/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    const fileUrl = await uploadFileToR2(buffer, fileName, file.type);

    // Create Resource record
    const visibilityArray = roleVisibility ? [roleVisibility] : ['all'];
    
    await Resource.create({
      title,
      description,
      fileUrl,
      roleVisibility: visibilityArray
    });

    revalidatePath('/portal/employee/resources');
    revalidatePath('/portal/client/resources');
    return { success: true, message: 'Resource uploaded successfully' };
  } catch (error) {
    console.error('Failed to upload resource:', error);
    return { success: false, message: 'Failed to upload resource' };
  }
}
