'use server';

import dbConnect from '@/lib/mongodb';
import { Account } from '@/models/Account';
import Lead from '@/models/Lead';
import Deal from '@/models/Deal';
import Commission from '@/models/Commission';
import { ActivityLog } from '@/models/ActivityLog';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';
import { Types } from 'mongoose';

// --- Identity Snapshot ---
export async function getIdentitySnapshot(email: string) {
  try {
    await dbConnect();
    const account = await Account.findOne({ email }).lean();
    if (!account) return null;

    return {
      fullName: account.fullName,
      roles: account.roles,
      teamId: account.teamId ? account.teamId.toString() : null,
      profileImageUrl: account.profileImageUrl,
      isActive: account.isActive,
    };
  } catch (error) {
    console.error('Error fetching identity snapshot:', error);
    return null;
  }
}

// --- Admin Queries ---
export async function getAdminPerformanceMetrics() {
  try {
    await dbConnect();
    
    // Total Leads & Total Closed (Converted)
    const totalLeads = await Lead.countDocuments({});
    const totalClosedLeads = await Lead.countDocuments({ status: 'converted' });
    
    // Total Revenue (From Deals)
    const deals = await Deal.find({ dealStatus: { $in: ['approved', 'closed'] } });
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.finalValue || deal.estimatedValue || 0), 0);
    
    // Commission Stats
    const commissions = await Commission.find({});
    const totalPendingCommission = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
      
    const totalPaidCommission = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      totalLeads,
      totalClosedLeads,
      totalRevenue,
      totalPendingCommission,
      totalPaidCommission,
    };
  } catch (error) {
    console.error('Error fetching admin performance metrics:', error);
    return null;
  }
}

