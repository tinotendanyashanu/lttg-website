import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import Deal from '@/models/Deal';
import Payout from '@/models/Payout';
import AffiliateRiskFlag from '@/models/AffiliateRiskFlag';
import { updatePartnerStatus, deletePartner } from '@/lib/actions/admin';
import { getPartnerBalances, getPartnerLedger } from '@/lib/services/ledger';
import Link from 'next/link';
import RiskFlagsPanel from '@/components/admin/RiskFlagsPanel';
import TierControlPanel from '@/components/admin/TierControlPanel';
import { 
    ArrowLeft, 
    Mail, 
    Building, 
    Calendar, 
    CreditCard, 
    Award, 
    CheckCircle, 
    Shield,
    Trash2,
    Briefcase,
    DollarSign,
    Lock,
    Activity,
    ShieldAlert
} from 'lucide-react';
import AdminPasswordResetButton from '@/components/admin/AdminPasswordResetButton';
import { IDeal } from '@/models/Deal';
import { IPayout } from '@/models/Payout';
import { CURRENT_TERMS_VERSION } from '@/lib/constants';


async function getPartnerData(id: string) {
    await dbConnect();
    const partner = await Partner.findById(id).lean();
    if (!partner) return null;

    const ledgerBalances = await getPartnerBalances(partner._id.toString());
    partner.stats = {
        ...partner.stats,
        ...ledgerBalances
    };

    const deals = await Deal.find({ partnerId: id }).sort({ createdAt: -1 }).lean();
    const payouts = await Payout.find({ partnerId: id }).sort({ createdAt: -1 }).lean();
    const ledger = await getPartnerLedger(id);
    const riskFlags = await AffiliateRiskFlag.find({ partnerId: id }).sort({ createdAt: -1 }).lean();

    return { partner, deals, payouts, ledger, riskFlags };
}

