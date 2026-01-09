'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowUpRight, Code2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '@/data/projects';
import ProjectCard from '@/components/ProjectCard';

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <main className="min-h-screen bg-white selection:bg-[#4C8BFF]/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 opacity-60">
           <div className="w-[500px] h-[500px] bg-gradient-to-br from-[#4C8BFF]/20 to-[#10B981]/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium mb-8 shadow-sm">
            <Code2 className="w-4 h-4" />
            <span>Digital Playground</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
            Selected <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C8BFF] to-[#10B981]">
              Works & Experiments.
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed font-normal max-w-2xl text-balance">
            From enterprise-grade platforms to weekend experiments. A collection of projects that push the boundaries of what&apos;s possible with code.
          </p>
        </motion.div>
      </section>

      {/* Filter Section */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-16 sticky top-20 z-40 bg-slate-50/80 backdrop-blur-xl py-4 -mx-4 md:mx-auto">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 transform scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid (Bento) */}
      <section className="pb-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProjects.map((project) => (
               <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Ready to build something <br/> exceptional?
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Let&apos;s turn your complex requirements into a polished, high-performance digital reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Start a Project
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/book" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-900 border border-slate-200 bg-white rounded-full hover:bg-slate-50 transition-all duration-300"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
