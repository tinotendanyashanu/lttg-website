import AdminPageBanner from '@/components/admin/AdminPageBanner';
import KnowledgeManagerClient from '@/app/portal/employee/admin/knowledge/KnowledgeManagerClient';
import { getAdminKnowledgeArticles } from '@/lib/actions/portal-admin-knowledge';

export const metadata = { title: 'Knowledge Base | Admin' };

export default async function AdminKnowledgePage() {
  let articles: any[] = [];

  try {
    const response = await getAdminKnowledgeArticles();
    articles = response?.articles ?? [];
  } catch {
    articles = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageBanner
        icon="menu_book"
        title="Knowledge Base"
        description="Create, edit, and organize knowledge base articles by role and category."
      />
      <KnowledgeManagerClient initialArticles={articles} />
    </div>
  );
}
