import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';
import { IPartner } from '@/models/Partner';
import DealActionForm from '@/components/admin/DealActionForm';
import Link from 'next/link';
import { ArrowLeft, User, Calendar } from 'lucide-react';

async function getDeal(id: string) {
  await dbConnect();
  return Deal.findById(id).populate('partnerId', 'name email tier').lean();
}

export default async function AdminDealDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const deal = await getDeal(params.id);
  
  if (!deal) return <div>Deal not found</div>;
  
  const partner = deal.partnerId as unknown as IPartner;

  return (
    <div className="max-w-4xl mx-auto">
       <Link href="/admin/deals" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Pipeline
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h1 className="text-3xl font-bold text-slate-900 mb-2">{deal.clientName}</h1>
                          <div className="flex items-center space-x-2 text-slate-500">
                              <Calendar className="h-4 w-4" />
                              <span>Registered on {new Date(deal.createdAt).toLocaleDateString()}</span>
                          </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide 
                        ${deal.dealStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                          deal.dealStatus === 'closed' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'}`}>
                          {deal.dealStatus.replace('_', ' ')}
                      </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                       <div>
                           <p className="text-sm text-slate-500 mb-1">Estimated Value</p>
                           <p className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.estimatedValue)}</p>
                       </div>
                       <div>
                           <p className="text-sm text-slate-500 mb-1">Commission Rate</p>
                           <p className="text-2xl font-bold text-purple-600">{(deal.commissionRate * 100).toFixed(0)}%</p>
                       </div>
                  </div>

                  <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                      <p className="text-slate-600 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                          {deal.notes || 'No notes provided.'}
                      </p>
                  </div>
              </div>

              {/* Partner Info */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                          <p className="font-medium text-slate-900">{partner.name}</p>
                          <p className="text-sm text-slate-500">{partner.email}</p>
                      </div>
                  </div>
                  <Link href={`/admin/partners?q=${partner.email}`} className="text-sm text-purple-600 hover:underline">View Profile</Link>
              </div>
          </div>

          {/* Sidebar Actions */}
          <div>
              <DealActionForm deal={JSON.parse(JSON.stringify(deal))} partnerName={partner.name} />
          </div>
      </div>
    </div>
  );
}
