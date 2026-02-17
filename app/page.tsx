"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Code2, BrainCircuit, ShieldCheck, Lightbulb, Volume2, VolumeX, Youtube, Twitter, Play, Terminal, Layout, Database } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HERO_VIDEOS = [
  '/videos/hero-video1.mp4',
  '/videos/hero-video2.mp4',
  '/videos/hero-video3.mp4'
];

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  const [isHeroReady, setIsHeroReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  }, [isMuted]);

  useEffect(() => {
    // Play the current video and reset it
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(e => console.log("Video play failed:", e));
    }

    // Pause other videos to prevent them from triggering onEnded or using resources
    videoRefs.current.forEach((video, index) => {
      if (index !== currentVideoIndex && video) {
        // Optional: Pause after a delay to allow crossfade? 
        // For now, let's just pause them to ensure logic correctness. 
        // If we want smooth crossfade, we might need to let them play for a bit.
        // But if they are hidden (opacity 0), pausing them is fine.
        // The CSS transition takes 2000ms. 
        // If we pause immediately, the outgoing video freezes.
        // Let's try NOT pausing them immediately, but ensuring onEnded is scoped.
        // Actually, if we don't pause them, they might finish and trigger onEnded?
        // We will guard onEnded.
      }
    });
  }, [currentVideoIndex]);

  const handleVideoEnded = (index: number) => {
    if (index === currentVideoIndex) {
      setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }
  };

  const handleVideoReady = (index: number) => {
    setLoadedVideos(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (index === 0) {
      setIsHeroReady(true);
    }
  };

  return (
    <main className="min-h-screen relative">
      <Navbar />
      
      {/* Audio Player */}
      <audio ref={audioRef} src="/audio/LeoVoice.mp3" loop />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden group" suppressHydrationWarning>
        {/* Background Videos */}
        <div className="absolute inset-0 w-full h-full z-0 bg-[#050505]">
          {HERO_VIDEOS.map((src, index) => (
            <video 
              key={src}
              ref={(el) => { videoRefs.current[index] = el }}
              muted 
              playsInline
              preload={index === 0 ? "auto" : "metadata"}
              onCanPlayThrough={() => handleVideoReady(index)}
              onEnded={() => handleVideoEnded(index)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                index === currentVideoIndex && loadedVideos.has(index) ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <source src={src} type="video/mp4" />
            </video>
          ))}
          {/* Subtle Ambient Overlay */}
          <div className={`absolute inset-0 bg-slate-900/60 z-20 transition-opacity duration-1000 ${isHeroReady ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Minimalist Loader */}
          {!isHeroReady && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900">
               <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Mute Toggle */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          suppressHydrationWarning
          className="absolute top-4 right-16 md:top-24 md:right-8 z-[60] p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <div className="relative z-30 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.05]">
              AI & Digital <span className="text-[#10B981]">Infrastructure Architect.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-100 leading-relaxed mb-10 font-normal max-w-2xl">
              I help businesses build scalable systems that run themselves. From AI automation to enterprise cloud infrastructure, I design the technology that powers your growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/book" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-[#0071e3] rounded-full hover:bg-[#0077ED] transition-all duration-300 shadow-lg shadow-blue-500/20">
                Book a Strategy Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/partner" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300">
                Partner With Leo
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-12 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">Infrastructure & Systems Deployed For</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
             <div className="text-xl font-bold text-slate-400">PreciAgro</div>
             <div className="text-xl font-bold text-slate-400">UpperhandZim</div>
             <div className="text-xl font-bold text-slate-400">ZimPrep</div>
             <div className="text-xl font-bold text-slate-400">FutureScale</div>
             <div className="text-xl font-bold text-slate-400">DigitalGeeks</div>
          </div>
        </div>
      </section>

      {/* Mini Intro */}
      <section className="relative z-10 py-20 bg-slate-50/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-2xl lg:text-3xl text-slate-800 leading-relaxed font-light">
            I bridge the gap between <span className="text-[#10B981] font-medium">business strategy</span> and <span className="text-blue-600 font-medium">technical execution</span>. Adaptable, disciplined, and focused on building <span className="text-amber-500 font-medium">systems that last</span>. No buzzwords, just results.
          </p>
        </div>
      </section>

      {/* Services Preview */}
      <section className="relative z-10 py-24 px-6 lg:px-8 max-w-7xl mx-auto" suppressHydrationWarning>
        <h2 className="sr-only">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "SME Systems",
              desc: "Automate workflows, deploy CRM engines, and cut operational costs with intelligent systems.",
              icon: <BrainCircuit className="w-8 h-8 text-[#10B981]" />,
              link: "/services/sme"
            },
            {
              title: "Startup Scaling",
              desc: "MVP development, product integration, and cloud architecture for high-growth founders.",
              icon: <Code2 className="w-8 h-8 text-blue-600" />,
              link: "/services/startups"
            },
            {
              title: "Enterprise AI",
              desc: "Digital transformation, secure RAG deployment, and department-wide automation.",
              icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
              link: "/services/enterprise"
            },
            {
              title: "Consulting",
              desc: "Private strategy sessions and infrastructure advisory for leaders and creators.",
              icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
              link: "/book"
            }
          ].map((service, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-4 p-3 bg-slate-50 rounded-xl w-max group-hover:bg-blue-50 transition-colors">{service.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">{service.desc}</p>
              <Link href={service.link} className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                Learn more <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How I Work */}
      <section className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How I Work</h2>
            <p className="text-lg text-slate-600">Simple, transparent, and focused on results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>
            
            {[
              { step: "01", title: "Discovery Call", desc: "We discuss your idea, goals, and feasibility. No pressure, just clarity." },
              { step: "02", title: "Plan & Proposal", desc: "I create a technical roadmap and a clear proposal with timeline and budget." },
              { step: "03", title: "Build & Deliver", desc: "I build your product with regular updates, then launch it to the world." }
            ].map((item, i) => (
              <div key={i} className="text-center bg-white">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-3xl font-bold text-slate-300">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/book" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all duration-200">
              Book a Strategy Session
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Projects Teaser */}
      {/* Tech Stack Preview */}
      <section className="relative z-10 py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">The Stack.</h2>
                <p className="text-lg text-slate-600">Built on the bleeding edge for speed and scale.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { name: "Next.js", icon: <Terminal className="w-6 h-6 text-slate-900" /> },
                    { name: "TypeScript", icon: <Code2 className="w-6 h-6 text-blue-600" /> },
                    { name: "Tailwind CSS", icon: <Layout className="w-6 h-6 text-cyan-500" /> },
                    { name: "Supabase", icon: <Database className="w-6 h-6 text-emerald-500" /> }
                ].map((tech, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="mb-4 p-4 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                            {tech.icon}
                        </div>
                        <span className="font-bold text-slate-900">{tech.name}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center">
                 <Link href="/tech-stack" className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    View Full Tech Stack <ArrowRight className="ml-2 w-4 h-4" />
                 </Link>
            </div>
        </div>
      </section>

      {/* Engineering Case Studies (Selected Works) */}
      <section className="relative z-10 py-32 bg-[#0A0A0A] text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="mb-24">
                <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6">Selected Works.</h2>
                <p className="text-xl text-neutral-400 max-w-xl font-medium">Infrastructure that defines industries.</p>
            </div>

            <div className="flex flex-col gap-32">
                {/* Project 1 */}
                <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <div className="order-2 lg:order-1">
                        <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4 block">AI & Agriculture</span>
                        <h3 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight group-hover:text-emerald-400 transition-colors">PreciAgro</h3>
                        <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
                            An intelligent agricultural system that Diagnoses crops, predicts yields, and provides actionable farming insights using advanced AI models.
                        </p>
                        <ul className="grid grid-cols-2 gap-y-4 gap-x-8 mb-10 text-neutral-300">
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">AI</span> Powered
                             </li>
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">IoT</span> Integrated
                             </li>
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">Real-time</span> Diagnosis
                             </li>
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">Scalable</span> Cloud Arch
                             </li>
                        </ul>
                        <Link href="https://www.preciagro.com/" className="inline-flex items-center text-white font-semibold hover:opacity-70 transition-opacity">
                            View Live Project <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="relative aspect-[16/10] bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                             <Image 
                                src="/Preciagrethumb.png" 
                                alt="PreciAgro Dashboard"
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                             />
                        </div>
                    </div>
                </div>

                {/* Project 2 */}
                <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                     <div className="order-1">
                        <div className="relative aspect-[16/10] bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                             <Image 
                                src="/zimprep.png" 
                                alt="ZimPrep Interface"
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                             />
                        </div>
                    </div>
                    <div className="order-2">
                        <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-4 block">AI EdTech SaaS</span>
                        <h3 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight group-hover:text-yellow-400 transition-colors">ZimPrep</h3>
                        <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
                            A SaaS platform for high school student revision powered by AI. Intelligent tutoring that adapts to every student's learning pace.
                        </p>
                         <ul className="grid grid-cols-2 gap-y-4 gap-x-8 mb-10 text-neutral-300">
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">AI</span> Powered
                             </li>
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">Exam</span> Focused
                             </li>
                             <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">Real-time</span> Progress
                             </li>
                              <li className="flex items-center gap-3 border-l text-sm pl-4 border-neutral-800">
                                <span className="block font-bold text-white">Mobile</span> First
                             </li>
                        </ul>
                        <Link href="https://zimprep.vercel.app/" className="inline-flex items-center text-white font-semibold hover:opacity-70 transition-opacity">
                            View Live Platform <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                   <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-slate-900 leading-[1.1]">
                        I don't just write code. I build assets.
                   </h2>
                </div>
                <div className="lg:col-span-7 lg:pl-12 space-y-8">
                    <p className="text-2xl text-slate-500 font-medium leading-relaxed">
                        Most developers focus on features. I focus on <span className="text-slate-900">leverage</span>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Architectural Rigor</h4>
                            <p className="text-slate-500">
                                Systems designed to survive scale. No hacks, no shortcuts. Just clean, maintainable, enterprise-grade engineering.
                            </p>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-900 mb-2">Business First</h4>
                            <p className="text-slate-500">
                                Technology is an expense until it solves a problem. I align every technical decision with your revenue goals.
                            </p>
                        </div>
                    </div>
                    <div className="pt-8">
                         <Link href="/about" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors">
                            The Philosophy <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Premium Lead Magnet */}
      <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-[#F5F5F7] rounded-[3rem] overflow-hidden p-12 lg:p-24 relative">
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div>
                     <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-6">The AI Readiness Protocol.</h2>
                     <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                         A rigorous 10-point architectural audit to determine if your infrastructure is ready for enterprise AI integration.
                     </p>
                     
                     <div className="bg-white p-2 rounded-full shadow-sm max-w-md flex pl-6 border border-slate-200 focus-within:ring-2 ring-slate-900/10 transition-all">
                        <input type="email" placeholder="email@company.com" className="bg-transparent flex-grow outline-none text-slate-900 placeholder:text-slate-400" />
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
                            Download
                        </button>
                     </div>
                     <p className="text-xs text-slate-400 mt-4 ml-6">Free for founders. No spam.</p>
                 </div>
                 <div className="flex justify-center items-center">
                     <div className="relative w-[300px] h-[400px] bg-white shadow-2xl rounded-2xl border border-slate-200 rotate-3 hover:rotate-0 transition-all duration-700 flex flex-col items-center justify-center p-8 text-center group">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl mb-6 flex items-center justify-center text-white">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">AI Protocol</h3>
                        <p className="text-slate-400 text-sm mb-8">Architectural Audit v2.0</p>
                        <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                            <div className="w-2/3 h-full bg-slate-900"></div>
                        </div>
                        <div className="w-3/4 h-2 bg-slate-100 rounded-full mb-3"></div>
                        <div className="w-1/2 h-2 bg-slate-100 rounded-full"></div>
                        
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                 </div>
             </div>
          </div>
      </section>

      {/* Latest Insights - Clean Card Style */}
      {false && (
      <section className="py-32 max-w-[1400px] mx-auto px-6 lg:px-8">
           <div className="flex items-end justify-between mb-16">
               <div>
                   <h2 className="text-4xl font-semibold text-slate-900 tracking-tight mb-4">Engineering Log.</h2>
                   <p className="text-lg text-slate-500">Documenting the process of building in public.</p>
               </div>
               <Link href="/media" className="hidden md:inline-flex items-center font-medium text-slate-900 border-b border-slate-200 pb-1 hover:border-slate-900 transition-colors">
                 View Archive <ArrowRight className="ml-2 w-4 h-4" />
               </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                   { title: "The End of Localhost", tag: "Infrastructure", date: "Oct 12" },
                   { title: "Building Autonomous Agents", tag: "AI Engineering", date: "Oct 08" },
                   { title: "Why Next.js Won", tag: "Opinion", date: "Sep 24" }
               ].map((post, i) => (
                   <Link key={i} href="/media" className="group block">
                        <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-6 overflow-hidden relative">
                             {/* Placeholder generic abstract gradient for thumbnails */}
                             <div className={`absolute inset-0 bg-gradient-to-br ${i === 0 ? 'from-blue-100 to-slate-200' : i === 1 ? 'from-emerald-100 to-slate-200' : 'from-amber-100 to-slate-200'} group-hover:scale-105 transition-transform duration-700`}></div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{post.tag}</span>
                            <span className="text-xs text-slate-400">{post.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                   </Link>
               ))}
           </div>
      </section>
      )}

      {/* FAQ - Minimalist Accordion */}
      <section className="py-24 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-slate-900 mb-12">Common Questions.</h2>
            <div className="space-y-8">
              {[
                {
                   q: "How do we start?",
                   a: "We begin with a Discovery Audit. I analyze your current infrastructure and business goals before proposing a roadmap."
                },
                {
                   q: "Do you work with non-technical founders?",
                   a: "Exclusively. My role is to translate business outcomes into technical reality, managing the complexity so you don't have to."
                },
                {
                   q: "What is the typical timeline?",
                   a: "MVPs usually launch in 4-8 weeks. Enterprise migrations vary by complexity. Speed is a priority, but never at the cost of stability."
                }
              ].map((faq, i) => (
                <div key={i} className="group">
                   <h3 className="text-xl font-medium text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">{faq.q}</h3>
                   <p className="text-slate-500 leading-relaxed max-w-2xl">{faq.a}</p>
                </div>
              ))}
            </div>
        </div>
      </section>
      
      {/* Final CTA - High Impact */}
      <section className="py-40 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8">Ready to scale?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/contact" className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-neutral-200 transition-colors">
                Book a Strategy Call
             </Link>
             <Link href="/services" className="px-10 py-5 text-lg font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                Explore Services
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