export default async function AdminPartnerDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const data = await getPartnerData(params.id);

    if (!data) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Partner Not Found</h2>
                <Link href="/admin/partners" className="text-purple-600 hover:text-purple-700 font-medium mt-4 inline-block">
                    &larr; Return to Partners List
                </Link>
            </div>
        );
    }

    const { partner, deals, payouts, ledger, riskFlags } = data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedFlags = JSON.parse(JSON.stringify(riskFlags)).map((f: any) => ({
        _id: f._id.toString(),
        type: f.type,
        severity: f.severity,
        message: f.message,
        resolved: f.resolved,
        resolvedAt: f.resolvedAt,
        resolutionNotes: f.resolutionNotes,
        createdAt: f.createdAt,
    }));

    const unresolvedHighFlags = serializedFlags.filter((f: { severity: string; resolved: boolean }) => !f.resolved && f.severity === 'high');

    // Prepare table data for deals (reusing DataTable logic pattern if expanding, but keeping simple tables for now or upgrading?)
    // Let's keep simple tables for "Recent" sections but styled better.

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <Link href="/admin/partners" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Partners
            </Link>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/20">
                            {partner.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-slate-900">{partner.name}</h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${partner.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                                      partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                      'bg-amber-100 text-amber-800'}`}>
                                    {partner.status}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm">
                                <span className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {partner.email}
                                </span>
                                {partner.companyName && (
                                    <span className="flex items-center">
                                        <Building className="h-4 w-4 mr-2" />
                                        {partner.companyName}
                                    </span>
                                )}
                                 <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Joined {new Date(partner.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded">
                                    <Award className="h-4 w-4 mr-1.5" />
                                    {partner.tier} Tier
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="flex flex-wrap items-start justify-end gap-2">
                        {partner.status === 'pending' && (
                            <form action={updatePartnerStatus.bind(null, partner._id.toString(), 'active', partner.tier)}>
                                <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm shadow-emerald-500/20">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </button>
                            </form>
                        )}
                        {partner.status === 'active' && (
                            <form action={updatePartnerStatus.bind(null, partner._id.toString(), 'suspended', partner.tier)}>
                                <button className="flex items-center px-4 py-2 bg-white text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Suspend
                                </button>
                            </form>
                        )}
                        {partner.status === 'suspended' && (
                            <form action={updatePartnerStatus.bind(null, partner._id.toString(), 'active', partner.tier)}>
                               <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Reactivate
                                </button>
                            </form>
                        )}
                        
                         <form action={deletePartner.bind(null, partner._id.toString())}>
                            <button className="flex items-center px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Bank Info */}
                <div className="space-y-8">
                    {/* Security Card [NEW] */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                            <Lock className="h-5 w-5 mr-2 text-slate-400" />
                            Security & Access
                        </h3>
                        <p className="text-sm text-slate-500 mb-3">
                            Manage access credentials for this partner.
                        </p>
                        <AdminPasswordResetButton partnerId={partner._id.toString()} />
                    </div>

                    {/* Legal Compliance Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                            Legal Compliance
                        </h3>
                        {partner.termsAccepted ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Terms Version</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="font-medium text-slate-900">{partner.termsVersion || 'N/A'}</p>
                                        {partner.termsVersion === CURRENT_TERMS_VERSION ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                ✅ Current
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                ⚠️ Outdated
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accepted At</p>
                                    <p className="font-medium text-slate-900 mt-1">
                                        {partner.termsAcceptedAt
                                            ? new Date(partner.termsAcceptedAt).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Acceptance IP</p>
                                    <p className="font-mono text-sm text-slate-900 mt-1">{partner.termsAcceptedIp || 'N/A'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-red-50 rounded-xl border-2 border-dashed border-red-200">
                                <Shield className="h-8 w-8 mx-auto text-red-300 mb-2" />
                                <p className="text-sm text-red-600 font-medium">Terms not yet accepted</p>
                                <p className="text-xs text-red-400 mt-1">Partner cannot operate until agreement is accepted.</p>
                            </div>
                        )}
                    </div>

                    {/* Tier Governance */}
                    <TierControlPanel
                        partnerId={partner._id.toString()}
                        currentTier={partner.tier as 'referral' | 'agency' | 'enterprise' | 'creator'}
                        tierOverride={partner.tierOverride ?? false}
                        tierLocked={partner.tierLocked ?? false}
                        tierOverrideReason={partner.tierOverrideReason}
                        tierLastChangedAt={partner.tierLastChangedAt ? new Date(partner.tierLastChangedAt).toISOString() : undefined}
                        tierLastChangedBy={partner.tierLastChangedBy}
                    />

                    {/* Financial Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                            Financial Overview
                        </h3>
                        <div className="space-y-4">
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats?.totalReferredRevenue || 0)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-1">Paid Earnings</p>
                                    <p className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats?.paidCommission || 0)}</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold mb-1">Pending</p>
                                    <p className="text-lg font-bold text-amber-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(partner.stats?.pendingCommission || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                            Bank Details
                        </h3>
                        {partner.bankDetails?.accountName ? (
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase">Bank Name</p>
                                    <p className="font-medium text-slate-900">{partner.bankDetails.bankName}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase">Account Holder</p>
                                    <p className="font-medium text-slate-900">{partner.bankDetails.accountName}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase">Account Number</p>
                                    <p className="font-font-mono text-slate-900 tracking-wide">{partner.bankDetails.accountNumber}</p>
                                </div>
                                {(partner.bankDetails.sortCode || partner.bankDetails.iban) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {partner.bankDetails.sortCode && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-400 uppercase">Sort Code</p>
                                                <p className="font-mono text-slate-900">{partner.bankDetails.sortCode}</p>
                                            </div>
                                        )}
                                        {partner.bankDetails.iban && (
                                            <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                                                 <p className="text-xs text-slate-400 uppercase">IBAN</p>
                                                 <p className="font-mono text-slate-900 break-all text-xs">{partner.bankDetails.iban}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <CreditCard className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">No bank details added yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Activity Feeds */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Deals Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Briefcase className="h-5 w-5 mr-3 text-purple-600" />
                                Recent Deals
                            </h3>
                            <Link href={`/admin/deals?q=${partner.email}`} className="text-sm text-purple-600 font-medium hover:text-purple-700">
                                View Full History &rarr;
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Valuation</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {deals.length > 0 ? (
                                        deals.slice(0, 5).map((deal: IDeal) => (
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            <tr key={(deal._id as any).toString()} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <Link href={`/admin/deals/${deal._id}`} className="hover:text-purple-600 transition-colors group flex items-center">
                                                        {deal.clientName}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.estimatedValue)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                        ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                                                          deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-800' :
                                                          'bg-amber-100 text-amber-800'}`}>
                                                        {deal.dealStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                <Briefcase className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                                                No deals registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payouts Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                             <h3 className="font-bold text-slate-900 flex items-center">
                                <CreditCard className="h-5 w-5 mr-3 text-emerald-600" />
                                Payout History
                            </h3>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Reference</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.length > 0 ? (
                                        payouts.slice(0, 5).map((payout: IPayout) => (
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            <tr key={(payout._id as any).toString()} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-slate-50 rounded px-2 w-fit">{payout.reference || 'N/A'}</td>
                                                <td className="px-6 py-4 font-bold text-emerald-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payout.amount)}</td>
                                                <td className="px-6 py-4">
                                                     <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                        ${payout.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                                                          'bg-red-100 text-red-800'}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400">{new Date(payout.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                             <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                <DollarSign className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                                                No payouts yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Ledger Activity Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
                         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                             <h3 className="font-bold text-slate-900 flex items-center">
                                <Activity className="h-5 w-5 mr-3 text-indigo-600" />
                                Ledger Activity
                            </h3>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 flex-1">Context</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ledger.length > 0 ? (
                                        ledger.map((entry: any) => {
                                            const isAddition = ['commission_earned', 'commission_approved', 'academy_bonus', 'adjustment'].includes(entry.type);
                                            const isSubtraction = ['commission_paid', 'refund'].includes(entry.type);
                                            return (
                                                <tr key={entry._id.toString()} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 font-mono text-xs uppercase text-slate-700 bg-slate-50 rounded px-3 w-fit">
                                                        {entry.type.replace('_', ' ')}
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold ${isAddition ? 'text-emerald-700' : isSubtraction ? 'text-amber-700' : 'text-slate-700'}`}>
                                                        {isSubtraction ? '-' : '+'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                                                        {entry.relatedDealId ? (
                                                            <span>Deal: {entry.relatedDealId.clientName || entry.relatedDealId._id?.toString() || 'Unknown'}</span>
                                                        ) : entry.batchId ? (
                                                            <span>Batch: {entry.batchId.payoutMonth || entry.batchId._id?.toString()}</span>
                                                        ) : (
                                                            <span>N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-400">
                                                        {new Date(entry.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                             <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                <Activity className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                                                No ledger activity yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                
                    {/* Risk Flags Section */}
                    {serializedFlags.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldAlert className="h-5 w-5 text-amber-500" />
                                <h3 className="font-bold text-slate-900">Risk Flags</h3>
                                {unresolvedHighFlags.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                        {unresolvedHighFlags.length} unresolved high
                                    </span>
                                )}
                            </div>
                            <RiskFlagsPanel flags={serializedFlags} title="Partner Risk Flags" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
