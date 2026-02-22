/**
 * seed-dashboard-course.ts
 * Run: npx tsx --env-file=.env.local scripts/seed-dashboard-course.ts
 *
 * Upserts the "How to Use Your Partner Dashboard" course as the first course
 * (sortOrder: 0) and ensures existing courses have sortOrder set.
 */

import mongoose from 'mongoose';
import { courses } from '../lib/data/academy-content';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // Dynamically import the model after connection
  const CourseModel = mongoose.models.Course || (await import('../models/Course')).default;

  let upserted = 0;
  let skipped = 0;

  for (const course of courses) {
    const sortOrder = (course as any).sortOrder ?? 99;

    const result = await (CourseModel as any).findOneAndUpdate(
      { slug: course.slug },
      {
        $set: {
          ...course,
          sortOrder,
          published: true,
        },
      },
      { upsert: true, new: true }
    );

    if (result) {
      console.log(`✅ Upserted: "${course.title}" (sortOrder: ${sortOrder})`);
      upserted++;
    } else {
      console.log(`⚠️  Skipped: "${course.title}"`);
      skipped++;
    }
  }

  console.log(`\nDone. ${upserted} upserted, ${skipped} skipped.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
