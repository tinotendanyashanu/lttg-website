import dbConnect from '../lib/mongodb';
import { KnowledgeArticle } from '../models/KnowledgeArticle';
import { KnowledgeCategory } from '../models/KnowledgeCategory';
import mongoose from 'mongoose';

async function migrate() {
  await dbConnect();
  console.log('Connected to database for migration...');

  // 1. Ensure a "General" category exists
  let generalCategory = await KnowledgeCategory.findOne({ slug: 'general' });
  if (!generalCategory) {
    generalCategory = await KnowledgeCategory.create({
      name: 'General',
      slug: 'general',
      description: 'Default category for existing articles',
      order: 0
    });
    console.log('Created "General" category.');
  }

  // 2. Fetch all articles
  const articles = await KnowledgeArticle.find({});
  console.log(`Found ${articles.length} articles to migrate.`);

  for (const article of articles) {
    const updates: any = {};

    // Map isPublished to status
    if (!article.status) {
      updates.status = article.isPublished ? 'published' : 'draft';
    }

    // Map existing string category to KnowledgeCategory if categoryId is missing
    if (!article.categoryId) {
      // Try to find or create a category with the same name as the string 'category'
      let category = await KnowledgeCategory.findOne({ 
        slug: article.category.toLowerCase().replace(/ /g, '-') 
      });
      
      if (!category) {
        category = await KnowledgeCategory.create({
          name: article.category,
          slug: article.category.toLowerCase().replace(/ /g, '-'),
          parent: generalCategory._id,
          order: 10
        });
      }
      updates.categoryId = category._id;
    }

    // Initialize new arrays if they don't exist
    if (!article.attachments) updates.attachments = [];
    if (!article.relatedArticles) updates.relatedArticles = [];
    if (!article.backlinks) updates.backlinks = [];

    if (Object.keys(updates).length > 0) {
      await KnowledgeArticle.findByIdAndUpdate(article._id, { $set: updates });
      console.log(`Migrated article: ${article.title}`);
    }
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
