import React from 'react';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { redirect } from 'next/navigation';
import { getUserTeamInfo } from '@/lib/data/team';
import TeamView from '@/components/portal/team/TeamView';

export const metadata = {
  title: 'Team | LeoTech Portal',
  description: 'View your team and its members.',
};

export default async function TeamPage() {
  const session = await getSessionWithDevBypass();
  
  if (!session?.user?.email) {
    redirect('/');
  }

  const { team, teamMembers } = await getUserTeamInfo(session.user.email);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Team</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Collaborate and view your team members.
          </p>
        </div>
      </div>

      <TeamView team={team} teamMembers={teamMembers} />
    </div>
  );
}
