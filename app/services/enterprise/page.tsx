
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, Database, Server, Lock, ArrowRight, GitBranch, ChevronRight, CheckCircle2 } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Enterprise AI & Infrastructure | Leo The Tech Guy",
  description: "Digital transformation, secure AI knowledge systems, and enterprise-grade infrastructure architecture.",
};

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Enterprise AI & Infrastructure Modernization."
        description="Digital transformation isn't just about moving to the cloud. It's about building intelligent, self-correcting systems that scale securely."
        ctaText="Request Enterprise Consultation"
        ctaLink="/contact"
        themeColor="indigo"
      />

      {/* The Challenge */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Challenge</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Legacy Systems & Data Silos.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
                <p className="text-lg text-slate-600 leading-relaxed">
                    Large organizations are often data-rich but insight-poor. Your data is locked in legacy on-premise servers or scattered across disjointed SaaS tools, making it impossible to leverage modern AI.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Security protocols often stifle innovation. You need a way to integrate generative AI and cloud agility without compromising on compliance (SOC2, HIPAA, GDPR).
                </p>
            </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-3xl">
                <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 block">Our Approach</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Secure Modernization.</h2>
                <p className="text-xl text-slate-600">We decouple legacy dependencies and build secure, private intelligence layers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-indigo-600 font-bold text-xl mb-4">01. Decouple</div>
                    <p className="text-slate-600">We wrap legacy systems in modern API layers to enable new integrations without risky rewrites.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-indigo-600 font-bold text-xl mb-4">02. Secure</div>
                    <p className="text-slate-600">We implement Zero Trust architecture and private VPCs for all AI/Data operations.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-indigo-600 font-bold text-xl mb-4">03. Intelligence</div>
                    <p className="text-slate-600">We deploy RAG (Retrieval Augmented Generation) systems to make your data chat-accessible.</p>
                 </div>
            </div>
         </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Core Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Digital Transformation - Large */}
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8 text-indigo-700">
                  <GitBranch className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Digital Transformation Architecture</h3>
                <p className="text-slate-600 leading-relaxed mb-8 max-w-xl">
                  Strategic modernization of legacy systems. We re-engineer workflows to be API-first and cloud-native, reducing maintenance costs and enabling rapid innovation.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4 mb-8">
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-indigo-600 mr-3" /> Legacy Migration Strategies</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-indigo-600 mr-3" /> Microservices Architecture</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-indigo-600 mr-3" /> API Gateway Implementation</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-indigo-600 mr-3" /> Hybrid Cloud Setup</li>
                </ul>
              </div>
            </div>
            
            {/* RAG Systems */}
             <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col justify-between group">
               <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Secure AI Knowledge Systems</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                     Deploy private AI (RAG) that allows teams to query company data securely. Full RBAC control.
                  </p>
               </div>
            </div>

            {/* Cloud Migration */}
             <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-700">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Secure Cloud Migration</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Seamless transition to AWS/Azure with zero downtime. We handle the complexity of data migration.
              </p>
            </div>

            {/* DevSecOps */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 text-amber-700">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">DevSecOps & Security</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Security baked into the pipeline. Automated compliance checks, vulnerability scanning, and IAM.
              </p>
            </div>

            {/* Department Automation */}
             <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-700">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Department Automation</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                    End-to-end automation for HR, Finance, and Legal. Reduce manual processing by up to 80%.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact / Metrics */}
      <section className="py-24 bg-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid md:grid-cols-3 gap-12 text-center divider-y md:divide-y-0 md:divide-x divide-indigo-800">
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">SOC2</div>
                        <div className="text-indigo-200 font-medium">Compliance Ready</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">100%</div>
                        <div className="text-indigo-200 font-medium">Data Sovereignty</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">24/7</div>
                        <div className="text-indigo-200 font-medium">System Reliability</div>
                    </div>
               </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Modernize your infrastructure.</h2>
            <p className="text-xl text-slate-600 mb-10">
                Schedule a consultation to discuss your digital transformation roadmap.
            </p>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/20">
                Request Enterprise Consultation
                <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
