import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Users, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: "Partner Program | Leo The Tech Guy",
  description: "Join the Leo Systems Partner Network. Referral and strategic partnerships for agencies, consultants, and enterprise connectors.",
};

export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6">
              Leo Systems <span className="text-blue-600">Partner Network</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Collaborate with a premium engineering team. We help consultants, agencies, and networkers deliver high-value infrastructure to their clients.
            </p>
            <Link href="/contact?subject=Partner Application" className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors">
              Apply to Become a Partner
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-700">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Recurring Revenue</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate significant income by introducing clients who need enterprise-grade digital infrastructure. Long-term opportunities available.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Reliable Fulfillment</h3>
              <p className="text-slate-600 leading-relaxed">
                Never worry about delivery. You handle the relationship (or hand it off), and we build world-class systems that make you look good.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6 text-amber-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sales Enablement</h3>
              <p className="text-slate-600 leading-relaxed">
                Access private resources, system breakdown documents, and sales positioning guides to help you close larger deals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Levels */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center">Partnership Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-8 border border-slate-700 rounded-2xl bg-slate-800/50">
                    <h3 className="text-xl font-bold mb-2 text-slate-200">Referral Partner</h3>
                    <p className="text-slate-400 mb-6 text-sm">For individuals & connectors</p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div> Simple introduction model</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div> Commission per closed deal</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div> No technical involvement needed</li>
                    </ul>
                </div>
                 <div className="p-8 border border-slate-700 rounded-2xl bg-slate-800/50">
                    <h3 className="text-xl font-bold mb-2 text-slate-200">Agency Partner</h3>
                    <p className="text-slate-400 mb-6 text-sm">For design & marketing agencies</p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div> White-label delivery options</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div> Integrated technical teams</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div> Joint venture opportunities</li>
                    </ul>
                </div>
                 <div className="p-8 border border-slate-700 rounded-2xl bg-slate-800/50">
                    <h3 className="text-xl font-bold mb-2 text-slate-200">Enterprise Connector</h3>
                    <p className="text-slate-400 mb-6 text-sm">For seasoned consultants</p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div> Complex architecture consulting</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div> Retainer-based revenue share</li>
                        <li className="flex items-center text-sm text-slate-300"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div> Strategic advisory role</li>
                    </ul>
                </div>
            </div>
             <div className="mt-16 text-center">
                 <p className="mb-6 text-slate-400 text-sm">Approved partners receive access to a private dashboard for deal tracking and commission visibility.</p>
                <Link href="/contact?subject=Partner Application" className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 transition-colors">
                Apply Now
                </Link>
             </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
