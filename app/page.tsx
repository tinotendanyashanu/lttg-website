"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Code2, BrainCircuit, ShieldCheck, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

const HERO_VIDEOS = [
  '/videos/hero-video1.mp4',
  '/videos/hero-video2.mp4',
  '/videos/hero-video3.mp4'
];

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
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

  return (
    <main className="min-h-screen relative">
      <Navbar />
      
      {/* Audio Player */}
      <audio ref={audioRef} src="/audio/LeoVoice.mp3" loop />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-end pb-20 overflow-hidden group">
        {/* Background Videos */}
        <div className="absolute inset-0 w-full h-full z-0 bg-slate-900">
          {HERO_VIDEOS.map((src, index) => (
            <video 
              key={src}
              ref={(el) => { videoRefs.current[index] = el }}
              muted 
              playsInline
              onEnded={() => handleVideoEnded(index)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <source src={src} type="video/mp4" />
            </video>
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/60 z-20" />
        </div>

        {/* Mute Toggle */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-32 right-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        <div className="relative z-30 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.05]">
              Hey, I’m <span className="text-[#10B981]">Leo The Tech Guy.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-100 leading-relaxed mb-10 font-normal max-w-2xl">
              I’m just a normal guy obsessed with technology. I build software, explore AI, test gadgets, break things, fix them, and share the journey with you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/contact" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-[#0071e3] rounded-full hover:bg-[#0077ED] transition-all duration-300 shadow-lg shadow-blue-500/20">
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/portfolio" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300">
                See My Work
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-12">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600 flex items-center justify-center text-xs font-medium text-slate-300">AI</div>
                <div className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600 flex items-center justify-center text-xs font-medium text-slate-300">Dev</div>
                <div className="w-10 h-10 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600 flex items-center justify-center text-xs font-medium text-slate-300">Sec</div>
              </div>
              <p className="text-sm text-slate-300 font-medium tracking-wide">
                Real tech. Real builds. Real results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-12 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">Trusted by innovators and teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
             <div className="text-xl font-bold text-slate-400">PreciAgro</div>
             <div className="text-xl font-bold text-slate-400">TechFlow</div>
             <div className="text-xl font-bold text-slate-400">InnovateX</div>
             <div className="text-xl font-bold text-slate-400">FutureScale</div>
             <div className="text-xl font-bold text-slate-400">DigitalGeeks</div>
          </div>
        </div>
      </section>

      {/* Mini Intro */}
      <section className="relative z-10 py-20 bg-slate-50/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-2xl lg:text-3xl text-slate-800 leading-relaxed font-light">
            I’m a tech geek at heart. I dive into <span className="font-semibold text-[#10B981]">AI</span>, <span className="font-semibold text-[#4C8BFF]">software engineering</span>, <span className="font-semibold text-emerald-500">cybersecurity</span>, automation, and anything that sparks curiosity. I also build startups and tackle problems I believe technology can solve. If you’re into building, learning, and creating cool things, welcome.
          </p>
        </div>
      </section>

      {/* Services Preview */}
      <section className="relative z-10 py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "AI & Automation",
              desc: "I build smart systems that automate work, save time, and power businesses.",
              icon: <BrainCircuit className="w-8 h-8 text-[#10B981]" />
            },
            {
              title: "Software Development",
              desc: "Clean, modern, scalable applications built with care.",
              icon: <Code2 className="w-8 h-8 text-[#4C8BFF]" />
            },
            {
              title: "Cybersecurity",
              desc: "Security breakdowns, best practices, and helping founders protect what matters.",
              icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />
            },
            {
              title: "Tech Mentorship",
              desc: "Guiding creators and founders who want to build something meaningful.",
              icon: <Lightbulb className="w-8 h-8 text-amber-500" />
            }
          ].map((service, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-4 p-3 bg-slate-50 rounded-xl w-max group-hover:bg-blue-50 transition-colors">{service.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">{service.desc}</p>
              <Link href="/services" className="text-sm font-medium text-[#4C8BFF] hover:text-blue-700 inline-flex items-center">
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
              Book a 15-minute call
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Projects Teaser */}
      <section className="relative z-10 py-32 bg-slate-50 overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Text Content */}
            <div className="w-full lg:w-1/2 relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-medium text-blue-600 mb-8 shadow-sm">
                <Code2 className="w-4 h-4" />
                <span>Selected Works</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight text-slate-900">
                Engineering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C8BFF] to-[#10B981]">future of tech.</span>
              </h2>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                It&apos;s not just about code. It&apos;s about the physics of interaction, the logic of AI, and the beauty of a well-crafted system. Explore how I turn complex problems into elegant solutions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/portfolio" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#4C8BFF] text-white font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1">
                  View Portfolio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/services" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300">
                  My Services
                </Link>
              </div>
            </div>

            {/* Visual - Project Preview */}
            <div className="w-full lg:w-1/2 h-[500px] relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-200 group">
               <Image 
                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                 alt="Project Dashboard" 
                 fill 
                 className="object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
               
               {/* Overlay Text or Badge */}
               <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Enterprise Dashboard</h3>
                        <p className="text-slate-300 text-sm">Next.js • TypeScript • Tailwind</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="relative z-10 py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#4C8BFF]/10 to-[#10B981]/10 rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 border border-blue-100">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Validate your AI idea before building.</h2>
            <p className="text-lg text-slate-600 mb-8">
              Don&apos;t waste time and money on the wrong features. Get my free 10-point checklist to see if your project is ready for AI.
            </p>
            <ul className="space-y-3 mb-8">
              {['Save thousands in dev costs', 'Identify technical risks early', 'Clarify your MVP scope'].map((item, i) => (
                <li key={i} className="flex items-center text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
            <form className="flex flex-col sm:flex-row gap-4">
              <input type="email" placeholder="Enter your email" className="flex-grow px-4 py-3 rounded-lg border border-slate-200 focus:border-[#4C8BFF] focus:ring-2 focus:ring-[#4C8BFF]/20 outline-none" />
              <button className="px-6 py-3 bg-[#4C8BFF] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                Get the Checklist
              </button>
            </form>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-64 h-80 shadow-2xl rounded-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
              <Image 
                src="/images/PDF Mockup.png" 
                alt="AI Checklist PDF" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="relative z-10 py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
               <Image 
                 src="/images/Leo's Portrait.png" 
                 alt="Leo The Tech Guy" 
                 fill 
                 className="object-cover" 
               />
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              I’m not trying to be perfect or pretend to be someone I’m not.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              I learn, experiment, build, break, fix, and share. I use technology to solve problems and help people turn ideas into real products.
            </p>
            <Link href="/about" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-[#4C8BFF] bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200">
              About Me
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Call-to-Action */}
      <section className="relative z-10 py-24 bg-[#4C8BFF] text-white text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to build something?</h2>
          <p className="text-xl text-blue-100 mb-10">Let’s create something meaningful.</p>
          <Link href="/contact" className="inline-flex justify-center items-center px-10 py-5 text-lg font-bold text-[#4C8BFF] bg-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Work With Me
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
