import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import DealModel from '@/models/Deal';
import PartnerModel from '@/models/Partner';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Search, Shield, Info, AlertTriangle, FileText, DollarSign, Calendar } from 'lucide-react';
import { Deal, Partner } from '@/types';
import { redirect } from 'next/navigation';

async function getDealDetails(userId: string, dealId: string) {
  await dbConnect();
  const partner = await PartnerModel.findById(userId).lean() as unknown as Partner;
  if (!partner) return null;

  const deal = await DealModel.findOne({ _id: dealId, partnerId: partner._id })
    .populate('payoutBatchId')
    .lean() as unknown as Deal;

  return deal;
}

export default async function DealDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/partner/login');
  }

  const { id } = await props.params;
  const deal = await getDealDetails(session.user.id, id);

  if (!deal) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Deal Not Found</h2>
        <p className="text-slate-500 mb-6">The deal you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/partner/dashboard/deals" className="text-emerald-600 font-bold hover:underline">
          &larr; Back to Deals
        </Link>
      </div>
    );
  }

  // Calculate approval/hold expiry date if applicable
  let expectedApprovalDate: Date | null = null;
  if (deal.paymentStatus === 'received' && deal.paymentReceivedAt && deal.commissionStatus === 'Pending') {
    expectedApprovalDate = new Date(deal.paymentReceivedAt);
    expectedApprovalDate.setDate(expectedApprovalDate.getDate() + 14);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/partner/dashboard/deals" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Deals
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">{deal.clientName}</h2>
          <p className="text-slate-500 flex items-center">
             <Calendar className="h-4 w-4 mr-2" />
             Registered on {new Date(deal.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold capitalize 
                ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                  deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-700' :
                  deal.dealStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'}`}>
                {deal.dealStatus.replace('_', ' ')}
            </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Deal Value and Commission Box */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:col-span-1">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financials</h3>
           <div className="space-y-6">
              <div>
                 <p className="text-sm text-slate-500 mb-1">Deal Value</p>
                 <p className="text-2xl font-bold text-slate-900">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.finalValue || deal.estimatedValue)}
                 </p>
              </div>
              <div>
                 <p className="text-sm text-slate-500 mb-1">Commission Rate</p>
                 <p className="text-lg font-bold text-slate-700">{(deal.commissionRate * 100).toFixed(0)}%</p>
              </div>
              <div className="pt-4 border-t border-slate-50">
                 <p className="text-sm font-bold text-emerald-700 mb-1">Commission Amount</p>
                 <p className="text-3xl font-bold text-emerald-600">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.commissionAmount || ((deal.finalValue || deal.estimatedValue) * deal.commissionRate))}
                 </p>
              </div>
           </div>
        </div>

        {/* Status Lifecycle Box */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:col-span-2">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Commission Lifecycle</span>
              {deal.commissionStatus === 'Paid' ? (
                 <span className="text-emerald-500 flex items-center font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                   <CheckCircle className="h-4 w-4 mr-1" /> Paid
                 </span>
              ) : (
                <span className="text-amber-500 flex items-center font-bold px-2 py-1 bg-amber-50 rounded-lg relative">
                  <Clock className="h-4 w-4 mr-1" /> {deal.commissionStatus}
                </span>
              )}
           </h3>

           <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 mt-6 space-y-8">
              {/* Step 1: Registration */}
              <div className="relative pl-6">
                 <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm" />
                 <h4 className="text-sm font-bold text-slate-900 mb-1">Deal Registered</h4>
                 <p className="text-xs text-slate-500">You successfully registered this opportunity on {new Date(deal.createdAt).toLocaleDateString()}.</p>
              </div>

              {/* Step 2: Client Payment */}
              <div className="relative pl-6">
                 <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm ${deal.paymentStatus === 'received' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                 <h4 className="text-sm font-bold text-slate-900 mb-1">Client Payment {deal.paymentStatus === 'received' ? 'Received' : 'Pending'}</h4>
                 {deal.paymentStatus === 'received' ? (
                   <p className="text-xs text-slate-500">The client has paid for the services on {deal.paymentReceivedAt ? new Date(deal.paymentReceivedAt).toLocaleDateString() : 'Unknown'}.</p>
                 ) : (
                   <p className="text-xs text-slate-500">Waiting for the client to close and pay the invoice.</p>
                 )}
              </div>

              {/* Step 3: Commission Approval / Hold */}
              <div className="relative pl-6">
                 <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm ${deal.commissionStatus === 'Approved' || deal.commissionStatus === 'Paid' ? 'bg-emerald-500' : (expectedApprovalDate ? 'bg-amber-400' : 'bg-slate-300')}`} />
                 <h4 className="text-sm font-bold text-slate-900 mb-1">Commission Approval</h4>
                 
                 {deal.commissionStatus === 'Approved' || deal.commissionStatus === 'Paid' ? (
                    <p className="text-xs text-emerald-600 font-medium">Commission was approved on {deal.approvalDate ? new Date(deal.approvalDate).toLocaleDateString() : 'Unknown'}. Added to your balance.</p>
                 ) : expectedApprovalDate ? (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
                       <p className="text-xs text-amber-800 font-medium flex items-center mb-1">
                         <Shield className="h-4 w-4 mr-1.5 shrink-0 text-amber-600" />
                         Standard 14-Day Hold Period
                       </p>
                       <p className="text-xs text-amber-700">Commission will be eligible for approval on <strong>{expectedApprovalDate.toLocaleDateString()}</strong>.</p>
                    </div>
                 ) : (
                    <p className="text-xs text-slate-500">Commission will be held for 14 days after client payment arrives.</p>
                 )}
              </div>
              
              {/* Step 4: Payout */}
              <div className="relative pl-6">
                 <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm ${deal.commissionStatus === 'Paid' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                 <h4 className="text-sm font-bold text-slate-900 mb-1">Payout</h4>
                 {deal.commissionStatus === 'Paid' ? (
                    <p className="text-xs text-emerald-600 font-medium whitespace-break-spaces">
                      Funds were sent securely.
                      {deal.payoutBatchId?.referenceNumber && `\nReference: ${deal.payoutBatchId.referenceNumber}`}
                    </p>
                 ) : deal.commissionStatus === 'Approved' ? (
                    <p className="text-xs text-slate-500">Awaiting next batch payout cycle (5th of the month).</p>
                 ) : (
                    <p className="text-xs text-slate-500">Commission must be approved before payout.</p>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 relative">
          <FileText className="h-24 w-24 text-slate-50 absolute right-6 top-6 pointer-events-none" />
          <h3 className="text-lg font-bold text-slate-900 relative z-10">Project Details</h3>
        </div>
        <div className="p-6">
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Service Type</p>
                 <p className="text-slate-900 font-medium">{deal.serviceType}</p>
              </div>
              {deal.clientEmail && (
                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Client Email</p>
                   <p className="text-slate-900 font-medium">{deal.clientEmail}</p>
                </div>
              )}
              {deal.notes && (
                <div className="md:col-span-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Original Notes</p>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                      {deal.notes}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
