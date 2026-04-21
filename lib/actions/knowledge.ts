'use server';

import dbConnect from '../mongodb';
import { KnowledgeArticle, IKnowledgeArticle } from '../../models/KnowledgeArticle';
import { KnowledgeCategory } from '../../models/KnowledgeCategory';
import { KnowledgeArticleVersion } from '../../models/KnowledgeArticleVersion';
import { KnowledgeArticleFeedback } from '../../models/KnowledgeArticleFeedback';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export async function getKnowledgeCategories() {
  try {
    await dbConnect();
    const categories = await KnowledgeCategory.find().sort({ order: 1 }).lean();
    return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllArticlesShort() {
    try {
      await dbConnect();
      const articles = await KnowledgeArticle.find()
        .select('title slug categoryId type')
        .sort({ title: 1 })
        .lean();
      return { success: true, articles: JSON.parse(JSON.stringify(articles)) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

export async function createArticle(data: Partial<IKnowledgeArticle>) {
  try {
    await dbConnect();
    
    if (!data.status) {
        data.status = data.isPublished ? 'published' : 'draft';
    }

    const article = new KnowledgeArticle(data);
    await article.save();

    // Create initial version
    await KnowledgeArticleVersion.create({
        articleId: article._id,
        content: article.content,
        title: article.title,
        authorId: data.createdBy || 'unknown',
        versionNumber: 1,
        changeSummary: 'Initial creation'
    });

    if (data.relatedArticles && data.relatedArticles.length > 0) {
        await KnowledgeArticle.updateMany(
            { _id: { $in: data.relatedArticles } },
            { $addToSet: { backlinks: article._id } }
        );
    }
    
    revalidatePath('/portal/knowledge-base');
    return { success: true, articleId: article._id.toString() };
  } catch (error: any) {
    console.error('Failed to create article:', error);
    return { success: false, error: error.message };
  }
}

export async function updateArticle(id: string, data: Partial<IKnowledgeArticle>) {
  try {
    await dbConnect();

    const oldArticle = await KnowledgeArticle.findById(id);
    if (!oldArticle) return { success: false, error: 'Article not found' };

    // 1. Save Current Version Snapshot
    await KnowledgeArticleVersion.create({
        articleId: id,
        content: oldArticle.content,
        title: oldArticle.title,
        authorId: data.lastEditedBy || oldArticle.createdBy,
        versionNumber: oldArticle.version,
        changeSummary: (data as any).changeSummary || 'Article updated'
    });

    // 2. Perform Update
    if (data.isPublished !== undefined && !data.status) {
        data.status = data.isPublished ? 'published' : 'draft';
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(
        id,
        { ...data, $inc: { version: 1 } },
        { new: true }
    );
    
    if (!article) return { success: false, error: 'Article not found' };

    // 3. Handle Backlinks
    if (data.relatedArticles) {
        const oldRelated = oldArticle.relatedArticles.map(r => r.toString());
        const newRelated = data.relatedArticles.map(r => r.toString());

        const added = newRelated.filter(r => !oldRelated.includes(r));
        const removed = oldRelated.filter(r => !newRelated.includes(r));

        if (added.length > 0) {
            await KnowledgeArticle.updateMany(
                { _id: { $in: added } },
                { $addToSet: { backlinks: id } }
            );
        }

        if (removed.length > 0) {
            await KnowledgeArticle.updateMany(
                { _id: { $in: removed } },
                { $pull: { backlinks: id } }
            );
        }
    }

    revalidatePath('/portal/knowledge-base');
    revalidatePath(`/portal/knowledge-base/${article.slug}`);
    
    return { success: true, article: JSON.parse(JSON.stringify(article)) };
  } catch (error: any) {
    console.error('Failed to update article:', error);
    return { success: false, error: error.message };
  }
}

export async function submitArticleFeedback(articleId: string, userEmail: string, isHelpful: boolean, comment?: string) {
    try {
        await dbConnect();
        await KnowledgeArticleFeedback.create({
            articleId,
            userEmail,
            isHelpful,
            comment
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getArticleHistory(articleId: string) {
    try {
        await dbConnect();
        const history = await KnowledgeArticleVersion.find({ articleId })
            .sort({ versionNumber: -1 })
            .lean();
        return { success: true, history: JSON.parse(JSON.stringify(history)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getArticleBySlug(slug: string, role: string) {
    try {
        await dbConnect();
        
        const article = await KnowledgeArticle.findOne({ slug })
            .populate('categoryId')
            .populate('relatedArticles', 'title slug categoryId type')
            .populate('backlinks', 'title slug categoryId type');

        if (!article) return { success: false, error: 'Article not found' };

        const isAuthorized = article.roleVisibility.includes('all' as any) || article.roleVisibility.includes(role as any) || role === 'admin';
        
        if (!isAuthorized) {
            return { success: false, error: 'Unauthorized view attempt' };
        }

        article.viewCount += 1;
        await article.save();

        return { success: true, article: JSON.parse(JSON.stringify(article)) };
    } catch (error: any) {
        console.error('Failed to fetch article:', error);
        return { success: false, error: error.message };
    }
}

export async function searchKnowledgeBase(query: string, categoryId: string, role: string) {
    try {
        await dbConnect();

        const matchStage: any = {
            status: 'published',
            $or: [
                { roleVisibility: 'all' as any },
                { roleVisibility: role as any }
            ]
        };

        if (role === 'admin') {
            delete matchStage.$or;
            matchStage.status = { $in: ['published', 'draft', 'archived'] };
        }

        if (categoryId && categoryId !== 'All') {
            if (mongoose.Types.ObjectId.isValid(categoryId)) {
                matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
            } else {
                matchStage.category = categoryId;
            }
        }

        const pipeline: any[] = [];

        if (query) {
            matchStage.$text = { $search: query };
            pipeline.push({ $match: matchStage });
            pipeline.push({ $sort: { score: { $meta: "textScore" } } });
        } else {
             pipeline.push({ $match: matchStage });
             pipeline.push({ $sort: { createdAt: -1 } });
        }

        const articles = await KnowledgeArticle.aggregate(pipeline);

        return { success: true, articles: JSON.parse(JSON.stringify(articles)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getKnowledgeAnalytics() {
     try {
        await dbConnect();
        
        const mostViewed = await KnowledgeArticle.find({ status: 'published' })
            .select('title slug viewCount categoryId')
            .sort({ viewCount: -1 })
            .limit(10)
            .populate('categoryId', 'name')
            .lean();

        // Aggregate feedback
        const feedbackStats = await KnowledgeArticleFeedback.aggregate([
            {
                $group: {
                    _id: '$articleId',
                    helpfulCount: { $sum: { $cond: ['$isHelpful', 1, 0] } },
                    unhelpfulCount: { $sum: { $cond: ['$isHelpful', 0, 1] } }
                }
            },
            { $sort: { unhelpfulCount: -1 } },
            { $limit: 10 }
        ]);
            
        return { 
            success: true, 
            data: { 
                mostViewed: JSON.parse(JSON.stringify(mostViewed)),
                feedbackStats: JSON.parse(JSON.stringify(feedbackStats))
            } 
        };
     } catch (error: any) {
        console.error('Failed to get analytics:', error);
        return { success: false, error: error.message };
     }
}
