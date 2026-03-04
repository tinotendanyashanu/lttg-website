'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import dbConnect from '@/lib/mongodb';
import { Announcement, AnnouncementCategory, AnnouncementPriority, AnnouncementVisibility } from '@/models/Announcement';
import { getAccountByEmail } from '@/lib/data/account';
import { revalidatePath } from 'next/cache';

interface CreateAnnouncementParams {
  title: string;
  message: string;
  category: AnnouncementCategory;
  priorityLevel: AnnouncementPriority;
  targetRoles?: AnnouncementVisibility[];
  targetTeams?: string[];
  attachments?: string[];
  link?: string;
  isPinned?: boolean;
  isActive?: boolean;
  expiresAt?: Date;
}

export async function createAnnouncement(params: CreateAnnouncementParams) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    await Announcement.create({
      ...params,
      createdBy: account._id,
      targetRoles: params.targetRoles || ['all']
    });

    revalidatePath('/portal');
    revalidatePath('/portal/announcements');
    return { success: true, message: 'Announcement created successfully' };
  } catch (error) {
    console.error('Create announcement error:', error);
    return { success: false, message: 'Failed to create announcement' };
  }
}

export async function updateAnnouncement(id: string, params: Partial<CreateAnnouncementParams> & { isActive?: boolean }) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    await Announcement.findByIdAndUpdate(id, params);

    revalidatePath('/portal');
    revalidatePath('/portal/announcements');
    return { success: true, message: 'Announcement updated successfully' };
  } catch (error) {
    console.error('Update announcement error:', error);
    return { success: false, message: 'Failed to update announcement' };
  }
}

export async function deleteAnnouncement(id: string) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, message: 'Unauthorized' };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) return { success: false, message: 'Forbidden' };

    await Announcement.findByIdAndDelete(id);

    revalidatePath('/portal');
    revalidatePath('/portal/announcements');
    return { success: true, message: 'Announcement deleted successfully' };
  } catch (error) {
    console.error('Delete announcement error:', error);
    return { success: false, message: 'Failed to delete announcement' };
  }
}

export async function getActiveAnnouncements(userRoles: string[], userTeams: string[] = []) {
  try {
    await dbConnect();
    
    // Target roles logic
    const roleConditions = [{ targetRoles: 'all' }, ...userRoles.map(role => ({ targetRoles: role }))];
    
    // Team conditions logic (if an announcement targets teams, you must be in that team, OR if it has no teams, you check role)
    // Actually, usually it's "if targetTeams is set and matches user, OR targetRoles matches user".
    // Let's say: (matches role AND (no specific teams OR matches teams))
    
    const announcements = await Announcement.find({
      isActive: true,
      $and: [
        { $or: roleConditions },
        { $or: [
            { targetTeams: { $exists: false } }, 
            { targetTeams: { $size: 0 } }, 
            { targetTeams: { $in: userTeams } }
          ] 
        },
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
      ]
    })
    .populate('createdBy', 'profileImageUrl roles fullName')
    .sort({ isPinned: -1, priorityLevel: -1, createdAt: -1 }) // We might need to handle priority sorting correctly if it's enum (Critical > Important > Normal), but string sorting might be alphabetical. Let's sort by isPinned and createdAt.
    .lean();

    // To sort enum: we might need custom sort in JS, or since there are only a few, we can fetch and sort.
    // MongoDB string sort: Critical (C), Important (I), Normal (N) -> C, I, N. Alphabetically C < I < N! 
    // So sorting priorityLevel: 1 would put Critical first! 

    announcements.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      const priorityWeight: Record<string, number> = { Critical: 3, Important: 2, Normal: 1 };
      const weightA = priorityWeight[a.priorityLevel as string] || 1;
      const weightB = priorityWeight[b.priorityLevel as string] || 1;
      
      if (weightA !== weightB) return weightB - weightA;
      
      return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
    });

    return { success: true, announcements: JSON.parse(JSON.stringify(announcements)) };
  } catch (error) {
    console.error('Get announcements error:', error);
    return { success: false, announcements: [] };
  }
}

export async function getAnnouncementsHistory(filters?: { category?: string; priorityLevel?: string }) {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) return { success: false, announcements: [] };

  try {
    await dbConnect();
    const account = await getAccountByEmail(session.user.email);
    if (!account) return { success: false, announcements: [] };

    const query: any = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.priorityLevel) query.priorityLevel = filters.priorityLevel;

    // Admin can see all history. Regular users only see what was targeted to them
    if (!account.roles.includes('admin')) {
      const roleConditions = [{ targetRoles: 'all' }, ...account.roles.map(r => ({ targetRoles: r }))];
      
      // Assume account model doesn't have teams yet, but if it did we would add it.
      // For mvp, just filter by roles for employees/interns.
      query.$and = [
        { $or: roleConditions }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'profileImageUrl roles fullName')
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, announcements: JSON.parse(JSON.stringify(announcements)) };
  } catch (error) {
    console.error('Get history error:', error);
    return { success: false, announcements: [] };
  }
}