export async function getAdminActiveCases() {
  try {
    await dbConnect();
    
    // Leads pending status update (e.g., still 'new') - returning top 5 oldest
    const pendingStatusLeads = await Lead.find({ status: 'new' })
      .sort({ createdAt: 1 })
      .limit(5)
      .lean();
      
    // Commissions pending payment
    const pendingCommissions = await Commission.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(5)
      .populate('accountId', 'fullName')
      .populate('leadId', 'clientName businessName')
      .lean();

    // Mapping to plain objects
    return {
      pendingStatusLeads: pendingStatusLeads.map(l => ({
        id: l._id.toString(),
        name: l.clientName || l.businessName || 'Unknown Lead',
        createdAt: l.createdAt,
      })),
      pendingCommissions: pendingCommissions.map((c: any) => ({
        id: c._id.toString(),
        amount: c.amount,
        accountName: c.accountId?.fullName || 'Unknown',
        leadName: c.leadId?.clientName || c.leadId?.businessName || 'Unknown',
        createdAt: c.createdAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching admin active cases:', error);
    return { pendingStatusLeads: [], pendingCommissions: [] };
  }
}

export async function getAdminRecentActivity() {
  try {
    await dbConnect();
    // Import Case here to ensure it's registered before ActivityLog populate
    await import('@/models/Case');
    
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('actorAccountId', 'fullName profileImageUrl')
      .populate('caseId', 'contactName businessName')
      .lean();
      
    return logs.map((log: any) => ({
      id: log._id.toString(),
      actorName: log.actorAccountId?.fullName || 'System',
      actorImage: log.actorAccountId?.profileImageUrl,
      actionType: log.actionType,
      caseName: log.caseId?.businessName || log.caseId?.contactName || 'Case',
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching admin recent activity:', error);
    return [];
  }
}

import { calculatePerformanceMetrics } from '@/lib/services/performance';

// --- Identity Snapshot ---
export async function getPersonalPerformanceMetrics(accountId: string, roles: string[]) {
  try {
    await dbConnect();
    const isIntern = roles.includes('intern');
    
    let totalLeads = 0;
    let closedLeads = 0;
    let rejectedLeads = 0;
    let conversionRate = 0;
    
    if (isIntern) {
      // Intern metrics based on accountId
      totalLeads = await Lead.countDocuments({ accountId });
      closedLeads = await Lead.countDocuments({ accountId, status: 'converted' });
      rejectedLeads = await Lead.countDocuments({ accountId, status: 'rejected' });
    } else {
      // Employee metrics based on assignedTo
      totalLeads = await Lead.countDocuments({ assignedTo: accountId });
      closedLeads = await Lead.countDocuments({ assignedTo: accountId, status: 'converted' });
    }
    
    if (totalLeads > 0) {
      conversionRate = Math.round((closedLeads / totalLeads) * 100);
    }

    const performanceKPIs = await calculatePerformanceMetrics(accountId);

    return {
      totalLeads,
      closedLeads,
      rejectedLeads, 
      conversionRate,
      ...performanceKPIs
    };
  } catch (error) {
    console.error('Error fetching personal performance metrics:', error);
    return null;
  }
}

export async function getInternEmployeeCommissionSnapshot(accountId: string, roles: string[]) {
  try {
    await dbConnect();
    
    // Fallback calculation from Commission records if stats aren't tracking right yet
    const commissions = await Commission.find({ accountId }).sort({ createdAt: -1 }).lean();
    
    const latestCreated = commissions.length > 0 ? commissions[0] : null;
    const latestPaid = commissions.find(c => c.status === 'paid') || null;

    // We can fetch Account to get the real-time commissionStats
    const account = await Account.findById(accountId).lean();
    const stats = account?.commissionStats || {
      pendingCommission: 0,
      approvedBalance: 0,
      paidCommission: 0,
      totalEarned: 0,
    };

    return {
      totalPending: stats?.pendingCommission || 0,
      totalApproved: stats?.approvedBalance || 0,
      totalPaid: stats?.paidCommission || 0,
      lifetimeEarnings: stats?.totalEarned || 0,
      latestCreatedDate: latestCreated?.createdAt || null,
      latestPaidDate: latestPaid?.paidAt || null,
    };
  } catch (error) {
    console.error('Error fetching internal commission snapshot:', error);
    return null;
  }
}

export async function getPersonalActiveCases(accountId: string, roles: string[]) {
  try {
    await dbConnect();
    const isIntern = roles.includes('intern');
    
    let activeLeads = [];
    
    if (isIntern) {
      activeLeads = await Lead.find({ 
        accountId, 
        status: { $in: ['new', 'contacted'] } 
      }).sort({ updatedAt: -1 }).limit(5).lean();
    } else {
      activeLeads = await Lead.find({ 
        assignedTo: accountId, 
        status: { $in: ['new', 'contacted'] } 
      }).sort({ updatedAt: -1 }).limit(5).lean();
    }

    return activeLeads.map(l => ({
      id: l._id.toString(),
      // contactName is used for intern-submitted leads; clientName for partner leads
      name: l.contactName || l.clientName || l.businessName || 'Unknown Lead',
      status: l.status,
      updatedAt: l.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching personal active cases:', error);
    return [];
  }
}

export async function getPersonalRecentActivity(accountId: string, roles: string[]) {
  try {
    await dbConnect();
    // ActivityLog.caseId references the Case model (not Lead).
    // Fetch Case IDs where this account is owner or participant.
    const { Case } = await import('@/models/Case');
    const accountObjectId = new Types.ObjectId(accountId);
    
    const userCases = await Case.find({
      $or: [
        { ownerId: accountObjectId },
        { participants: accountObjectId },
        { assistingMembers: accountObjectId },
      ]
    }).select('_id').lean();
    const caseIds = userCases.map(c => c._id);
    
    const logs = await ActivityLog.find({
      $or: [
        { actorAccountId: accountId },
        { caseId: { $in: caseIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('actorAccountId', 'fullName profileImageUrl')
      .populate('caseId', 'contactName businessName')
      .lean();
      
    return logs.map((log: any) => ({
      id: log._id.toString(),
      actorName: log.actorAccountId?.fullName || 'System',
      actorImage: log.actorAccountId?.profileImageUrl,
      actionType: log.actionType,
      caseName: log.caseId?.businessName || log.caseId?.contactName || 'Case',
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching personal recent activity:', error);
    return [];
  }
}

export async function getPriorityQueue(accountId: string) {
  try {
    await dbConnect();
    const { Case } = await import('@/models/Case');
    const accountObjectId = new Types.ObjectId(accountId);

    // Fetch active cases
    const activeCases = await Case.find({
      status: { $in: ['new', 'active', 'needs_assistance'] },
      $or: [
        { ownerId: accountObjectId },
        { participants: accountObjectId },
        { assistingMembers: accountObjectId },
      ]
    }).lean();

    // Scoring Algorithm
    const scoredTasks = activeCases.map((c: any) => {
      let score = 0;

      // Status weight
      if (c.status === 'needs_assistance') score += 50;
      if (c.status === 'new') score += 30;
      if (c.status === 'active') score += 10;

      // UrgencyLevel weight
      if (c.urgencyLevel === 'high') score += 40;
      if (c.urgencyLevel === 'medium') score += 20;

      // Age weight (max 30 points for 30 days+)
      const ageInDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      score += Math.min(ageInDays, 30);

      // Activity weight (no update in 3 days = +20)
      const daysSinceUpdate = Math.floor((Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 3) score += 20;

      return {
        id: c._id.toString(),
        type: 'case',
        title: c.businessName || c.contactName,
        subtitle: c.serviceInterest,
        status: c.status,
        urgency: c.urgencyLevel || 'low',
        score,
        updatedAt: c.updatedAt,
      };
    });

    // Sort by score descending
    return scoredTasks.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error fetching priority queue:', error);
    return [];
  }
}

// --- Shared Queries ---
export async function getKnowledgeShortcuts() {
  try {
    await dbConnect();
    const articles = await KnowledgeArticle.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
      
    return articles.map(a => ({
      id: a._id.toString(),
      title: a.title,
      category: a.category,
      slug: a.slug,
    }));
  } catch (error) {
    console.error('Error fetching knowledge shortcuts:', error);
    return [];
  }
}
