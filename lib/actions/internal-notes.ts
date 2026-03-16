'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import type { NoteEntityType } from '@/models/InternalNote';

async function checkStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !['admin', 'employee', 'intern'].includes(role)) throw new Error('Unauthorized');
  return session!.user;
}

export async function getInternalNotes(entityType: NoteEntityType, entityId: string) {
  await checkStaff();
  await dbConnect();
  const { InternalNote } = await import('@/models/InternalNote');
  const { Account } = await import('@/models/Account');

  const notes = await InternalNote.find({ entityType, entityId })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(100)
    .lean();

  const authorIds = [...new Set(notes.map((n: any) => String(n.authorId)))];
  const authors = await Account.find({ _id: { $in: authorIds } }, 'fullName email').lean();
  const authorMap: Record<string, { fullName?: string; email: string }> = {};
  for (const a of authors as any[]) {
    authorMap[String(a._id)] = { fullName: a.fullName, email: a.email };
  }

  return JSON.parse(JSON.stringify(notes.map((n: any) => ({
    ...n,
    author: authorMap[String(n.authorId)] ?? null,
  }))));
}

export async function addInternalNote(entityType: NoteEntityType, entityId: string, content: string) {
  const user = await checkStaff();
  if (!content?.trim()) throw new Error('Note content cannot be empty.');
  await dbConnect();
  const { InternalNote } = await import('@/models/InternalNote');

  await InternalNote.create({
    entityType,
    entityId,
    authorId: user.id,
    content: content.trim(),
  });

  revalidatePath('/admin/clients');
  revalidatePath('/admin/cases');
  return { success: true };
}

export async function deleteInternalNote(noteId: string) {
  const user = await checkStaff();
  await dbConnect();
  const { InternalNote } = await import('@/models/InternalNote');

  const note = await InternalNote.findById(noteId);
  if (!note) throw new Error('Note not found.');
  // Only author or admin can delete
  if (String(note.authorId) !== user.id && user.role !== 'admin') {
    throw new Error('You can only delete your own notes.');
  }

  await InternalNote.findByIdAndDelete(noteId);
  return { success: true };
}

export async function togglePinNote(noteId: string) {
  const user = await checkStaff();
  if (user.role !== 'admin') throw new Error('Only admins can pin notes.');
  await dbConnect();
  const { InternalNote } = await import('@/models/InternalNote');

  const note = await InternalNote.findById(noteId);
  if (!note) throw new Error('Note not found.');

  await InternalNote.findByIdAndUpdate(noteId, { $set: { isPinned: !note.isPinned } });
  return { success: true };
}
