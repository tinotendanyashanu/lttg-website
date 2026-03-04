import React from 'react';
import { 
  getIdentitySnapshot,
  getPersonalPerformanceMetrics,
  getPersonalActiveCases,
  getPersonalRecentActivity,
  getInternEmployeeCommissionSnapshot,
  getKnowledgeShortcuts
} from '@/lib/actions/dashboard';
import IdentitySnapshot from './widgets/IdentitySnapshot';
import PersonalPerformance from './widgets/PersonalPerformance';
import PersonalActiveCases from './widgets/PersonalActiveCases';
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
    activeCasesData,
    recentActivityData,
    knowledgeData,
    commissionData
  ] = await Promise.all([
    getIdentitySnapshot(email),
    getPersonalPerformanceMetrics(accountId, roles),
    getPersonalActiveCases(accountId, roles),
    getPersonalRecentActivity(accountId, roles),
    getKnowledgeShortcuts(),
    getInternEmployeeCommissionSnapshot(accountId, roles)
  ]);

  if (!identityData) return <div>Failed to load profile.</div>;

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
      
      {/* 1. Identity Snapshot */}
      <IdentitySnapshot 
        fullName={identityData.fullName}
        roles={identityData.roles}
        teamId={identityData.teamId}
        profileImageUrl={identityData.profileImageUrl}
        isActive={identityData.isActive}
      />

      {/* 2. Personal Performance Summary */}
      <PersonalPerformance metrics={performanceData} isIntern={isIntern} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Active Cases */}
        <PersonalActiveCases cases={activeCasesData} />
        
        {/* 4. Recent Activity */}
        <RecentActivityFeed activities={recentActivityData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Commission Snapshot */}
        <div className="flex flex-col h-full">
          <InternCommissionSnapshot metrics={commissionData} title={isIntern ? "Intern Commission" : "Employee Commission"} />
        </div>
        
        {/* 6. Knowledge Shortcuts */}
        <KnowledgeShortcuts articles={knowledgeData} />
      </div>
    </div>
  );
}
