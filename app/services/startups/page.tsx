
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Rocket, Code2, Server, Globe, ArrowRight, CheckCircle2, Cpu, Zap, Layers } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Startup Services | Leo the Tech Guy",
  description: "Scalable product architecture, MVP builds, and SaaS systems.",
};

export default function StartupsPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-blue-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Engineering for Growth."
        description="Build it right the first time. We provide the technical foundation that investors trust and users love."
        ctaText="Start My Build"
        ctaLink="/contact"
        themeColor="blue"
        videoSrc="/videos/hero-video2.mp4"
      />
      
      {/* The Methodology */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-1/3 sticky top-32">
                     <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Methodology</span>
                     <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">The "Scale-First" Architecture.</h2>
                     <p className="text-lg text-slate-600 leading-relaxed">
                         Speed is life for startups, but technical debt is death. We balance rapid iteration with solid architectural patterns that won't break when you hit 10k users.
                     </p>
                </div>
                <div className="lg:w-2/3 grid gap-12">
                    {/* Step 1 */}
                    <div className="group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">01</div>
                            <h3 className="text-2xl font-bold text-slate-900">Scope & Simplify</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-blue-500 transition-colors duration-300">
                            We ruthlessly cut feature bloat. We define the Minimum Viable Product that delivers maximum value, ensuring you launch in weeks, not months.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">02</div>
                            <h3 className="text-2xl font-bold text-slate-900">Rapid Development</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-blue-500 transition-colors duration-300">
                            Using modern stacks (Next.js, Supabase, Vercel), we build production-ready applications with built-in auth, payments, and database management.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">03</div>
                            <h3 className="text-2xl font-bold text-slate-900">Iterate & Scale</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-blue-500 transition-colors duration-300">
                            Post-launch, we set up analytics and feedback loops. We deploy updates daily, scaling infrastructure automatically as your user base grows.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
             <div className="mb-20 text-center max-w-3xl mx-auto">
                 <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Product Engineering.</h2>
                 <p className="text-xl text-slate-600">
                     From day one code to Series A infrastructure.
                 </p>
            </div>

            <div className="space-y-24">
            
                {/* Service Block 1: MVP */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                            <Rocket className="w-4 h-4" /> Launch
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">MVP Development</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Launch fast without technical debt. We build robust Minimum Viable Products that validate your market hypothesis while being ready for scale from day one.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Core Feature Build</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Auth & Payments</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Mobile Responsive</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Analytics Setup</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                             <Image 
                                src="/images/startups/MVP Development.png"
                                alt="MVP Development"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Service Block 2: SaaS Platform */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2">
                         <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/startups/Full SaaS Platform Development.png"
                                alt="Full SaaS Platform Development"
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-blue-900/40" />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
                            <Layers className="w-4 h-4" /> Scale
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Full SaaS Platform Development</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Comprehensive development for mature products. Secure, multi-tenant architectures designed for enterprise-grade performance and reliability.
                        </p>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Multi-tenant Architecture</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Advanced Role Mgmt</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Subscription Billing</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">API Documentation</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Block 3: AI Integration */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-6">
                            <Cpu className="w-4 h-4" /> Innovation
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">AI Feature Integration</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Give your product a competitive edge. We integrate RAG (Retrieval Augmented Generation), semantic search, and chat agents directly into your application.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Conversational UI</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Vector Search</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Content Generation</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Model Fine-tuning</span>
                            </div>
                        </div>
                    </div>
                     <div className="lg:w-1/2 order-1 lg:order-2">
                         <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/startups/Innovation AI Feature Integration.png"
                                alt="AI Feature Integration"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>
      
      {/* Infrastructure - The "Safety Net" */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">Infrastructure That Sleeps Well.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-8">
                          We treat infrastructure as code. Automated deployments, self-healing clusters, and zero-downtime updates allow you to ship without fear.
                      </p>
                      <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
                          Start My Build <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-blue-400">CI/CD Pipelines</h4>
                          <p className="text-sm text-slate-400">Ship code multiple times a day.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-blue-400">Auto-Scaling</h4>
                          <p className="text-sm text-slate-400">Resources adapt to traffic spikes.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-blue-400">Real-time Logs</h4>
                          <p className="text-sm text-slate-400">Instant visibility into errors.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-blue-400">Security First</h4>
                          <p className="text-sm text-slate-400">OWASP Top 10 compliance baked in.</p>
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
                        <div className="text-5xl font-bold mb-2 text-slate-900">4-6</div>
                        <div className="text-blue-600 font-medium">Weeks to Launch</div>
                    </div>
                     <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">99.9%</div>
                        <div className="text-blue-600 font-medium">Uptime Guarantee</div>
                    </div>
                     <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">0</div>
                        <div className="text-blue-600 font-medium">Technical Debt</div>
                    </div>
               </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
