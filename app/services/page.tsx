
'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const Prism = dynamic(() => import('@/components/Prism'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-transparent" />
});

export default function ServicesPage() {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black selection:bg-white/30 scroll-smooth">
      <Navbar />

      {/* Slide 1: SME */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="hover" hueShift={1.0} hoverStrength={2} scale={4.5} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            SME Solutions
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
            Too much admin, not enough visibility. We replace repetitive workflows with intelligent automation — so your team focuses on growth, not grunt work.
          </p>

          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/services/sme"
                className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
              >
                Explore SME Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-white/40 text-xs">Or explore directly:</span>
              <Link href="/services/ai-automation" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">AI & Automation</Link>
              <Link href="/services/software-dev" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Full-Stack Builds</Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
            <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* Slide 2: Startups */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="rotate" hueShift={0.6} hoverStrength={1} scale={5} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            Startup Solutions
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
            Speed is life, but technical debt is death. We build MVPs in weeks — with the architecture to support your next ten thousand users.
          </p>
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/services/startups"
                className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
              >
                Explore Startup Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-white/40 text-xs">Or explore directly:</span>
              <Link href="/services/software-dev" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Full-Stack Builds</Link>
              <Link href="/services/ai-automation" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">AI Features</Link>
              <Link href="/services/mentorship" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">CTO Advisory</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 3: Enterprise */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="rotate" hueShift={0.7} hoverStrength={1} scale={4} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            Enterprise Solutions
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
            Legacy systems slow innovation. We modernise critical workflows, deploy private AI, and build the security posture your enterprise clients demand.
          </p>
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/services/enterprise"
                className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
              >
                Explore Enterprise Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-white/40 text-xs">Or explore directly:</span>
              <Link href="/services/ai-automation" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Enterprise AI</Link>
              <Link href="/services/cybersecurity" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Security & Compliance</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: Individuals */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="hover" hueShift={1.0} hoverStrength={2} scale={4.5} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            Individual Solutions
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
            A social profile isn&apos;t a brand. We build custom platforms that own your audience, rank on search, and generate leads while you sleep.
          </p>
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/services/individuals"
                className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
              >
                Explore Individual Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <span className="text-white/40 text-xs">Or explore directly:</span>
              <Link href="/services/software-dev" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Portfolio & Platforms</Link>
              <Link href="/services/social-media" className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs hover:text-white hover:border-white/40 transition-colors">Social Systems</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 5: Social Media */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="rotate" hueShift={0.9} hoverStrength={1} scale={4.5} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 animate-pulse">
            In Development
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            Social Media Systems
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
             Automated engagement, intelligent posting, and cross-platform growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/services/social-media"
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              Explore Social Media Systems <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Slide 6: How I Work - New Section */}
      <section className="relative h-screen w-full snap-start overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-60">
           <Prism animationType="hover" hueShift={0.2} hoverStrength={1} scale={4} suspendWhenOffscreen={true} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
            How We Work
          </h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide max-w-2xl drop-shadow-md">
            Transparent, structured, and outcome-driven — from first call to final handover.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/how-i-work" 
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              View Process <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Slide 6: Partner/Footer */}
      <section className="relative h-screen w-full snap-start overflow-hidden bg-slate-950 flex flex-col">
        <div className="flex-grow flex items-center justify-center relative">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 text-center px-6">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                    Partner With Leo.
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto">
                    A dedicated program for agencies and connectors. Earn commissions by referring high-ticket projects.
                </p>
                <Link 
                    href="/portal/partner" 
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    Learn About Partnership <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
