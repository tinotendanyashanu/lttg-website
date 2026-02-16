
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Monitor, Smartphone, ShoppingBag, Calendar, Zap, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Personal Brand & Website Development | Leo The Tech Guy",
  description: "High-performance websites, personal brand platforms, and e-commerce systems for individuals and creators.",
};

export default function IndividualsPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Build Your Digital Presence."
        description="Don't settle for a generic template. I build structured, high-performance platforms that position you as a leader and convert visitors into clients."
        ctaText="Start My Project"
        ctaLink="/contact"
        themeColor="emerald"
      />

      {/* The Challenge */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Challenge</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Visibility vs. Authenticity.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
                <p className="text-lg text-slate-600 leading-relaxed">
                    Most personal brand websites are just "digital business cards"—static, boring, and disconnected from your actual revenue streams (newsletter, products, booking).
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    To stand out, you need a platform. A central hub that aggregates your content, captures leads automatically, and sells your expertise while you sleep.
                </p>
            </div>
        </div>
      </section>

       {/* Our Approach */}
       <section className="py-20 px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-3xl">
                <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">Our Approach</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Performance-Driven Design.</h2>
                <p className="text-xl text-slate-600">We don't use drag-and-drop builders. We write custom code for maximum speed and SEO.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">01. Architect</div>
                    <p className="text-slate-600">We map your user journey. How does a visitor become a newsletter subscriber, then a client?</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">02. Design</div>
                    <p className="text-slate-600">We create a visual identity that reflects your premium standing in the market. No templates.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">03. Optimize</div>
                    <p className="text-slate-600">We perfect the technical SEO and load speeds (Core Web Vitals) so Google loves you.</p>
                 </div>
            </div>
         </div>
      </section>

      {/* Core Services */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
             <h2 className="text-3xl font-bold text-slate-900">Core Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Custom Website - Large */}
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 text-emerald-600">
                  <Monitor className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Custom Website Development</h3>
                <p className="text-slate-600 leading-relaxed mb-8 max-w-xl">
                  Pixel-perfect, responsive websites built with modern code (Next.js), not drag-and-drop builders. Fast, SEO-optimized, and fully yours.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4 mb-8">
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Next.js / React Architecture</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Perfect Google Lighthouse Score</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Advanced Animations</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Content Management System (CMS)</li>
                </ul>
              </div>
            </div>
            
            {/* Personal Brand */}
             <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col justify-between group">
               <div>
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Personal Brand Platforms</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                     A centralized hub for your content, newsletter, and products. Establish authority.
                  </p>
               </div>
            </div>

            {/* E-commerce */}
             <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">E-commerce Systems</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Sell digital or physical products with a custom storefront. Secure payments, inventory management.
              </p>
            </div>

            {/* Booking */}
             <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Booking & Automation</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Automate your calendar. Clients book slots, pay deposits, and receive reminders automatically.
              </p>
            </div>

            {/* Optimization/Redesign */}
             <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Redesign & Optimize</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Audit existing sites, fix speed issues, improve responsiveness, and refresh the design.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact / Metrics */}
      <section className="py-24 bg-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid md:grid-cols-3 gap-12 text-center divider-y md:divide-y-0 md:divide-x divide-emerald-800">
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">100</div>
                        <div className="text-emerald-200 font-medium">PageSpeed Score</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">24h</div>
                        <div className="text-emerald-200 font-medium">Response Time</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">SEO</div>
                        <div className="text-emerald-200 font-medium">Optimized Architecture</div>
                    </div>
               </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Stand out from the noise.</h2>
            <p className="text-xl text-slate-600 mb-10">
                Stop using generic templates. Build a platform that worthy of your brand.
            </p>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                Start My Project
                <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
