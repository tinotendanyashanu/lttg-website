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

        const { Account } = await import('@/models/Account');
        const { Case } = await import('@/models/Case');
        const { ClientInvoice } = await import('@/models/ClientInvoice');

        const searchRegex = new RegExp(query, 'i');

        const [partners, deals, payouts, clients, cases, invoices] = await Promise.all([
            Partner.find({
                role: 'partner',
                $or: [{ name: searchRegex }, { email: searchRegex }, { company: searchRegex }],
            }).select('_id name email company status').limit(4).lean(),

            Deal.find({
                $or: [{ clientName: searchRegex }, { companyName: searchRegex }, { projectDescription: searchRegex }],
            }).select('_id clientName companyName dealValue dealStatus').limit(3).lean(),

            Payout.find({
                $or: [{ reference: searchRegex }, { bankDetails: searchRegex }],
            }).select('_id amount status reference').limit(3).lean(),

            // Clients
            Account.find({
                roles: 'client',
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex },
                    { 'clientProfile.companyName': searchRegex },
                    { 'clientProfile.phone': searchRegex },
                ],
            }).select('_id fullName email clientProfile').limit(5).lean(),

            // Cases
            Case.find({
                $or: [
                    { businessName: searchRegex },
                    { contactName: searchRegex },
                    { email: searchRegex },
                    { caseId: searchRegex },
                ],
            }).select('_id caseId businessName contactName status').limit(5).lean(),

            // Invoices
            ClientInvoice.find({
                $or: [{ invoiceNumber: searchRegex }, { description: searchRegex }],
            }).select('_id invoiceNumber amount currency status clientId').limit(5).lean(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const combinedResults = [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...clients.map((c: any) => ({
                id: c._id.toString(),
                type: 'client',
                title: c.fullName || c.email,
                subtitle: `${c.email}${c.clientProfile?.companyName ? ' · ' + c.clientProfile.companyName : ''}`,
                url: `/admin/clients`,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...cases.map((c: any) => ({
                id: c._id.toString(),
                type: 'case',
                title: c.businessName || c.contactName || 'Unnamed Case',
                subtitle: `${c.caseId || ''}${c.status ? ' · ' + c.status : ''}`,
                url: `/admin/cases`,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...invoices.map((inv: any) => ({
                id: inv._id.toString(),
                type: 'invoice',
                title: inv.invoiceNumber,
                subtitle: `${inv.currency || 'USD'} ${Number(inv.amount).toFixed(2)} · ${inv.status}`,
                url: `/admin/invoices/${inv._id.toString()}`,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...partners.map((p: any) => ({
                id: p._id.toString(),
                type: 'partner',
                title: p.name,
                subtitle: p.email,
                url: `/admin/partners/${p._id.toString()}`,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...deals.map((d: any) => ({
                id: d._id.toString(),
                type: 'deal',
                title: `${d.clientName} (${d.companyName || 'No Company'})`,
                subtitle: `Value: $${d.dealValue} · ${d.dealStatus}`,
                url: `/admin/deals/${d._id.toString()}`,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...payouts.map((p: any) => ({
                id: p._id.toString(),
                type: 'payout',
                title: p.reference || 'Payout',
                subtitle: `Amount: $${p.amount} · ${p.status}`,
                url: `/admin/payouts/${p._id.toString()}`,
            })),
        ];

        return NextResponse.json({ results: combinedResults });

    } catch (error) {
        console.error('Admin Search Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
