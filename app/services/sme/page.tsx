
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Bot, BarChart3, Users, Zap, ArrowRight, LineChart, CheckCircle2 } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "SME Systems & Automation | Leo The Tech Guy",
  description: "Scalable revenue engines and operational automation for growing small to medium enterprises.",
};

export default function SMEPage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-emerald-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Automate Operations. Scale Revenue."
        description="Stop trading time for money. We build intelligent infrastructure that allows your business to run autonomously."
        ctaText="Upgrade My Business Systems"
        ctaLink="/contact"
        themeColor="emerald"
      />

      {/* The Challenge */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Challenge</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                The "Growth Plateau" is a systems problem.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
                <p className="text-lg text-slate-600 leading-relaxed">
                    Most SMEs hit a ceiling where more revenue equals more chaos. You're hiring more people to do manual tasks, margins are shrinking, and you, the founder, are still the bottleneck for critical decisions.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    This isn't a personnel issue; it's an infrastructure failure. Without automated workflows and data-driven visibility, you cannot scale past a certain point without breaking the machine.
                </p>
            </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-3xl">
                <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">Our Approach</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Systems-First Scaling.</h2>
                <p className="text-xl text-slate-600">We don't just "fix" things. We re-architect your operational core.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">01. Audit</div>
                    <p className="text-slate-600">We map every manual process in your business to identify bottlenecks and redundancies.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">02. Automate</div>
                    <p className="text-slate-600">We deploy code-based automations (not just Zapier) to handle reliable, complex workflows.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-emerald-600 font-bold text-xl mb-4">03. Scale</div>
                    <p className="text-slate-600">We implement dashboards effectively giving you a "cockpit" to manage the business.</p>
                 </div>
            </div>
         </div>
      </section>

      {/* Core Capabilities - "Bento" Style but Professional */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Core Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Automation - Large */}
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-8 text-emerald-700">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">AI Workflow Automation</h3>
                <p className="text-slate-600 leading-relaxed mb-8 max-w-xl">
                  Replace manual data entry, customer onboarding, and invoicing with intelligent agents. We build custom Python scripts and API integrations that run 24/7 without error.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4 mb-8">
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Automated Invoicing</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Lead Qualification</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Client Onboarding</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3" /> Support Triage</li>
                </ul>
              </div>
            </div>
            
            {/* Dashboards */}
             <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col justify-between group">
               <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Business Intelligence</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                     Custom dashboards (Looker/PowerBI) that give you real-time visibility into cash flow, churn, and LTV.
                  </p>
               </div>
            </div>

            {/* CRM */}
             <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">CRM Architecture</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                HubSpot/Salesforce implementation that actually tracks attribution. Know exactly where your money comes from.
              </p>
            </div>

            {/* Sales Engines */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 text-amber-700">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Sales Engineering</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Outbound infrastructure setup. Cold email systems, warm-up protocols, and automated follow-up sequences.
              </p>
            </div>

             {/* Speed */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-700">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Process Optimization</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                We remove friction. Reducing click-counts for employees and speeding up delivery times for customers.
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
                        <div className="text-5xl font-bold mb-2">30%</div>
                        <div className="text-emerald-200 font-medium">Reduction in OpEx</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">100+</div>
                        <div className="text-emerald-200 font-medium">Hours Saved Monthly</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">2x</div>
                        <div className="text-emerald-200 font-medium">Revenue Capacity</div>
                    </div>
               </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to remove the bottlenecks?</h2>
            <p className="text-xl text-slate-600 mb-10">
                Schedule a discovery call to audit your current infrastructure.
            </p>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-600/20">
                Book Scale Consulatation
                <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
