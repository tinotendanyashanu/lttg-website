'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import { getAccountByEmail } from '@/lib/data/account';
import Lead from '@/models/Lead';
import Quest from '@/models/Quest';
import type { QuestMetric } from '@/lib/types/quest';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

const METRIC_LABELS: Record<QuestMetric, string> = {
  converted_leads: 'Won sales (converted leads)',
  new_leads: 'New leads created',
  qualified_leads: 'Qualified opportunities',
  revenue: 'Revenue from won leads ($)',
};

function questAppliesToUser(targetRoles: string[] | undefined, userRoles: string[]): boolean {
  const targets = !targetRoles?.length || targetRoles.includes('all') ? ['all'] : targetRoles;
  if (targets.includes('all')) return true;
  if (userRoles.includes('employee') && targets.includes('employee')) return true;
  if (userRoles.includes('intern') && targets.includes('intern')) return true;
  return false;
}

function leadAttributionFilter(accountId: string, isIntern: boolean) {
  const oid = new Types.ObjectId(accountId);
  if (isIntern) return { accountId: oid };
  return { assignedTo: oid };
}

async function countMetricForQuest(
  accountId: string,
  roles: string[],
  metric: QuestMetric,
  startsAt: Date,
  endsAt: Date
): Promise<number> {
  const isIntern = roles.includes('intern');
  const base = leadAttributionFilter(accountId, isIntern);
  const range = { $gte: startsAt, $lte: endsAt };

  switch (metric) {
    case 'new_leads': {
      return Lead.countDocuments({
        ...base,
        createdAt: range,
      });
    }
    case 'converted_leads': {
      return Lead.countDocuments({
        ...base,
        status: 'converted',
        updatedAt: range,
      });
    }
    case 'qualified_leads': {
      return Lead.countDocuments({
        ...base,
        status: { $in: ['qualified', 'converted'] },
        updatedAt: range,
      });
    }
    case 'revenue': {
      const leads = await Lead.find({
        ...base,
        status: 'converted',
        updatedAt: range,
        dealValue: { $gt: 0 },
      })
        .select('dealValue')
        .lean();
      return Math.round(leads.reduce((s, l) => s + (l.dealValue || 0), 0));
    }
    default:
      return 0;
  }
}

export type QuestListItem = {
  _id: string;
  title: string;
  description: string;
  metric: QuestMetric;
  metricLabel: string;
  targetValue: number;
  startsAt: string;
  endsAt: string;
  rewardLabel?: string;
  isActive: boolean;
  targetRoles: string[];
  createdAt: string;
};

export type QuestWithProgress = QuestListItem & {
  currentValue: number;
  percent: number;
  completed: boolean;
};

export async function getQuestsForAdmin(): Promise<QuestListItem[]> {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return [];

  await dbConnect();
  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) return [];

  const rows = await Quest.find({})
    .sort({ endsAt: -1 })
    .lean();

  return rows.map((q) => ({
    _id: q._id.toString(),
    title: q.title,
    description: q.description || '',
    metric: q.metric as QuestMetric,
    metricLabel: METRIC_LABELS[q.metric as QuestMetric],
    targetValue: q.targetValue,
    startsAt: q.startsAt.toISOString(),
    endsAt: q.endsAt.toISOString(),
    rewardLabel: q.rewardLabel,
    isActive: q.isActive,
    targetRoles: q.targetRoles?.length ? q.targetRoles : ['all'],
    createdAt: q.createdAt.toISOString(),
  }));
}

export async function getActiveQuestsWithProgress(
  accountId: string,
  userRoles: string[]
): Promise<QuestWithProgress[]> {
  try {
    await dbConnect();
    const now = new Date();

    const quests = await Quest.find({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    })
      .sort({ endsAt: 1 })
      .lean();

    const forUser = quests.filter((q) => questAppliesToUser(q.targetRoles, userRoles));
    if (forUser.length === 0) return [];

    const results: QuestWithProgress[] = [];
    for (const q of forUser) {
      const currentValue = await countMetricForQuest(
        accountId,
        userRoles,
        q.metric as QuestMetric,
        q.startsAt,
        q.endsAt
      );
      const target = q.targetValue;
      const percent = target > 0 ? Math.min(100, Math.round((currentValue / target) * 100)) : 0;
      const completed = currentValue >= target;

      results.push({
        _id: q._id.toString(),
        title: q.title,
        description: q.description || '',
        metric: q.metric as QuestMetric,
        metricLabel: METRIC_LABELS[q.metric as QuestMetric],
        targetValue: target,
        startsAt: q.startsAt.toISOString(),
        endsAt: q.endsAt.toISOString(),
        rewardLabel: q.rewardLabel,
        isActive: q.isActive,
        targetRoles: q.targetRoles?.length ? q.targetRoles : ['all'],
        createdAt: q.createdAt.toISOString(),
        currentValue,
        percent,
        completed,
      });
    }
    return results;
  } catch (e) {
    console.error('getActiveQuestsWithProgress', e);
    return [];
  }
}

export async function createQuest(data: {
  title: string;
  description?: string;
  metric: QuestMetric;
  targetValue: number;
  startsAt: Date;
  endsAt: Date;
  rewardLabel?: string;
  isActive?: boolean;
  targetRoles: string[];
}) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };
  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    if (data.endsAt <= data.startsAt) {
      return { success: false, message: 'End date must be after start date' };
    }

    await Quest.create({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      metric: data.metric,
      targetValue: data.targetValue,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      rewardLabel: data.rewardLabel?.trim() || undefined,
      isActive: data.isActive !== false,
      targetRoles: data.targetRoles.length ? data.targetRoles : ['all'],
      createdBy: account._id,
    });

    revalidatePath('/portal');
    revalidatePath('/portal/quests');
    revalidatePath('/portal/admin/quests');
    return { success: true, message: 'Quest created' };
  } catch (e) {
    console.error('createQuest', e);
    return { success: false, message: 'Failed to create quest' };
  }
}

export async function updateQuest(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    metric: QuestMetric;
    targetValue: number;
    startsAt: Date;
    endsAt: Date;
    rewardLabel: string;
    isActive: boolean;
    targetRoles: string[];
  }>
) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };
  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
      return { success: false, message: 'End date must be after start date' };
    }

    const patch: Record<string, unknown> = { ...data };
    if (typeof data.title === 'string') patch.title = data.title.trim();
    if (typeof data.description === 'string') patch.description = data.description.trim();
    if (typeof data.rewardLabel === 'string') patch.rewardLabel = data.rewardLabel.trim() || undefined;

    await Quest.findByIdAndUpdate(id, { $set: patch });

    revalidatePath('/portal');
    revalidatePath('/portal/quests');
    revalidatePath('/portal/admin/quests');
    return { success: true, message: 'Quest updated' };
  } catch (e) {
    console.error('updateQuest', e);
    return { success: false, message: 'Failed to update quest' };
  }
}

export async function deleteQuest(id: string) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };
  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    await Quest.findByIdAndDelete(id);
    revalidatePath('/portal');
    revalidatePath('/portal/quests');
    revalidatePath('/portal/admin/quests');
    return { success: true, message: 'Quest removed' };
  } catch (e) {
    console.error('deleteQuest', e);
    return { success: false, message: 'Failed to delete quest' };
  }
}
