import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import AffiliateRiskFlag from '@/models/AffiliateRiskFlag';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check for pending partners
        const pendingPartnersCount = await Partner.countDocuments({ status: 'pending', role: 'partner' });
        
        // Check for registered deals
        const registeredDealsCount = await Deal.countDocuments({ dealStatus: 'registered' });
        
        // Check for unresolved risk flags
        let riskFlagsCount = 0;
        try {
            riskFlagsCount = await AffiliateRiskFlag.countDocuments({ status: 'open' });
        } catch {
            // Model might not be loaded or collection might not exist yet, safe fallback
            riskFlagsCount = 0;
        }

        const notifications = [];

        if (pendingPartnersCount > 0) {
            notifications.push({
                id: 'pending-partners',
                type: 'partner',
                title: 'Pending Partners',
                message: `You have ${pendingPartnersCount} partner(s) waiting for approval.`,
                url: '/admin/partners',
                count: pendingPartnersCount
            });
        }

        if (registeredDealsCount > 0) {
            notifications.push({
                id: 'registered-deals',
                type: 'deal',
                title: 'New Deals Registered',
                message: `There are ${registeredDealsCount} unregistered deal(s) needing review.`,
                url: '/admin/deals',
                count: registeredDealsCount
            });
        }

        if (riskFlagsCount > 0) {
            notifications.push({
                id: 'risk-flags',
                type: 'risk',
                title: 'Active Risk Flags',
                message: `${riskFlagsCount} active risk flags require attention.`,
                url: '/admin/audit', // Or wherever risk flags are shown
                count: riskFlagsCount
            });
        }

        return NextResponse.json({ 
            notifications,
            totalCount: pendingPartnersCount + registeredDealsCount + riskFlagsCount
        });

    } catch (error) {
        console.error('Admin Notifications Error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
