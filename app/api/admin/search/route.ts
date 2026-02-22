import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';

export async function GET(request: Request) {
    try {
        const session = await auth();
        
        if (!session?.user || session.user.role !== 'admin') {
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
        const [partners, deals, payouts] = await Promise.all([
            Partner.find({
                role: 'partner',
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { company: searchRegex }
                ]
            }).select('_id name email company status').limit(5).lean(),
            
            Deal.find({
                $or: [
                    { clientName: searchRegex },
                    { companyName: searchRegex },
                    { projectDescription: searchRegex }
                ]
            }).select('_id partnerId clientName companyName dealValue dealStatus').limit(5).lean(),

            Payout.find({
                $or: [
                    { reference: searchRegex },
                    { bankDetails: searchRegex }
                ]
            }).select('_id partnerId amount status reference').limit(5).lean()
        ]);

        // Format and combine results
        const combinedResults = [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...partners.map((p: any) => ({
                id: p._id.toString(),
                type: 'partner',
                title: p.name,
                subtitle: p.email,
                url: `/admin/partners/${p._id.toString()}`
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...deals.map((d: any) => ({
                id: d._id.toString(),
                type: 'deal',
                title: `${d.clientName} (${d.companyName || 'No Company'})`,
                subtitle: `Value: $${d.dealValue} - Status: ${d.dealStatus}`,
                url: `/admin/deals/${d._id.toString()}`
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...payouts.map((p: any) => ({
                id: p._id.toString(),
                type: 'payout',
                title: p.reference || 'Payout',
                subtitle: `Amount: $${p.amount} - Status: ${p.status}`,
                url: `/admin/payouts/${p._id.toString()}` // Assuming such a route exists, else we might not link directly to a payout detail depending on existing structure.
            }))
        ];

        return NextResponse.json({ results: combinedResults });

    } catch (error) {
        console.error('Admin Search Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
