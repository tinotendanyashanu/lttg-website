import React from 'react';
import KnowledgeBaseOverview from '@/components/portal/knowledge-base/KnowledgeBaseOverview';
import { getSession } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { searchKnowledgeBase, getKnowledgeCategories } from '@/lib/actions/knowledge';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Knowledge Base | LeoTech Portal',
  description: 'Access company resources, guidelines, and documentation.',
};

export default async function KnowledgeBasePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account) {
    redirect('/auth/login');
  }

  // Determine user's highest role for visibility checks
  let userRole = 'employee'; 
  if (account.roles.includes('admin')) {
      userRole = 'admin';
  } else if (account.roles.includes('intern')) {
      userRole = 'intern';
  }

  const activeCategoryId = resolvedSearchParams.category || 'All';

  // Fetch initial articles and categories in parallel
  const [initialDataResult, categoriesResult] = await Promise.all([
    searchKnowledgeBase('', activeCategoryId, userRole),
    getKnowledgeCategories()
  ]);

  const initialArticles = initialDataResult.success ? initialDataResult.articles : [];
  const categories = categoriesResult.success ? categoriesResult.categories : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6">
      <KnowledgeBaseOverview 
        initialArticles={initialArticles} 
        categories={categories}
        userRole={userRole} 
        activeCategoryId={activeCategoryId}
      />
    </div>
  );
}
