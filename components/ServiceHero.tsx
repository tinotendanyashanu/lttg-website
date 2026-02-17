
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Prism from './Prism';
import { motion } from 'framer-motion';


interface ServiceHeroProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  themeColor: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'purple';
  videoSrc?: string;
}

const colorMap = {
  emerald: 'shadow-emerald-500/20 hover:bg-emerald-600 bg-emerald-500',
  blue: 'shadow-blue-600/20 hover:bg-blue-700 bg-blue-600',
  indigo: 'shadow-indigo-600/20 hover:bg-indigo-700 bg-indigo-600',
  amber: 'shadow-amber-500/20 hover:bg-amber-600 bg-amber-500',
  rose: 'shadow-rose-500/20 hover:bg-rose-600 bg-rose-500',
  cyan: 'shadow-cyan-500/20 hover:bg-cyan-600 bg-cyan-500',
  purple: 'shadow-purple-500/20 hover:bg-purple-600 bg-purple-500',
};

const prismColorMap = {
    emerald: 1.0, // Adjust hue shift if needed
    blue: 0.6,
    indigo: 0.7,
    amber: 0.1,
    rose: 0.9,
    cyan: 0.5,
    purple: 0.8
}

export default function ServiceHero({ title, description, ctaText, ctaLink, themeColor, videoSrc }: ServiceHeroProps) {
  return (
    <section className="relative pt-32 pb-32 overflow-hidden bg-slate-950">
      {/* Background: Video or Prism */}
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-60"
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
        ) : (
            <div className="opacity-40 w-full h-full">
                <Prism 
                    animationType="hover"
                    hueShift={prismColorMap[themeColor]}
                    hoverStrength={1.5}
                    scale={4.5}
                />
            </div>
        )}
      </div>
      
      {/* Overlay Gradient for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 text-center md:text-left">
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 text-white"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl"
          >
            {description}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
          >
              <Link href={ctaLink} className={`inline-flex items-center px-8 py-4 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${colorMap[themeColor]}`}>
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
