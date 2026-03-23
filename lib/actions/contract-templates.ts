'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session.user;
}

// ── Get all active templates ───────────────────────────────────────────────────

export async function getContractTemplates() {
  await checkAdmin();
  await dbConnect();
  const { ContractTemplate } = await import('@/models/ContractTemplate');
  const templates = await ContractTemplate.find({ isActive: true }).sort({ category: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(templates));
}

// ── Get single template ────────────────────────────────────────────────────────

export async function getContractTemplate(id: string) {
  await checkAdmin();
  await dbConnect();
  const { ContractTemplate } = await import('@/models/ContractTemplate');
  const template = await ContractTemplate.findById(id).lean();
  return template ? JSON.parse(JSON.stringify(template)) : null;
}

// ── Create template ────────────────────────────────────────────────────────────

export async function createContractTemplate(data: {
  name: string;
  description?: string;
  category: string;
  content: string;
}) {
  await checkAdmin();
  await dbConnect();
  const { ContractTemplate } = await import('@/models/ContractTemplate');

  await ContractTemplate.create({
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    category: data.category.trim() || 'General',
    content: data.content.trim(),
  });

  revalidatePath('/admin/contracts/templates');
  return { success: true };
}

// ── Update template ────────────────────────────────────────────────────────────

export async function updateContractTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    content?: string;
  }
) {
  await checkAdmin();
  await dbConnect();
  const { ContractTemplate } = await import('@/models/ContractTemplate');

  const updates: Record<string, string> = {};
  if (data.name) updates.name = data.name.trim();
  if (data.description !== undefined) updates.description = data.description.trim();
  if (data.category) updates.category = data.category.trim();
  if (data.content) updates.content = data.content.trim();

  await ContractTemplate.findByIdAndUpdate(id, { $set: updates });
  revalidatePath('/admin/contracts/templates');
  return { success: true };
}

// ── Soft-delete template ───────────────────────────────────────────────────────

export async function deleteContractTemplate(id: string) {
  await checkAdmin();
  await dbConnect();
  const { ContractTemplate } = await import('@/models/ContractTemplate');
  await ContractTemplate.findByIdAndUpdate(id, { $set: { isActive: false } });
  revalidatePath('/admin/contracts/templates');
  return { success: true };
}
