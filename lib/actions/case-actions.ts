'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import { Comment } from '@/models/Comment';
import { ActivityLog } from '@/models/ActivityLog';
import { Case } from '@/models/Case';
import { getAccountByEmail } from '@/lib/data/account';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// ─── Comments ────────────────────────────────────────────

export async function addComment(caseId: string, message: string, visibilityLevel: 'team' | 'all' = 'team') {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account) return { success: false, message: 'Account not found' };

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return { success: false, message: 'Case not found' };

    await Comment.create({
      caseId: new mongoose.Types.ObjectId(caseId),
      authorAccountId: account._id,
      message,
      visibilityLevel,
    });

    await ActivityLog.create({
      caseId: new mongoose.Types.ObjectId(caseId),
      actorAccountId: account._id,
      actionType: 'comment_added',
      newValue: 'Comment added',
    });

    revalidatePath(`/portal/employee/case-management/${caseId}`);
    return { success: true, message: 'Comment added successfully' };
  } catch (error) {
    console.error('Add comment error:', error);
    return { success: false, message: 'Failed to add comment' };
  }
}

export async function getComments(caseId: string) {
  try {
    await dbConnect();
    const comments = await Comment.find({ caseId }).populate('authorAccountId', 'roles profileImageUrl').lean();
    return { success: true, comments: JSON.parse(JSON.stringify(comments)) };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, comments: [] };
  }
}

// ─── Activity Logs ───────────────────────────────────────

export async function getActivityLogs(caseId: string) {
  try {
    await dbConnect();
    const logs = await ActivityLog.find({ caseId }).populate('actorAccountId', 'roles profileImageUrl').sort({ createdAt: -1 }).lean();
    return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
  } catch (error) {
    console.error('Get activity logs error:', error);
    return { success: false, logs: [] };
  }
}

// ─── Assignments ─────────────────────────────────────────

export async function assignCase(caseId: string, accountId: string | null, teamId: string | null) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return { success: false, message: 'Case not found' };

    // Activity log will need custom tracking if ownerId/participants change
    return { success: false, message: 'Assignment handled via dedicated endpoints' };
  } catch (error) {
    console.error('Assign case error:', error);
    return { success: false, message: 'Failed to assign case' };
  }
}
