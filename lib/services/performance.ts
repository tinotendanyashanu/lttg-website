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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const accountObjectId = new Types.ObjectId(accountId);

  // 1. Closed Deals (Target: 2/month)
  // Count both converted leads and closed cases
  const [convertedLeads, closedCases] = await Promise.all([
    Lead.countDocuments({
      $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
      status: 'converted',
      updatedAt: { $gte: startOfMonth }
    }),
    mongoose.models.Case ? mongoose.models.Case.countDocuments({
      ownerId: accountObjectId,
      status: 'closed',
      closedAt: { $gte: startOfMonth }
    }) : 0
  ]);

  const monthlyClosedDeals = convertedLeads + (closedCases || 0);

  // 2. Qualified Opportunities (Target: 5/month)
  const monthlyQualifiedLeads = await Lead.countDocuments({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: { $in: ['qualified', 'converted'] },
    // If a lead was created this month OR moved to qualified status this month
    $or: [
      { createdAt: { $gte: startOfMonth } },
      { status: { $in: ['qualified', 'converted'] }, updatedAt: { $gte: startOfMonth } }
    ]
  });

  // 3. Follow-Up Completion Rate (Target: 90%)
  // Only count tasks that are either completed OR past their due date
  const relevantTasks = await Task.find({
    assignedTo: accountObjectId,
    $or: [
      { status: 'completed', updatedAt: { $gte: startOfMonth } },
      { dueDate: { $gte: startOfMonth, $lte: now } }
    ]
  });

  const totalRelevantTasks = relevantTasks.length;
  const completedTasks = relevantTasks.filter(t => t.status === 'completed').length;
  const followUpRate = totalRelevantTasks > 0 ? (completedTasks / totalRelevantTasks) * 100 : 100;

  // 4. CRM / Portal Updates (Target: within 24-48 hours)
  // Check active leads assigned to the user
  const activeLeads = await Lead.find({
    $or: [{ assignedTo: accountObjectId }, { accountId: accountObjectId }],
    status: { $in: ['new', 'contacted', 'qualified'] }
  }).select('updatedAt').lean();

  const updatedLeadsCount = activeLeads.filter(l => l.updatedAt >= fortyEightHoursAgo).length;
  const crmUpdateCompliance = activeLeads.length > 0 ? (updatedLeadsCount / activeLeads.length) * 100 : 100;

  // Determine Status
  let status: PerformanceStatus = 'On Track';
  
  const dealTarget = 2;
  const leadTarget = 5;
  const followUpTarget = 90;

  // Logic: 
  // - On Track: Meets all core targets
  // - Watchlist: Missing one target slightly
  // - At Risk: Missing multiple targets or one significantly
  // - Contract Review: Repeated or extreme underperformance

  const meetsDeals = monthlyClosedDeals >= dealTarget;
  const meetsLeads = monthlyQualifiedLeads >= leadTarget;
  const meetsFollowUp = followUpRate >= followUpTarget;
  const meetsCRM = crmUpdateCompliance >= 80; // Reasonable threshold for "within 24h" policy

  if (meetsDeals && meetsLeads && meetsFollowUp && meetsCRM) {
    status = 'On Track';
  } else if (!meetsDeals && monthlyClosedDeals >= 1) {
    status = 'Watchlist';
  } else if (monthlyClosedDeals === 0 && (now.getDate() > 15)) {
    // Halfway through month with no deals
    status = 'At Risk';
  } else if (!meetsFollowUp && followUpRate < 70) {
    status = 'At Risk';
  } else if (monthlyClosedDeals === 0 && monthlyQualifiedLeads === 0 && (now.getDate() > 20)) {
    status = 'Contract Review';
  }

  // Top Performer Logic
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
