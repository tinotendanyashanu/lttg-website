import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import { Account } from '@/models/Account';
import { KnowledgeArticle } from '@/models/KnowledgeArticle';

export async function GET(request: Request) {
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        await dbConnect();

        // Create a case-insensitive regex for the search query
        const searchRegex = new RegExp(query, 'i');

        // Parallel search queries limiting to 5 results per type to keep things fast
        const [cases, accounts, articles] = await Promise.all([
            Case.find({
                $or: [
                    { businessName: searchRegex },
                    { contactName: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id businessName contactName email status').limit(5).lean(),
            
            Account.find({
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id fullName email roles').limit(5).lean(),

            KnowledgeArticle.find({
                isPublished: true,
                $or: [
                    { title: searchRegex },
                    { category: searchRegex },
                    { tags: searchRegex }
                ]
            }).select('_id title slug category').limit(5).lean()
        ]);

        // Format and combine results
        const combinedResults = [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...cases.map((c: any) => ({
                id: c._id.toString(),
                type: 'case',
                title: c.businessName || c.contactName || 'Unnamed Case',
                subtitle: `Status: ${c.status}`,
                url: `/portal/employee/case-management/${c._id.toString()}`
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...accounts.map((a: any) => ({
                id: a._id.toString(),
                type: 'account',
                title: a.fullName,
                subtitle: `Role: ${a.roles ? a.roles.join(', ') : 'User'}`,
                url: a.roles?.includes('admin') ? `/portal/employee/admin/users` : `/portal/employee/team`
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...articles.map((art: any) => ({
                id: art._id.toString(),
                type: 'article',
                title: art.title,
                subtitle: `Category: ${art.category}`,
                url: `/portal/employee/knowledge-base/${art.slug}`
            }))
        ];

        return NextResponse.json({ results: combinedResults });

    } catch (error) {
        console.error('Universal Search Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
