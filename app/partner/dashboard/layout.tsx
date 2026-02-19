import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/partner/Sidebar';
import OnboardingTour from '@/components/OnboardingTour';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import { Partner } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/partner/login');
  }

  await dbConnect();
  await dbConnect();
  const partnerDoc = await PartnerModel.findOne({ email: session.user.email }).lean();
  const partner = JSON.parse(JSON.stringify(partnerDoc)) as unknown as Partner;

  if (!partner) {
    // Handle case where user is authenticated but not in partner DB
    redirect('/contact'); 
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <OnboardingTour userHasCompleted={partner.hasCompletedOnboarding || false} partnerType={partner.partnerType || 'standard'} />
      <Sidebar user={partner} partnerType={partner.partnerType || 'standard'} />
      <div className="pl-64 transition-all duration-300">
        {/* Header content... */}
        <header className="bg-white/50 backdrop-blur-sm sticky top-0 z-30 h-20 flex items-center px-10 justify-between">
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 text-xs font-medium">
                     {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
             </div>
             
             <button className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all">
                <span className="sr-only">Notifications</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
             </button>
        </header> 
        <main className="px-10 py-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
