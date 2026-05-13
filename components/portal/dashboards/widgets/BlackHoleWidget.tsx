'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlackHoleWidgetProps {
  metrics: {
    deadline: Date;
    daysRemaining: number;
    status: string; // 'safe', 'warning', 'critical', 'swallowed'
    deals: number;
    leads: number;
    isActive: boolean;
  } | null;
}

export default function BlackHoleWidget({ metrics }: BlackHoleWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !metrics) return null;

  const { daysRemaining, status, deals, leads, isActive } = metrics;

  // Determine colors and particles based on status
  let ringColor = 'from-emerald-500/50 to-teal-500/50';
  let coreColor = 'bg-emerald-500/20';
  let textColor = 'text-emerald-400';
  let statusText = 'Orbit Stable';
  let pulseAnimation = 'animate-[pulse_4s_ease-in-out_infinite]';

  if (status === 'swallowed' || !isActive) {
    ringColor = 'from-red-600/80 to-purple-900/80';
    coreColor = 'bg-black/90';
    textColor = 'text-red-500';
    statusText = 'Event Horizon Crossed';
    pulseAnimation = '';
  } else if (status === 'critical') {
    ringColor = 'from-red-500/70 to-orange-500/70';
    coreColor = 'bg-red-500/20';
    textColor = 'text-red-400';
    statusText = 'Critical Gravitational Pull';
    pulseAnimation = 'animate-[pulse_1s_ease-in-out_infinite]';
  } else if (status === 'warning') {
    ringColor = 'from-orange-500/60 to-amber-500/60';
    coreColor = 'bg-orange-500/20';
    textColor = 'text-orange-400';
    statusText = 'Orbit Decaying';
    pulseAnimation = 'animate-[pulse_2s_ease-in-out_infinite]';
  }

  return (
    <div className="relative w-full shrink-0 overflow-hidden rounded-3xl bg-[#0a0a0a] border border-[#1f1f1f] shadow-2xl p-6 sm:p-8 isolate">
      {/* Background stars / grid */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
        
        {/* Left Side: Info & Metrics */}
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-100 to-gray-400 tracking-tight">
              Event Horizon Tracker
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Your contract depends on your activity. Close deals (+15 days) and register leads (+2 days) to extend your lifespan. <strong className="text-red-400 font-medium">Reaching 0 days results in immediate termination.</strong>
            </p>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex min-w-0 flex-col justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Lifespan</span>
              <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                <span className={`text-3xl font-black tracking-tighter ${textColor}`}>{daysRemaining}</span>
                <span className="text-sm font-medium text-gray-500">/ 120</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex min-w-0 flex-col justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deals</span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-2xl font-bold text-white tracking-tighter">{deals}</span>
                <span className="whitespace-nowrap text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+15d ea</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex min-w-0 flex-col justify-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Leads</span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-2xl font-bold text-white tracking-tighter">{leads}</span>
                <span className="whitespace-nowrap text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">+2d ea</span>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-2xl mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity Shield</span>
              <span className={`text-xs font-bold ${textColor}`}>{Math.round((daysRemaining / 120) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className={`h-full rounded-full bg-linear-to-r ${ringColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (daysRemaining / 120) * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mt-2">
             <div className={`w-2 h-2 rounded-full ${textColor} ${pulseAnimation} bg-current`} />
             <span className="text-xs font-medium text-gray-300">{statusText}</span>
          </div>
        </div>

        {/* Right Side: Black Hole Visualization */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0 flex items-center justify-center">
          <AnimatePresence>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {/* Accretion Disk */}
              <motion.div 
                className={`absolute w-[180%] h-[180%] rounded-full bg-linear-to-tr ${ringColor} blur-xl opacity-40`}
                animate={{ rotate: 360 }}
                transition={{ duration: status === 'swallowed' ? 2 : 20, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div 
                className={`absolute w-[140%] h-[140%] rounded-full bg-linear-to-bl ${ringColor} blur-lg opacity-60 mix-blend-screen`}
                animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                transition={{ 
                  rotate: { duration: status === 'swallowed' ? 3 : 15, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              />

              {/* Event Horizon (The Black Hole itself) */}
              <div className={`relative w-32 h-32 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,1)] flex items-center justify-center ${coreColor} backdrop-blur-sm z-10 border border-white/5`}>
                <div className="w-28 h-28 rounded-full bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center overflow-hidden">
                   {/* Inner glow/void effect */}
                   <motion.div 
                     className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,1)_70%)]"
                     animate={{ opacity: [0.5, 0.8, 0.5] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
