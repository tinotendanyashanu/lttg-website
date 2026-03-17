'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import type { DocEntityType } from '@/models/Document';

const ALLOWED_ROLES = ['admin', 'employee', 'intern'];

async function requireStaff() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.some((r: string) => ALLOWED_ROLES.includes(r)))
    throw new Error('Unauthorized');
  return account;
}

export async function getDocuments(entityType: DocEntityType, entityId: string) {
  await requireStaff();
  await dbConnect();
  const Doc = (await import('@/models/Document')).default;

  const docs = await Doc.find({ entityType, entityId })
    .populate('uploadedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(docs));
}

export async function addDocumentLink(
  entityType: DocEntityType,
  entityId: string,
  name: string,
  url: string,
) {
  const actor = await requireStaff();
  await dbConnect();
  const Doc = (await import('@/models/Document')).default;

  if (!name?.trim()) throw new Error('Document name is required');
  if (!url?.trim()) throw new Error('URL is required');

  // Validate basic URL shape
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  const doc = await Doc.create({
    entityType,
    entityId,
    name: name.trim(),
    url: url.trim(),
    uploadedBy: actor._id,
  });

  revalidatePath('/portal/admin');
  return { success: true, doc: JSON.parse(JSON.stringify(doc)) };
}

export async function deleteDocument(docId: string) {
  const actor = await requireStaff();
  await dbConnect();
  const Doc = (await import('@/models/Document')).default;

  const doc = await Doc.findById(docId);
  if (!doc) throw new Error('Document not found');

  const isAdmin = actor.roles.includes('admin');
  if (!isAdmin && String(doc.uploadedBy) !== String(actor._id)) {
    throw new Error('Only the uploader or an admin can delete this document');
  }

  await doc.deleteOne();
  revalidatePath('/portal/admin');
  return { success: true };
}
