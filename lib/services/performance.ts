import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { Task } from '@/models/Task';
import { ActivityLog } from '@/models/ActivityLog';
import { Types } from 'mongoose';

export type PerformanceStatus = 'On Track' | 'Watchlist' | 'At Risk' | 'Contract Review';

export interface PerformanceMetrics {
  monthlyClosedDeals: number;
  monthlyQualifiedLeads: number;
  followUpRate: number;
  crmUpdateCompliance: number;
  status: PerformanceStatus;
  isTopPerformer: boolean;
}

export async function calculatePerformanceMetrics(accountId: string): Promise<PerformanceMetrics> {
  await dbConnect();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const accountObjectId = new Types.ObjectId(accountId);

  // 1. Closed Deals (Target: 2/month)
  const monthlyClosedDeals = await Lead.countDocuments({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: 'converted',
    updatedAt: { $gte: startOfMonth }
  });

  // 2. Qualified Opportunities (Target: 5/month)
  const monthlyQualifiedLeads = await Lead.countDocuments({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: { $in: ['qualified', 'converted'] }, // Converted implies it was qualified
    createdAt: { $gte: startOfMonth }
  });

  // 3. Follow-Up Completion Rate (Target: 90%)
  const monthlyTasks = await Task.find({
    assignedTo: accountObjectId,
    dueDate: { $gte: startOfMonth }
  });

  const totalTasks = monthlyTasks.length;
  const completedTasks = monthlyTasks.filter(t => t.status === 'completed').length;
  const followUpRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100; // Default to 100% if no tasks

  // 4. CRM / Portal Updates (Target: within 24 hours)
  // Simplified: Check if any activity log exists for the user's leads in the last 24h of each lead's existence or activity.
  // For MVP: Check percentage of leads updated in the last 7 days.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const totalActiveLeads = await Lead.countDocuments({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: { $ne: 'closed' },
    updatedAt: { $gte: sevenDaysAgo }
  });

  const allActiveLeads = await Lead.countDocuments({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: { $ne: 'closed' }
  });

  const crmUpdateCompliance = allActiveLeads > 0 ? (totalActiveLeads / allActiveLeads) * 100 : 100;

  // Determine Status
  let status: PerformanceStatus = 'On Track';
  
  const dealTarget = 2;
  const leadTarget = 5;
  const followUpTarget = 90;
  const crmTarget = 100; // Actually the policy says 24h, but we use a rate here.

  const dealProgress = (monthlyClosedDeals / dealTarget) * 100;
  const leadProgress = (monthlyQualifiedLeads / leadTarget) * 100;

  if (monthlyClosedDeals >= dealTarget && monthlyQualifiedLeads >= leadTarget && followUpRate >= followUpTarget) {
    status = 'On Track';
  } else if (dealProgress >= 50 || leadProgress >= 50) {
    status = 'Watchlist';
  } else if (dealProgress > 0 || leadProgress > 0) {
    status = 'At Risk';
  } else {
    status = 'Contract Review';
  }

  // Top Performer Logic (Simplified: > 4 deals and > 10 leads)
  const isTopPerformer = monthlyClosedDeals >= 4 && monthlyQualifiedLeads >= 10 && followUpRate >= 95;

  return {
    monthlyClosedDeals,
    monthlyQualifiedLeads,
    followUpRate: Math.round(followUpRate),
    crmUpdateCompliance: Math.round(crmUpdateCompliance),
    status,
    isTopPerformer
  };
}
