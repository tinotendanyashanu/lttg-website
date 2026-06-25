'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';
import { KnowledgeCategory } from '@/models/KnowledgeCategory';
import { ActivityLog } from '@/models/ActivityLog';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

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
  try {
    await dbConnect();
    const account = await validateAdmin();

    // Handle migration/compatibility fields
    if (data.isPublished !== undefined && !data.status) {
      data.status = data.isPublished ? 'published' : 'draft';
    } else if (data.status) {
      data.isPublished = data.status === 'published';
    } else {
      data.status = 'published';
      data.isPublished = true;
    }

    // Ensure category (string) is set for compatibility
    if (!data.category && data.categoryId && mongoose.Types.ObjectId.isValid(data.categoryId)) {
      const category = await KnowledgeCategory.findById(data.categoryId);
      if (category) {
        data.category = category.name;
      } else {
        data.category = 'General';
      }
    } else if (!data.category) {
      data.category = 'General';
    }
    
    // Clean up categoryId if it's not a valid ObjectId (e.g. empty string)
    if (data.categoryId && !mongoose.Types.ObjectId.isValid(data.categoryId)) {
        delete data.categoryId;
    }

    const article = await KnowledgeArticle.create({ ...data, createdBy: account.email });
    generateArticleEmbedding(article._id, article).catch(() => {});

    await ActivityLog.create({
      actorAccountId: account._id,
      actionType: 'knowledge_article_created',
      newValue: `Article created: ${article.title}`,
    });

    revalidatePath('/portal/employee/knowledge-base');
    return { success: true, articleId: article._id.toString() };
  } catch (error: any) {
    console.error('Error creating knowledge article:', error);
    if (error.code === 11000) {
      return { success: false, error: 'An article with this slug already exists.' };
    }
    return { success: false, error: error.message || 'Failed to create article' };
  }
}

export async function updateAdminKnowledgeArticle(articleId: string, data: any) {
  try {
    await dbConnect();
    const account = await validateAdmin();

    // Handle migration/compatibility fields
    if (data.isPublished !== undefined && !data.status) {
      data.status = data.isPublished ? 'published' : 'draft';
    } else if (data.status) {
      data.isPublished = data.status === 'published';
    }

    // Ensure category (string) is set for compatibility if categoryId changed
    if (data.categoryId && mongoose.Types.ObjectId.isValid(data.categoryId)) {
      const category = await KnowledgeCategory.findById(data.categoryId);
      if (category) {
        data.category = category.name;
      }
    }
    
    // Clean up categoryId if it's not a valid ObjectId
    if (data.categoryId && !mongoose.Types.ObjectId.isValid(data.categoryId)) {
        delete data.categoryId;
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(articleId, { $set: data }, { new: true });
    if (!article) return { success: false, error: 'Article not found' };
    if (data.content !== undefined || data.title !== undefined || data.subtitle !== undefined || data.tags !== undefined) {
      generateArticleEmbedding(article._id, article).catch(() => {});
    }

    await ActivityLog.create({
      actorAccountId: account._id,
      actionType: 'knowledge_article_updated',
      newValue: `Article updated: ${article.title}`,
    });

    revalidatePath('/portal/employee/knowledge-base');
    revalidatePath(`/portal/employee/knowledge-base/${article.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating knowledge article:', error);
    if (error.code === 11000) {
      return { success: false, error: 'An article with this slug already exists.' };
    }
    return { success: false, error: error.message || 'Failed to update article' };
  }
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

  revalidatePath('/portal/employee/knowledge-base');
  return { success: true };
}

// Category Actions
export async function createKnowledgeCategory(data: any) {
    await dbConnect();
    await validateAdmin();
    const category = await KnowledgeCategory.create(data);
    revalidatePath('/portal/employee/knowledge-base');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
}

export async function updateKnowledgeCategory(id: string, data: any) {
    await dbConnect();
    await validateAdmin();
    await KnowledgeCategory.findByIdAndUpdate(id, data);
    revalidatePath('/portal/employee/knowledge-base');
    return { success: true };
}

export async function deleteKnowledgeCategory(id: string) {
    await dbConnect();
    await validateAdmin();
    await KnowledgeCategory.findByIdAndDelete(id);
    revalidatePath('/portal/employee/knowledge-base');
    return { success: true };
}


async function generateArticleEmbedding(articleId: any, article: any) {
  const { generateEmbedding, buildArticleText, EMBEDDING_MODEL } = await import("@/lib/rag");
  const text = buildArticleText({
    title: article.title,
    subtitle: article.subtitle,
    tags: article.tags,
    content: article.content,
  });
  if (!text) return;

  const embedding = await generateEmbedding(text);
  await KnowledgeArticle.findByIdAndUpdate(articleId, {
    embedding,
    embeddingUpdatedAt: new Date(),
    embeddingModel: EMBEDDING_MODEL,
  });
}
