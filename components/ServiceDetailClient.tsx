"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Service, getServiceIcon } from '@/data/services';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ServiceDetailClient({ service }: { service: Service }) {
  const IconComponent = getServiceIcon(service.icon);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="min-h-screen bg-white selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className="relative h-[85vh] flex items-center overflow-hidden bg-slate-900"
      >
        {/* Parallax Background */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <Image 
            src={service.image} 
            alt={service.title} 
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
          <div 
            className="absolute inset-0 bg-gradient-to-br opacity-40 mix-blend-overlay" 
            style={{ 
              backgroundImage: `radial-gradient(circle at 70% 30%, ${service.accentColor} 0%, transparent 60%)` 
            }} 
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeInUp}>
              <Link 
                href="/services" 
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Services
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div 
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border text-sm font-medium mb-8 backdrop-blur-md"
                style={{ 
                  backgroundColor: `${service.accentColor}15`,
                  borderColor: `${service.accentColor}30`,
                  color: service.accentColor || '#fff'
                }}
              >
                <IconComponent className="w-5 h-5" />
                <span>{service.title}</span>
                {service.completion && service.completion < 100 && (
                  <span className="ml-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                    Coming Soon
                  </span>
                )}
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.05]"
            >
              {service.headline}
              <br />
              <span className="opacity-90" style={{ color: service.accentColor }}>{service.subheadline}</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-light max-w-2xl mb-12"
            >
              {service.longDescription}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link 
                href="/contact" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white rounded-full hover:brightness-110 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                style={{ backgroundColor: service.accentColor || '#4C8BFF' }}
              >
                {service.cta}
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/book" 
                className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300"
              >
                Book a Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="py-32 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">What&apos;s Included</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to {service.outcome.toLowerCase()}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.offerings.map((offering, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <CheckCircle2 className="w-8 h-8 mb-6" style={{ color: service.accentColor }} />
                <p className="font-semibold text-slate-900 text-lg group-hover:text-slate-700 transition-colors">
                  {offering}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-6 lg:px-8 bg-slate-900 border-y border-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
                Why this <span style={{ color: service.accentColor }}>matters.</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-12">
                It&apos;s not just about features. It&apos;s about the tangible impact on your business growth and efficiency.
              </p>
              
              <div className="space-y-8">
                {service.benefits.map((benefit, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <div 
                      className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: `${service.accentColor}20`, color: service.accentColor }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <Image 
                src={service.image} 
                alt="Service outcome" 
                fill
                className="object-cover hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      {service.process && (
        <section className="py-32 px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">How It Works</h2>
              <p className="text-xl text-slate-600">Simple, transparent, and effective.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {service.process.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                    <div 
                      className="text-6xl font-bold mb-6 opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ color: service.accentColor }}
                    >
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack */}
      {service.technologies && (
        <section className="py-24 px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-10">Powered By</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {service.technologies.map((tech, i) => (
                <span 
                  key={i} 
                  className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-32 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {service.faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 lg:px-8 bg-white text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
            Ready to start?
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Let&apos;s discuss how {service.title} can transform your business.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex justify-center items-center px-12 py-6 text-xl font-bold text-white rounded-full hover:brightness-110 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1"
            style={{ backgroundColor: service.accentColor || '#4C8BFF' }}
          >
            Start Project
            <ArrowUpRight className="ml-2 w-6 h-6" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-lg pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-8 pb-8 text-slate-600 leading-relaxed text-lg">{answer}</p>
      </motion.div>
    </div>
  );
}
