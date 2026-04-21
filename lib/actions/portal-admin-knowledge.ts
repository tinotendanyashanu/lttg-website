'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';
import { KnowledgeCategory } from '@/models/KnowledgeCategory';
import { ActivityLog } from '@/models/ActivityLog';
import { revalidatePath } from 'next/cache';

async function validateAdmin() {
    const session = await getSessionWithDevBypass();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');
    return account;
}

export async function getAdminKnowledgeArticles() {
  await dbConnect();
  await validateAdmin();
  const articles = await KnowledgeArticle.find().sort({ updatedAt: -1 }).populate('categoryId').lean();
  return { success: true, articles: JSON.parse(JSON.stringify(articles)) };
}

export async function createAdminKnowledgeArticle(data: any) {
  await dbConnect();
  const account = await validateAdmin();

  // Handle migration fields
  if (data.isPublished !== undefined && !data.status) {
    data.status = data.isPublished ? 'published' : 'draft';
  }

  const article = await KnowledgeArticle.create({ ...data, createdBy: account.email });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_created',
    newValue: `Article created: ${article.title}`,
  });

  revalidatePath('/portal/knowledge-base');
  return { success: true, articleId: article._id.toString() };
}

export async function updateAdminKnowledgeArticle(articleId: string, data: any) {
  await dbConnect();
  const account = await validateAdmin();

  if (data.isPublished !== undefined && !data.status) {
    data.status = data.isPublished ? 'published' : 'draft';
  }

  const article = await KnowledgeArticle.findByIdAndUpdate(articleId, { $set: data }, { new: true });
  if (!article) throw new Error('Article not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_updated',
    newValue: `Article updated: ${article.title}`,
  });

  revalidatePath('/portal/knowledge-base');
  revalidatePath(`/portal/knowledge-base/${article.slug}`);
  return { success: true };
}

export async function deleteAdminKnowledgeArticle(articleId: string) {
  await dbConnect();
  const account = await validateAdmin();

  const article = await KnowledgeArticle.findByIdAndDelete(articleId);
  if (!article) throw new Error('Article not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_deleted',
    newValue: `Article deleted: ${article.title}`,
  });

  revalidatePath('/portal/knowledge-base');
  return { success: true };
}

// Category Actions
export async function createKnowledgeCategory(data: any) {
    await dbConnect();
    await validateAdmin();
    const category = await KnowledgeCategory.create(data);
    revalidatePath('/portal/knowledge-base');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
}

export async function updateKnowledgeCategory(id: string, data: any) {
    await dbConnect();
    await validateAdmin();
    await KnowledgeCategory.findByIdAndUpdate(id, data);
    revalidatePath('/portal/knowledge-base');
    return { success: true };
}

export async function deleteKnowledgeCategory(id: string) {
    await dbConnect();
    await validateAdmin();
    await KnowledgeCategory.findByIdAndDelete(id);
    revalidatePath('/portal/knowledge-base');
    return { success: true };
}
