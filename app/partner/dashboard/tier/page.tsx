import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { Award, Lock, CheckCircle } from 'lucide-react';

async function getTierData(userId: string) {
  await dbConnect();
  return Partner.findById(userId).select('tier stats').lean();
}

const TIERS = {
    creator: {
        name: 'Creator Partner',
        commission: 8,
        minRevenue: 0,
        benefits: ['8% Commission', 'Referral Link', 'Academy Access'],
        nextTier: 'referral'
    },
    referral: {
        name: 'Referral Partner',
        commission: 10,
        minRevenue: 10000,
        benefits: ['10% Commission', 'Basic Resources', 'No Minimums'],
        nextTier: 'agency'
    },
    agency: {
        name: 'Agency Partner',
        commission: 15,
        minRevenue: 30000,
        benefits: ['15% Commission', 'Priority Support', 'Co-branded Materials', 'Deal Registration'],
        nextTier: 'enterprise'
    },
    enterprise: {
        name: 'Enterprise Connector',
        commission: 20,
        minRevenue: 75000,
        benefits: ['20% Commission', 'Dedicated Account Manager', 'Custom Integrations', 'Joint Go-to-Market'],
        nextTier: null
    }
};

export default async function TierPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const partner = await getTierData(session.user.id);
  if (!partner) return null;

  const currentTier = partner.tier as keyof typeof TIERS;
  const currentTierStats = TIERS[currentTier];
  const totalRevenue = partner.stats.totalReferredRevenue;
  
  const nextTierKey = currentTierStats.nextTier as keyof typeof TIERS | null;
  const nextTier = nextTierKey ? TIERS[nextTierKey] : null;

  const progress = nextTier 
    ? Math.min(100, Math.max(0, ((totalRevenue - currentTierStats.minRevenue) / (nextTier.minRevenue - currentTierStats.minRevenue)) * 100))
    : 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tier Progress</h2>
        <p className="text-slate-500">Level up to unlock higher commissions and exclusive benefits.</p>
      </div>

      {/* Current Status Card */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                    Current Status
                </div>
                <h3 className="text-3xl font-bold mb-2">{currentTierStats.name}</h3>
                <p className="text-slate-400">Earning <span className="text-white font-bold">{currentTierStats.commission}%</span> Commission</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-xl min-w-[250px] border border-slate-700">
                <div className="flex items-center space-x-3 mb-2">
                    <Award className="text-emerald-500 h-6 w-6" />
                    <span className="text-slate-300 font-medium">Lifetime Revenue</span>
                </div>
                <p className="text-3xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}</p>
            </div>
        </div>

        {/* Progress Bar to Next Tier */}
        {nextTier && (
            <div className="relative z-10 mt-12">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Progress to {nextTier.name}</span>
                    <span className="text-white font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(nextTier.minRevenue - totalRevenue)} to go</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentTierStats.minRevenue)}</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(nextTier.minRevenue)}</span>
                </div>
            </div>
        )}

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Tier Comparison */}
      <h3 className="text-xl font-bold text-slate-900 mt-12">Tier Benefits</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(TIERS).map(([key, tier]) => {
            const isCurrent = key === currentTier;
            const isLocked = !isCurrent && TIERS[key as keyof typeof TIERS].minRevenue > totalRevenue;

            return (
                <div key={key} className={`rounded-xl border p-6 ${isCurrent ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white'} ${isLocked ? 'opacity-75' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-slate-900">{tier.name}</h4>
                        {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                        {isCurrent && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-6">{tier.commission}% <span className="text-sm font-normal text-slate-500">commission</span></div>
                    <ul className="space-y-3">
                        {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center text-sm text-slate-600">
                                <div className={`h-1.5 w-1.5 rounded-full mr-2 ${isCurrent ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        })}
      </div>
    </div>
  );
}
