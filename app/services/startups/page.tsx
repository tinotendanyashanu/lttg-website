
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Rocket, Code2, Server, Globe, ArrowRight, Database, CheckCircle2 } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Startup Engineering & MVP Development | Leo The Tech Guy",
  description: "From MVP to IPO. Scalable software architecture for high-growth startups.",
};

export default function StartupsPage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Engineering for High Growth."
        description="Don't build technical debt. We architect scalable platforms that survive the transition from MVP to Series A and beyond."
        ctaText="Start My Build"
        ctaLink="/contact"
        themeColor="blue"
      />

      {/* The Challenge */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Challenge</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Speed vs. Scalability.
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
                <p className="text-lg text-slate-600 leading-relaxed">
                    Founders often face a dilemma: ship fast with "no-code" and break later, or over-engineer and miss the market window. Both paths lead to failure.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    You need a "Goldilocks" architecture—clean, modular code that allows for rapid iteration today but won't need a total rewrite when you hit 10,000 users.
                </p>
            </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16 max-w-3xl">
                <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 block">Our Approach</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Modular Architecture.</h2>
                <p className="text-xl text-slate-600">We build with the end in mind, using stacks that scale (Next.js, Python, AWS).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-blue-600 font-bold text-xl mb-4">01. Blueprint</div>
                    <p className="text-slate-600">We define the data model and API structure before writing a single line of code.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-blue-600 font-bold text-xl mb-4">02. Build</div>
                    <p className="text-slate-600">Rapid sprints focused on core features. We ship a functional MVP in weeks, not months.</p>
                 </div>
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-blue-600 font-bold text-xl mb-4">03. Iterate</div>
                    <p className="text-slate-600">We set up CI/CD pipelines so you can deploy updates multiple times a day safely.</p>
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
            
            {/* MVP - Large */}
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-8 text-blue-700">
                  <Rocket className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">MVP Development</h3>
                <p className="text-slate-600 leading-relaxed mb-8 max-w-xl">
                  We turn your idea into a deployed product. Full-stack development including authentication, payments (Stripe), and database design.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4 mb-8">
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-3" /> React / Next.js Frontend</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-3" /> Supabase / Postgres DB</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-3" /> Stripe Integration</li>
                    <li className="flex items-center text-sm font-medium text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-3" /> Mobile Responsive</li>
                </ul>
              </div>
            </div>
            
            {/* SaaS Platform */}
             <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 flex flex-col justify-between group">
               <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">SaaS Architecture</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                     Multi-tenant architecture meant for scale. subscription management, role-based access, and admin panels.
                  </p>
               </div>
            </div>

            {/* AI Integration */}
             <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-700">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">AI Product Integration</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Embed LLMs (OpenAI/Anthropic) directly into your product to create unique, high-value user features.
              </p>
            </div>

            {/* DevOps */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 text-amber-700">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">DevOps & Infrastructure</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                AWS/Vercel setup. Auto-scaling, load balancing, and automated backups so you sleep at night.
              </p>
            </div>

             {/* Backend */}
            <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col group">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 text-cyan-700">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">API Design</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                REST/GraphQL API design that allows your frontend and mobile apps to communicate efficiently.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact / Metrics */}
      <section className="py-24 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid md:grid-cols-3 gap-12 text-center divider-y md:divide-y-0 md:divide-x divide-blue-800">
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">4-6</div>
                        <div className="text-blue-200 font-medium">Weeks to Launch</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">99.9%</div>
                        <div className="text-blue-200 font-medium">Uptime Guarantee</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2">0</div>
                        <div className="text-blue-200 font-medium">Technical Debt</div>
                    </div>
               </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Have an idea? Let's build it.</h2>
            <p className="text-xl text-slate-600 mb-10">
                Book a technical roadmap session to scope your MVP.
            </p>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-xl shadow-blue-600/20">
                Start My Build
                <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
