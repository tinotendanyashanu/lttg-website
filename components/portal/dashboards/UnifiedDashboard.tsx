import React from 'react';
import Link from 'next/link';
import { 
  getIdentitySnapshot,
  getPersonalPerformanceMetrics,
  getPersonalRecentActivity,
  getInternEmployeeCommissionSnapshot,
  getKnowledgeShortcuts,
  getPriorityQueue
} from '@/lib/actions/dashboard';
import { getActiveQuestsWithProgress } from '@/lib/actions/quests';
import { getBlackHoleMetrics } from '@/lib/actions/blackhole';
import SalesQuests from './widgets/SalesQuests';
import BlackHoleWidget from './widgets/BlackHoleWidget';
import IdentitySnapshot from './widgets/IdentitySnapshot';
import PersonalPerformance from './widgets/PersonalPerformance';
import PriorityQueue from './widgets/PriorityQueue';
import RecentActivityFeed from './widgets/RecentActivityFeed';
import InternCommissionSnapshot from './widgets/InternCommissionSnapshot';
import KnowledgeShortcuts from './widgets/KnowledgeShortcuts';
import PerformanceTargets from './widgets/PerformanceTargets';

interface UnifiedDashboardProps {
  title: string;
  accountId: string;
  email: string;
  roles: string[];
}

export default async function UnifiedDashboard({ title, accountId, email, roles }: UnifiedDashboardProps) {
  const isIntern = roles.includes('intern');
  
  // Fetch data in parallel
  const [
    identityData,
    performanceData,
    priorityTasks,
    recentActivityData,
    knowledgeData,
    commissionData,
    salesQuests,
    blackHoleMetrics
  ] = await Promise.all([
    getIdentitySnapshot(email),
    getPersonalPerformanceMetrics(accountId, roles),
    getPriorityQueue(accountId),
    getPersonalRecentActivity(accountId, roles),
    getKnowledgeShortcuts(),
    getInternEmployeeCommissionSnapshot(accountId, roles),
    getActiveQuestsWithProgress(accountId, roles),
    getBlackHoleMetrics(accountId)
  ]);

  if (!identityData) return <div>Failed to load profile.</div>;

  return (
    <div className="flex flex-col gap-8 h-full w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">Welcome back, {identityData.fullName.split(' ')[0]}! Here&apos;s your focus for today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/portal/intern/submit-lead" className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors">
              <span className="material-icons-outlined text-[16px]">add_circle</span>
              New Case
           </Link>
        </div>
      </div>

      {blackHoleMetrics && <BlackHoleWidget metrics={blackHoleMetrics} />}

      {salesQuests.length > 0 && <SalesQuests quests={salesQuests} />}

      {/* 1. Identity Snapshot & Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <IdentitySnapshot 
            fullName={identityData.fullName}
            roles={identityData.roles}
            teamId={identityData.teamId}
            profileImageUrl={identityData.profileImageUrl}
            isActive={identityData.isActive}
          />
        </div>
        <div className="xl:col-span-2">
          <PersonalPerformance metrics={performanceData} isIntern={isIntern} />
        </div>
      </div>

      {/* 2. Targets & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <PerformanceTargets metrics={performanceData} />
        </div>
        <div className="lg:col-span-3">
          <PriorityQueue tasks={priorityTasks} />
        </div>
      </div>

      {/* 3. Commission & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <InternCommissionSnapshot metrics={commissionData} title={isIntern ? "Intern Commission" : "Employee Commission"} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivityFeed activities={recentActivityData} />
        </div>
      </div>

      {/* 4. Knowledge */}
      <div className="grid grid-cols-1">
        <KnowledgeShortcuts articles={knowledgeData} />
      </div>
    </div>
  );
}
