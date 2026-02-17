
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Bot, BarChart3, Users, Zap, CheckCircle2, ArrowRight, Layers, Workflow, LineChart } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "SME Solutions | Leo the Tech Guy",
  description: "AI-powered systems that streamline operations and increase revenue.",
};

export default function SMEPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Operational Intelligence."
        description="We don't just patch problems. We deploy autonomous infrastructure that scales your business without scaling your headcount."
        ctaText="Upgrade My Business Systems"
        ctaLink="/contact"
        themeColor="emerald"
        videoSrc="/videos/hero-video1.mp4"
      />
      
      {/* The Methodology / Process Section - Premium Text Heavy */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-1/3 sticky top-32">
                     <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Methodology</span>
                     <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">The 3-Step Optimization Protocol.</h2>
                     <p className="text-lg text-slate-600 leading-relaxed">
                         Most "digital transformation" fails because it's additive. We focus on subtraction: removing friction, removing manual data entry, and removing bottlenecks.
                     </p>
                </div>
                <div className="lg:w-2/3 grid gap-12">
                    {/* Step 1 */}
                    <div className="group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">01</div>
                            <h3 className="text-2xl font-bold text-slate-900">Audit & Map</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We map every manual process in your business. From lead intake to invoice generation, we identify where human hours are being wasted on robot work.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">02</div>
                            <h3 className="text-2xl font-bold text-slate-900">Architect & Automate</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We design standard operating procedures (SOPs) and translate them into code. Using n8n, Make, and custom scripts, we build the "nervous system" of your business.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">03</div>
                            <h3 className="text-2xl font-bold text-slate-900">Deploy & Optimize</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We launch your new infrastructure in parallel with existing systems to ensure zero downtime. Once validated, we switch over and monitor for efficiency gains.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Services - Alternating or Large Cards */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
             <div className="mb-20 text-center max-w-3xl mx-auto">
                 <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Core Infrastructure Modules.</h2>
                 <p className="text-xl text-slate-600">
                     Select the components your business needs to scale.
                 </p>
            </div>

            <div className="space-y-24">
            
                {/* Service Block 1: Workflow Automation */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                            <Workflow className="w-4 h-4" /> Operations
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">AI Workflow Automation</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Manual repetition is the enemy of scale. We replace hours of admin work with intelligent agents. Imagine an employee that works 24/7, never makes a typo, and costs a fraction of a salary.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Auto-Invoicing</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Employee Onboarding</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Data Synchronization</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Contract Generation</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                            <Image 
                                src="/images/sme/Operations AI Workflow Automation.png"
                                alt="AI Workflow Automation"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-emerald-900/0 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Service Block 2: Revenue Systems */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2">
                         <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                             {/* Dark card for contrast */}
                            <Image 
                                src="/images/sme/AI Sales & Lead Systems.png"
                                alt="AI Sales & Lead Systems"
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-emerald-900/40" />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" /> Revenue
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">AI Sales & Lead Systems</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Stop losing leads to fast decay. We build automated pipelines that engage, qualify, and book meetings with prospects instantly. Your sales team should only talk to qualified buyers.
                        </p>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Instant Lead Response</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Automated Follow-ups</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">CRM Enrichment</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Calendar Booking</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Block 3: Dashboard & BI */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-6">
                            <LineChart className="w-4 h-4" /> Intelligence
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Business Intelligence Dashboards</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                             Gut feeling isn't a strategy. We centralize your scattered data (Stripe, Ads, CRM, Support) into live, actionable dashboards. Know your net profit, LTV, and churn in real-time.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Unified Data Warehouse</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Real-time P&L</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Marketing Attribution</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Custom Reporting</span>
                            </div>
                        </div>
                    </div>
                     <div className="lg:w-1/2 order-1 lg:order-2">
                         <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                            <Image 
                                src="/images/sme/Business Intelligence Dashboards.png"
                                alt="Business Intelligence Dashboards"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>
      
      {/* Support & Optimization - The "Safety Net" */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">Ongoing Support & Optimization.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-8">
                          Infrastructure is a living thing. We provide ongoing monitoring, updates, and optimization to ensure your systems never age out.
                      </p>
                      <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors">
                          Upgrade My Systems <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">99.9% Uptime</h4>
                          <p className="text-sm text-slate-400">We monitor your systems 24/7 so you don't have to.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Rapid Response</h4>
                          <p className="text-sm text-slate-400">Direct access to engineering for critical issues.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Monthly Audits</h4>
                          <p className="text-sm text-slate-400">Proactive checks to identify new efficiency wins.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Scale Ready</h4>
                          <p className="text-sm text-slate-400">Architecture that grows with your revenue.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Final Stats / Impact */}
      <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-slate-900">Quantifiable Impact</h2>
               </div>
               <div className="grid md:grid-cols-3 gap-12 text-center divider-y md:divide-y-0 md:divide-x divide-slate-200">
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">30%</div>
                        <div className="text-emerald-600 font-medium">Reduction in OpEx</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">100+</div>
                        <div className="text-emerald-600 font-medium">Hours Saved Monthly</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">2x</div>
                        <div className="text-emerald-600 font-medium">Revenue Capacity</div>
                    </div>
               </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
