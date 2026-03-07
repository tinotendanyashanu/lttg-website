import React from 'react';
import KnowledgeBaseOverview from '@/components/portal/knowledge-base/KnowledgeBaseOverview';
import { getSession } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { searchKnowledgeBase } from '@/lib/actions/knowledge';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Knowledge Base | LeoTech Portal',
  description: 'Access company resources, guidelines, and documentation.',
};

export default async function KnowledgeBasePage() {
  const session = await getSession();
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account) {
    redirect('/auth/login');
  }

  // Determine user's highest role for visibility checks
  let userRole = 'employee'; // default base role
  if (account.roles.includes('admin')) {
      userRole = 'admin';
  } else if (account.roles.includes('intern')) {
      userRole = 'intern';
  }

  // Fetch initial articles
  const initialDataResult = await searchKnowledgeBase('', 'All', userRole);
  const initialArticles = initialDataResult.success ? initialDataResult.articles : [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <div className="bg-white dark:bg-[#27272a] p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Base & Resource Center</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Find the answers you need, browse latest documentation, or contribute to our growing repository of knowledge.
        </p>
        <KnowledgeBaseOverview initialArticles={initialArticles} userRole={userRole} />
      </div>
    </div>
  );
}
