import React from 'react';
import { 
  getIdentitySnapshot,
  getAdminPerformanceMetrics,
  getAdminActiveCases,
  getAdminRecentActivity,
  getKnowledgeShortcuts
} from '@/lib/actions/dashboard';
import IdentitySnapshot from './widgets/IdentitySnapshot';
import AdminPerformanceOverview from './widgets/AdminPerformanceOverview';
import AdminActiveCases from './widgets/AdminActiveCases';
import RecentActivityFeed from './widgets/RecentActivityFeed';
import KnowledgeShortcuts from './widgets/KnowledgeShortcuts';
import AdminQuickActions from './widgets/AdminQuickActions';

interface AdminDashboardProps {
  email: string;
}

export default async function AdminDashboard({ email }: AdminDashboardProps) {
  // Fetch all admin data in parallel
  const [
    identityData,
    performanceData,
    activeCasesData,
    recentActivityData,
    knowledgeData
  ] = await Promise.all([
    getIdentitySnapshot(email),
    getAdminPerformanceMetrics(),
    getAdminActiveCases(),
    getAdminRecentActivity(),
    getKnowledgeShortcuts()
  ]);

  if (!identityData) return <div>Failed to load profile.</div>;

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      {/* 1. Identity Snapshot */}
      <IdentitySnapshot 
        fullName={identityData.fullName}
        roles={identityData.roles}
        teamId={identityData.teamId}
        profileImageUrl={identityData.profileImageUrl}
        isActive={identityData.isActive}
      />

      {/* 2. Global Performance Overview */}
      <AdminPerformanceOverview metrics={performanceData} />

      {/* 3. Global Active Cases & Quick Actions */}
      <AdminActiveCases cases={activeCasesData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 4. Global Recent Activity */}
          <RecentActivityFeed activities={recentActivityData} />
        </div>
        <div className="flex flex-col gap-6">
          {/* 5. Quick Actions */}
          <AdminQuickActions />
          {/* 6. Knowledge Shortcuts */}
          <KnowledgeShortcuts articles={knowledgeData} />
        </div>
      </div>
    </div>
  );
}
