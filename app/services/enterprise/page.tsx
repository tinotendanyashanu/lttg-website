
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Database, Server, Lock, ArrowRight, GitBranch, CheckCircle2, Globe, FileKey } from 'lucide-react';
import ServiceHero from '@/components/ServiceHero';

export const metadata = {
  title: "Enterprise Solutions | Leo the Tech Guy",
  description: "Secure AI infrastructure and digital transformation systems.",
};

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-white selection:bg-indigo-100 font-sans text-slate-900">
      <Navbar />
      
      <ServiceHero 
        title="Future-Proof Architecture."
        description="We help large organizations act like agile startups without compromising on security, compliance, or reliability."
        ctaText="Request Enterprise Consultation"
        ctaLink="/contact"
        themeColor="indigo"
        videoSrc="/videos/hero-video3.mp4"
      />
      
      {/* The Methodology */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="lg:w-1/3 sticky top-32">
                     <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Methodology</span>
                     <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Digital Transformation Protocol.</h2>
                     <p className="text-lg text-slate-600 leading-relaxed">
                         Legacy systems shouldn't stifle innovation. We build bridge architectures that allow you to modernize iteratively, reducing risk while unlocking new capabilities.
                     </p>
                </div>
                <div className="lg:w-2/3 grid gap-12">
                    {/* Step 1 */}
                    <div className="group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">01</div>
                            <h3 className="text-2xl font-bold text-slate-900">Audit & Security Review</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-indigo-500 transition-colors duration-300">
                            We perform a rigorous audit of your existing infrastructure, identifying security vulnerabilities, data silos, and technical debt that impedes growth.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">02</div>
                            <h3 className="text-2xl font-bold text-slate-900">Cloud-Native Architecture</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-indigo-500 transition-colors duration-300">
                            We re-architect critical workflows using microservices and serverless patterns. This decouples monolithic dependencies, allowing teams to ship faster.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">03</div>
                            <h3 className="text-2xl font-bold text-slate-900">AI Governance & Deployment</h3>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed pl-14 border-l-2 border-slate-200 group-hover:border-indigo-500 transition-colors duration-300">
                            We deploy private, secure AI models within your VPC. Your data never leaves your control, enabling you to leverage LLMs for internal knowledge management safely.
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
                 <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Enterprise Infrastructure.</h2>
                 <p className="text-xl text-slate-600">
                     Systems built for scale, compliance, and resilience.
                 </p>
            </div>

            <div className="space-y-24">
            
                {/* Service Block 1: Digital Transformation */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
                            <GitBranch className="w-4 h-4" /> Modernization
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Digital Transformation</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                             Modernize legacy systems without disrupting operations. We re-engineer workflows to be API-first and cloud-native, enabling rapid innovation and reducing maintenance costs.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Legacy Migration</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">API Architecture</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Cloud Strategy</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Process Automation</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/Enterprise/Digital Transformation.png"
                                alt="Digital Transformation"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-indigo-900/0 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Service Block 2: Enterprise AI */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2">
                         <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/Enterprise/Enterprise AI Knowledge Systems.png"
                                alt="Enterprise Knowledge Systems"
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                             <div className="absolute inset-0 bg-indigo-900/40" />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium mb-6">
                            <ShieldCheck className="w-4 h-4" /> Security
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Enterprise AI Knowledge Systems</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Deploy private, secure AI that allows your teams to query institutional knowledge instantly. Full control over data privacy and role-based access.
                        </p>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Private LLMs</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">RAG Pipelines</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Role-Based Access</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Data Sovereignty</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Block 3: DevSecOps */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-sm font-medium mb-6">
                            <Lock className="w-4 h-4" /> Resilience
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">DevSecOps & Security</h3>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Security baked into the pipeline. Automated compliance checks, vulnerability scanning, and IAM management ensure your code is secure before it ever ships.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Secure CI/CD</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Vulnerability Scan</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Compliance Audit</span>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-600 mr-3 mt-0.5 shrink-0" />
                                <span className="text-slate-700 font-medium">Penetration Testing</span>
                            </div>
                        </div>
                    </div>
                     <div className="lg:w-1/2 order-1 lg:order-2">
                         <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] relative group shadow-lg">
                           <Image 
                                src="/images/Enterprise/DevSecOps & Security.png"
                                alt="DevSecOps Security"
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
                      <h2 className="text-3xl md:text-5xl font-bold mb-6">Enterprise-Grade Reliability.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-8">
                          We design for five-nines uptime. Our infrastructure is redundant, secure, and compliant with international standards.
                      </p>
                      <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors">
                          Schedule Consultation <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-indigo-400">SOC2 Ready</h4>
                          <p className="text-sm text-slate-400">Security controls built-in.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-indigo-400">Disaster Recovery</h4>
                          <p className="text-sm text-slate-400">RPO/RTO designed for zero loss.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-indigo-400">Data Sovereignty</h4>
                          <p className="text-sm text-slate-400">Full control over where data lives.</p>
                      </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                          <h4 className="font-bold text-lg mb-2 text-indigo-400">IAM Integrated</h4>
                          <p className="text-sm text-slate-400">Connects with Okta/Azure AD.</p>
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
                        <div className="text-5xl font-bold mb-2 text-slate-900">SOC2</div>
                        <div className="text-indigo-600 font-medium">Compliance Ready</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">100%</div>
                        <div className="text-indigo-600 font-medium">Data Sovereignty</div>
                    </div>
                    <div className="p-4">
                        <div className="text-5xl font-bold mb-2 text-slate-900">24/7</div>
                        <div className="text-indigo-600 font-medium">System Reliability</div>
                    </div>
               </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
