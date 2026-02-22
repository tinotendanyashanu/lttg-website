"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Globe, Users, BarChart, 
  UserCheck, Link as LinkIcon, Clock, Wallet,
  Sparkles, Network, Crown, X, ChevronRight, Check, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { HeroIllustration, DashboardMockupIllustration, BackgroundGrid } from '@/components/partner/PartnerIllustrations';

const TierProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(65), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-16 bg-[#1A1A1A] p-10 rounded-[2rem] border border-white/5 relative overflow-hidden">
      <div className="flex justify-between items-end mb-6">
        <div>
           <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Tier</span>
           <div className="text-xl font-bold text-white flex items-center mt-1">
             Agency
           </div>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Next Tier</span>
           <div className="text-xl font-bold text-neutral-400 flex items-center mt-1">
             Enterprise
           </div>
        </div>
      </div>
      
      <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-white rounded-full relative"
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between mt-4 text-xs font-semibold text-neutral-500">
        <span>$0</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white"
        >
          $65k / $100k
        </motion.span>
        <span>$100k</span>
      </div>
    </div>
  );
};

export default function PartnerPage() {
  const router = useRouter();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLegalModalOpen(true);
  };

  const handleContinue = () => {
    if (agreedToTerms) {
      router.push('/partner/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      <Navbar />
      
      {/* Legal Modal overflow */}
      <AnimatePresence>
        {isLegalModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white max-w-2xl w-full rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
            >
              <div className="px-8 py-8 border-b border-slate-100 flex justify-between items-center bg-[#F5F5F7]">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Partner Agreement</h2>
                <button 
                  onClick={() => setIsLegalModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-10 overflow-y-auto text-slate-600 text-sm leading-relaxed">
                <p className="mb-4"><strong>Effective Date:</strong> January 1, 2026</p>
                <p className="mb-8 text-lg text-slate-500 font-medium">
                  Welcome to the Leo Systems Partner Network. By clicking &quot;I agree&quot;, you accept these terms governing your participation.
                </p>
                
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">1. Program Overview</h3>
                <p className="mb-8">
                  Partners are independent contractors and not employees or agents of Leo Systems. You agree to represent our services accurately and ethically.
                </p>

                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">2. Commissions & Payments</h3>
                <p className="mb-8">
                  Commissions are earned strictly on successfully closed and paid deals. A mandatory 14-day hold period applies post-payment before commissions become eligible for payout. The minimum payout threshold is $50.00.
                </p>

                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">3. Term & Termination</h3>
                <p className="mb-4">
                  Either party may terminate this agreement at any time with 30 days written notice. Leo Systems reserves the right to terminate immediately for violation of these terms or fraudulent activity.
                </p>
              </div>

              <div className="p-8 border-t border-slate-100 bg-[#F5F5F7] flex flex-col sm:flex-row justify-between items-center gap-6">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${agreedToTerms ? 'bg-[#0071e3] border-[#0071e3]' : 'bg-white border-slate-300 group-hover:border-[#0071e3]'}`}>
                    <Check className={`w-3.5 h-3.5 text-white ${agreedToTerms ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-slate-700 select-none">
                    I agree to the Terms
                  </span>
                </label>
                
                <button
                  onClick={handleContinue}
                  disabled={!agreedToTerms}
                  className={`px-8 py-4 rounded-full text-sm font-bold transition-all ${
                    agreedToTerms 
                      ? 'bg-black text-white hover:bg-neutral-800 shadow-md transform hover:-translate-y-0.5' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Registration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Clean White Flat Base */}
      <section className="relative pt-32 lg:pt-48 pb-32 overflow-hidden bg-white">
        <BackgroundGrid />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tighter text-slate-900 mb-6 leading-[1.05]"
              >
                Grow with <span className="text-[#0071e3]">leverage.</span><br />
                Build with <span className="text-[#10B981]">purpose.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-lg lg:text-xl text-slate-500 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                The Leo Systems Partner Network is built for modern agencies. Earn structured commissions on enterprise-grade tech integration.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={handleApplyClick}
                  className="inline-flex items-center justify-center px-10 py-5 text-base font-bold text-white bg-black rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
                >
                  Apply to Program
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <Link 
                  href="/partner/login" 
                  className="inline-flex items-center justify-center px-10 py-5 text-base font-bold text-slate-900 bg-[#F5F5F7] rounded-full hover:bg-slate-200 transition-colors"
                >
                  Partner Login
                </Link>
              </motion.div>
            </div>
            
            <div className="flex-1 w-full max-w-2xl hidden md:block">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <HeroIllustration className="w-full h-auto drop-shadow-xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Layer - Clean Rounded Cards */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart className="h-6 w-6 text-slate-900" />,
                title: "Structured Commission",
                description: "Earn transparent, tiered commissions on every deal you register. Track everything in real-time."
              },
              {
                icon: <Globe className="h-6 w-6 text-[#0071e3]" />,
                title: "Global Reach",
                description: "Offer world-class tech solutions to clients anywhere. We handle the delivery; you own the relationship."
              },
              {
                icon: <Users className="h-6 w-6 text-[#10B981]" />,
                title: "Enterprise Resources",
                description: "Access a library of white-label sales decks, case studies, and technical guides to close deals faster."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="bg-[#F5F5F7] w-14 h-14 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Lifecycle */}
      <section className="py-32 bg-white relative">
        <BackgroundGrid />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16 text-center mx-auto">
            <h2 className="text-4xl font-semibold text-slate-900 tracking-tight mb-4">Lifecycle of a Deal</h2>
            <p className="text-xl text-slate-500 font-medium">A structured flow from initial registration to secure payout.</p>
          </div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
          >
            {[
              { icon: <UserCheck className="w-5 h-5 text-slate-900" />, label: "Register", desc: "Submit info" },
              { icon: <LinkIcon className="w-5 h-5 text-slate-900" />, label: "Refer", desc: "Share link" },
              { icon: <ShieldCheck className="w-5 h-5 text-[#10B981]" />, label: "Verified", desc: "Invoice paid" },
              { icon: <Clock className="w-5 h-5 text-amber-500" />, label: "14-Day Hold", desc: "Clearance" },
              { icon: <Wallet className="w-5 h-5 text-slate-900" />, label: "Payout", desc: "Transferred" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="bg-[#F5F5F7] p-8 rounded-[2rem] flex flex-col items-center text-center transition-all duration-300 hover:bg-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{step.label}</h4>
                <p className="text-sm text-slate-500 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Commission Structure Table (Tier system) */}
      <section className="py-32 bg-[#0A0A0A] text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-6">Commission Structure</h2>
            <p className="text-xl text-neutral-400 font-medium">Scale your impact. Unlock higher revenue shares and dedicated resources as you ascend through our volume tiers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
              {/* Creator/Referral */}
              <div className="bg-[#1A1A1A] p-12 rounded-[2rem] transition-colors hover:bg-[#222222] border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-neutral-300" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Creator</span>
                </div>
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter text-white">10%</span>
                </div>
                <p className="text-neutral-400 mb-10 font-medium text-lg leading-relaxed h-14">For individuals referring occasional projects.</p>
                
                <div className="space-y-5 border-t border-white/10 pt-8 mt-auto">
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-neutral-500 mr-4 shrink-0 mt-0.5" /> Support Access
                  </div>
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-neutral-500 mr-4 shrink-0 mt-0.5" /> Marketing Library
                  </div>
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-neutral-500 mr-4 shrink-0 mt-0.5" /> Baseline Analytics
                  </div>
                </div>
              </div>

              {/* Agency - Hero Accent */}
              <div className="bg-[#1A1A1A] p-12 rounded-[2rem] transition-colors relative border-2 border-[#10B981]/30 hover:border-[#10B981]/50 shadow-2xl overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-[#10B981]" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <Network className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">Agency / Most Popular</span>
                </div>
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter text-white">15%</span>
                </div>
                <p className="text-neutral-400 mb-10 font-medium text-lg leading-relaxed h-14">For technical agencies integrating our systems natively.</p>
                
                <div className="space-y-5 border-t border-white/10 pt-8 mt-auto">
                  <div className="flex items-center text-white font-semibold">
                     <CheckCircle className="h-5 w-5 text-[#10B981] mr-4 shrink-0 mt-0.5" /> Priority Support
                  </div>
                  <div className="flex items-center text-white font-semibold">
                     <CheckCircle className="h-5 w-5 text-[#10B981] mr-4 shrink-0 mt-0.5" /> Co-branded materials
                  </div>
                  <div className="flex items-center text-white font-semibold">
                     <CheckCircle className="h-5 w-5 text-[#10B981] mr-4 shrink-0 mt-0.5" /> Deal Registration
                  </div>
                </div>
              </div>

              {/* Enterprise */}
              <div className="bg-[#1A1A1A] p-12 rounded-[2rem] transition-colors hover:bg-[#222222] border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#0071e3]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0071e3]">Enterprise</span>
                </div>
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter text-white">20%</span>
                </div>
                <p className="text-neutral-400 mb-10 font-medium text-lg leading-relaxed h-14">For strategic alliances and high-volume connectors.</p>
                
                <div className="space-y-5 border-t border-white/10 pt-8 mt-auto">
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-[#0071e3] mr-4 shrink-0 mt-0.5" /> Dedicated AM
                  </div>
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-[#0071e3] mr-4 shrink-0 mt-0.5" /> Custom API Access
                  </div>
                  <div className="flex items-center text-neutral-300 font-medium">
                     <CheckCircle className="h-5 w-5 text-[#0071e3] mr-4 shrink-0 mt-0.5" /> Joint Go-to-Market
                  </div>
                </div>
              </div>
          </div>
          
          <TierProgressBar />
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <BackgroundGrid />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative bg-[#F5F5F7] p-4 lg:p-8 rounded-[2rem] border border-slate-100"
              >
                <DashboardMockupIllustration className="w-full h-auto drop-shadow-xl rounded-[1.5rem]" />
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 mb-8">Designed for Focus.</h2>
              <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                Manage your book of business in a fast, clean environment. From logging deals to withdrawing funds, every metric is accessible within two clicks.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Real-time ledger", desc: "Never guess when a payment will arrive." },
                  { title: "Quick share links", desc: "For low-touch affiliate flow tracking." },
                  { title: "Exportable data", desc: "CSV generation for your accounting." },
                  { title: "Risk flags", desc: "Automated compliance monitoring." }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
                      <Check className="w-4 h-4 text-slate-900" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h4>
                    <p className="text-slate-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[#F5F5F7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 mb-8">Ready to architect the future?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button 
               onClick={handleApplyClick}
               className="px-10 py-5 bg-black text-white text-lg font-bold rounded-full hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
             >
                Apply to Program
             </button>
             <Link href="/partner/login" className="px-10 py-5 text-lg font-bold text-slate-900 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                Partner Login
             </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
