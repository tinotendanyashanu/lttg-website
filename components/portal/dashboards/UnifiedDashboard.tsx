import React from 'react';
import Link from 'next/link';
import { 
  getIdentitySnapshot,
  getPersonalPerformanceMetrics,
  getPersonalActiveCases,
  getPersonalRecentActivity,
  getInternEmployeeCommissionSnapshot,
  getKnowledgeShortcuts,
  getPriorityQueue
} from '@/lib/actions/dashboard';
import IdentitySnapshot from './widgets/IdentitySnapshot';
import PersonalPerformance from './widgets/PersonalPerformance';
import PriorityQueue from './widgets/PriorityQueue';
import RecentActivityFeed from './widgets/RecentActivityFeed';
import InternCommissionSnapshot from './widgets/InternCommissionSnapshot';
import KnowledgeShortcuts from './widgets/KnowledgeShortcuts';

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
    commissionData
  ] = await Promise.all([
    getIdentitySnapshot(email),
    getPersonalPerformanceMetrics(accountId, roles),
    getPriorityQueue(accountId),
    getPersonalRecentActivity(accountId, roles),
    getKnowledgeShortcuts(),
    getInternEmployeeCommissionSnapshot(accountId, roles)
  ]);

  if (!identityData) return <div>Failed to load profile.</div>;

  return (
    <div className="flex flex-col gap-8 h-full w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome back, {identityData.fullName.split(' ')[0]}! Here&apos;s your focus for today.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/portal/intern/submit-lead" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition hover:opacity-90 shadow-xl shadow-gray-900/10">
              <span className="material-icons-outlined text-[20px]">add_circle</span>
              New Case
           </Link>
        </div>
      </div>
      
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

      {/* 2. Priority Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <PriorityQueue tasks={priorityTasks} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityFeed activities={recentActivityData} />
        </div>
      </div>

      {/* 3. Commission & Knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <InternCommissionSnapshot metrics={commissionData} title={isIntern ? "Intern Commission" : "Employee Commission"} />
        </div>
        <div className="lg:col-span-3">
          <KnowledgeShortcuts articles={knowledgeData} />
        </div>
      </div>
    </div>
  );
}
