
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
            AI-powered systems that streamline operations and increase revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/services/sme" 
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              Explore SME Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
             Scalable product architecture, MVP builds, and SaaS systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/services/startups" 
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              Explore Startup Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
             Secure AI infrastructure and digital transformation systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/services/enterprise" 
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              Explore Enterprise Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
             High-performance websites and digital platforms built properly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/services/individuals" 
              className="px-10 py-3.5 bg-white text-black rounded-full font-medium sm:min-w-[200px] hover:bg-slate-200 transition-colors flex items-center justify-center group"
            >
              Explore Individual Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Slide 5: Partner/Footer */}
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
                    href="/partner" 
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
