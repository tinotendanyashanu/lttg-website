'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertTriangle, ArrowRight, Terminal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden selection:bg-red-500/30">
      {/* Glitch Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-glitch-1"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-500/50 animate-glitch-2"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-2 bg-green-500/50 animate-glitch-3"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center max-w-7xl mx-auto w-full pt-20">
          
          {/* Animated 404 Glitch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8"
          >
            <h1 className="text-9xl md:text-[12rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500 animate-pulse relative z-10">
              404
            </h1>
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold tracking-tighter text-red-500 blur-sm animate-glitch-text opacity-50 -z-10 translate-x-1">
              404
            </div>
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold tracking-tighter text-blue-500 blur-sm animate-glitch-text-2 opacity-50 -z-10 -translate-x-1">
              404
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-mono text-sm mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>SYSTEM_ERROR: COORDINATES_INVALID</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Lost in Hyperspace?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
              The page you are looking for has been moved, deleted, or possibly never existed in this dimension.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/"
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all duration-300 flex items-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Base
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link 
                href="/services"
                className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all flex items-center"
              >
                <Terminal className="w-5 h-5 mr-2" />
                Run Diagnostics
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500 border-t border-white/10 pt-8 w-full max-w-3xl"
          >
             <Link href="/services/sme" className="hover:text-white transition-colors">SME Systems</Link>
             <Link href="/services/startups" className="hover:text-white transition-colors">Startups</Link>
             <Link href="/services/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
             <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </motion.div>

        </div>
        
        <div className="mt-auto">
            <Footer />
        </div>
      </div>
      
      {/* CSS for custom glitch animations if not already in global */}
      <style jsx global>{`
        @keyframes glitch-1 {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes glitch-text {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch-text { animation: glitch-text 2s infinite linear alternate-reverse; }
        .animate-glitch-text-2 { animation: glitch-text 3s infinite linear alternate; }
      `}</style>
    </main>
  );
}