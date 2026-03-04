'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';
import { ActivityLog } from '@/models/ActivityLog';

export async function getAdminKnowledgeArticles() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const articles = await KnowledgeArticle.find().sort({ updatedAt: -1 }).lean();

  return { success: true, articles: JSON.parse(JSON.stringify(articles)) };
}

export async function createAdminKnowledgeArticle(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const article = await KnowledgeArticle.create({ ...data, authorId: account._id });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_created',
    newValue: `Article created: ${article.title}`,
  });

  return { success: true, articleId: article._id.toString() };
}

export async function updateAdminKnowledgeArticle(articleId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const article = await KnowledgeArticle.findByIdAndUpdate(articleId, { $set: data }, { new: true });
  if (!article) throw new Error('Article not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_updated',
    newValue: `Article updated: ${article.title}`,
  });

  return { success: true };
}

export async function deleteAdminKnowledgeArticle(articleId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const article = await KnowledgeArticle.findByIdAndDelete(articleId);
  if (!article) throw new Error('Article not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'knowledge_article_deleted',
    newValue: `Article deleted: ${article.title}`,
  });

  return { success: true };
}
