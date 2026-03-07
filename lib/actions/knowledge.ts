'use server';

import dbConnect from '../mongodb';
import { KnowledgeArticle, IKnowledgeArticle } from '../../models/KnowledgeArticle';
import { revalidatePath } from 'next/cache';

function parseSession(sessionData: any) {
    if (!sessionData) return null;
    return sessionData.user;
}

export async function createArticle(data: Partial<IKnowledgeArticle>) {
  try {
    await dbConnect();
    
    // In a real app we would check session here to ensure Admin role.
    // For now we assume the caller has validated the role.

    const article = new KnowledgeArticle(data);
    await article.save();
    
    revalidatePath('/portal/knowledge-base');
    return { success: true, article: JSON.parse(JSON.stringify(article)) };
  } catch (error: any) {
    console.error('Failed to create article:', error);
    return { success: false, error: error.message };
  }
}

export async function updateArticle(id: string, data: Partial<IKnowledgeArticle>) {
  try {
    await dbConnect();

    const article = await KnowledgeArticle.findByIdAndUpdate(
        id,
        { ...data, $inc: { version: 1 } },
        { new: true }
    );
    
    if (!article) return { success: false, error: 'Article not found' };

    revalidatePath('/portal/knowledge-base');
    revalidatePath(`/portal/knowledge-base/${article.slug}`);
    
    return { success: true, article: JSON.parse(JSON.stringify(article)) };
  } catch (error: any) {
    console.error('Failed to update article:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteArticle(id: string) {
  try {
    await dbConnect();
    await KnowledgeArticle.findByIdAndDelete(id);
    revalidatePath('/portal/knowledge-base');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete article:', error);
    return { success: false, error: error.message };
  }
}

export async function getArticleBySlug(slug: string, role: string) {
    try {
        await dbConnect();
        
        const article = await KnowledgeArticle.findOne({ slug });
        if (!article) return { success: false, error: 'Article not found' };

        // Check Role Visibility
        const isAuthorized = article.roleVisibility.includes('all' as any) || article.roleVisibility.includes(role as any) || role === 'admin';
        
        if (!isAuthorized) {
            return { success: false, error: 'Unauthorized view attempt' };
        }

        // Increment view count
        article.viewCount += 1;
        await article.save();

        return { success: true, article: JSON.parse(JSON.stringify(article)) };
    } catch (error: any) {
        console.error('Failed to fetch article:', error);
        return { success: false, error: error.message };
    }
}

export async function searchKnowledgeBase(query: string, category: string, role: string) {
    try {
        await dbConnect();

        let matchStage: any = {
            isPublished: true,
            $or: [
                { roleVisibility: 'all' as any },
                { roleVisibility: role as any }
            ]
        };

        if (role === 'admin') {
            // Admin sees all based on role, simplify the query condition if desired, 
            // but keeping it simple for dev
            delete matchStage.$or;
        }

        if (category && category !== 'All') {
            matchStage.category = category;
        }

        let pipeline: any[] = [];

        if (query) {
            // Text search requires $text operator
            matchStage.$text = { $search: query };
            pipeline.push({ $match: matchStage });
            // Sort by text search score
            pipeline.push({ $sort: { score: { $meta: "textScore" } } });
            
            // Log search term for analytics if query exists (Async, fire and forget - or save to DB here)
            // For MVP, just printing
            console.log(`[Analytics] Search logged: ${query}`);
        } else {
             // If no query, just sort by date
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
        
        // 1. Most viewed articles
        const mostViewed = await KnowledgeArticle.find({ isPublished: true })
            .select('title slug viewCount category')
            .sort({ viewCount: -1 })
            .limit(5)
            .lean();
            
        return { success: true, data: { mostViewed } };
     } catch (error: any) {
        console.error('Failed to get analytics:', error);
        return { success: false, error: error.message };
     }
}
