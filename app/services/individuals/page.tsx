
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, 
    ArrowUpRight,
    PenTool, ShoppingCart, Calendar } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Services for Individuals | Leo the Tech Guy",
  description: "Personal brand platforms, portfolios, and e-commerce systems.",
};

export default function IndividualsPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Your Digital Authority."
        description="We build personal platforms that position you as an industry leader. Clean, fast, and optimized for conversion."
        ctaText="Start My Project"
        ctaLink="/contact"
        themeColor="emerald"
        videoSrc="/videos/hero-video1.mp4"
      />
      
      {/* The Methodology */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-1/3 sticky top-32">
                     <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Methodology</span>
                     <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">The &quot;Authority&quot; Stack.</h2>
                     <p className="text-lg text-slate-600 leading-relaxed">
                         You have an idea that won&apos;t leave you alone. We turn that idea into a tangible, working product. No technical co-founder needed.
                     </p>
                </div>
                <div className="lg:w-2/3 grid gap-12">
                    {/* Step 1 */}
                    <div className="group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">01</div>
                            <h3 className="text-2xl font-bold text-slate-900">Brand Identity</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We distill your unique value proposition into a visual identity. Minimalist, premium, and distinct. No templates.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">02</div>
                            <h3 className="text-2xl font-bold text-slate-900">High-Performance Build</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We build fully custom platforms engineered for instant load times, peak SEO performance, and user experiences that feel like native applications.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">03</div>
                            <h3 className="text-2xl font-bold text-slate-900">Automation Loops</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-emerald-500 transition-colors duration-300">
                            We integrate booking systems, newsletters, and payment gateways directly. Your platform works for you while you sleep.
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
                 <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Personal Infrastructure.</h2>
                 <p className="text-xl text-slate-600">
                     Tools for creators, consultants, and thought leaders.
                 </p>
            </div>

            <div className="space-y-24">
            
                {/* Service Block 1: Portfolios */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                            <PenTool className="w-4 h-4" /> Personal Brand
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Portfolio Platforms</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                             A static squarespace site won&apos;t cut it. We build dynamic portfolio systems that showcase your work, host your content, and capture leads with premium interactions.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Case Study Systems</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Blog & CMS</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Newsletter Integration</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Analytics Dashboard</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/individuals/Portfolio Platforms.png"
                                alt="Personal Portfolio Design"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-emerald-900/0 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Service Block 2: E-commerce */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2">
                         <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/individuals/E-commerce Systems.png"
                                alt="E-commerce Store"
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-emerald-900/40" />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                            <ShoppingCart className="w-4 h-4" /> Commerce
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">E-commerce Systems</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Selling digital products or services? We build high-conversion storefronts with integrated payment processing, automated tax handling, delivery, and access control built in from the start.
                        </p>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Digital Product Delivery</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Subscription Mgmt</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Custom Checkout</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Cart Recovery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Block 3: Booking/Auto */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
                            <Calendar className="w-4 h-4" /> Systems
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Booking & Automation</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Stop playing email tag to find a time. We wire smart scheduling, intake forms, and payment collection into one seamless flow — so clients can book, pay, and prepare without you lifting a finger.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Smart Scheduling</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Intake Forms</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Payment Pre-auth</span>
                            </div>
                             <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Reminders</span>
                            </div>
                        </div>
                    </div>
                     <div className="lg:w-1/2 order-1 lg:order-2">
                         <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/individuals/Booking & Automation.png"
                                alt="Booking Systems"
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
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">Build Your Legacy.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-8">
                          Don&apos;t rely on rented land (social media). Own your platform, your data, and your audience with infrastructure that lasts.
                      </p>
                      <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors">
                          Start My Project <ArrowUpRight className="ml-2 w-5 h-5" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">SEO Optimized</h4>
                          <p className="text-sm text-slate-400">Rank for your name.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Mobile Perfect</h4>
                          <p className="text-sm text-slate-400">Flawless on every screen, from phone to desktop.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Fast Loading</h4>
                          <p className="text-sm text-slate-400">95+ Performance Score.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-emerald-400">Secure</h4>
                          <p className="text-sm text-slate-400">SSL and DDoS protection.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Final Stats / Impact */}
      <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="text-center mb-16 max-w-2xl mx-auto">
                   <h2 className="text-3xl font-bold text-slate-900">What We Engineer For</h2>
                   <p className="mt-4 text-slate-500 text-sm">Design targets we build toward — actual results depend on your starting point, scope, and market.</p>
               </div>
               <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">2x</div>
                        <div className="text-emerald-600 font-medium">Conversion Rate</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">95+</div>
                        <div className="text-emerald-600 font-medium">Google PageSpeed</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">100%</div>
                        <div className="text-emerald-600 font-medium">Ownership</div>
                    </div>
               </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
