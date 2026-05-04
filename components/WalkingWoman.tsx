'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WalkingWomanProps {
  state?: 'idle' | 'walking' | 'typing' | 'success';
  className?: string;
}

export default function WalkingWoman({ state = 'walking', className = "" }: WalkingWomanProps) {
  // Brand Colors
  const colors = {
    primary: '#22c55e', // Green
    secondary: '#16a34a', // Darker Green
    dark: '#050508', // Black
    light: '#ffffff', // White
    skin: '#fde6d2'  // Neutral Skin Tone
  };

  const walkDuration = 1.2;

  // Animation variants for limbs
  const legVariants: any = {
    walking: (delay: number) => ({
      rotate: [25, -25, 25],
      transition: {
        duration: walkDuration,
        repeat: Infinity,
        ease: "linear",
        delay: delay
      }
    }),
    idle: { rotate: 0 }
  };

  const hairVariants: any = {
    walking: {
      rotate: [-5, 5, -5],
      scaleX: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const bodyVariants: any = {
    walking: {
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <motion.svg
        width="300"
        height="400"
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={bodyVariants}
        animate={state === 'walking' ? "walking" : "idle"}
      >
        {/* Shadow */}
        <motion.ellipse 
          cx="150" cy="370" rx="50" ry="10" 
          fill={colors.dark} 
          fillOpacity="0.1" 
          animate={{ rx: [50, 45, 50], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />

        {/* --- BACK LIMBS --- */}
        {/* Back Leg */}
        <motion.g
          variants={legVariants}
          custom={walkDuration / 2}
          style={{ originX: "150px", originY: "230px" }}
        >
          <path d="M150 230L140 300L160 360" stroke={colors.dark} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          <path d="M160 360H180" stroke={colors.dark} strokeWidth="14" strokeLinecap="round" opacity="0.6" />
        </motion.g>

        {/* Back Arm */}
        <motion.g
          variants={legVariants}
          custom={0}
          style={{ originX: "150px", originY: "130px" }}
        >
          <path d="M150 130L170 200" stroke={colors.primary} strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        </motion.g>

        {/* --- BODY --- */}
        {/* Torso / Dress */}
        <path d="M130 120C130 120 120 230 125 240H175C180 230 170 120 170 120H130Z" fill={colors.primary} />
        <path d="M130 120L150 110L170 120" stroke={colors.secondary} strokeWidth="2" fill="none" />
        
        {/* Neck */}
        <rect x="145" y="105" width="10" height="15" fill={colors.skin} />

        {/* Head */}
        <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}>
          {/* Hair (Back) */}
          <motion.path 
            variants={hairVariants}
            d="M130 60C110 60 90 120 95 180" 
            stroke={colors.dark} strokeWidth="25" strokeLinecap="round" 
          />
          
          {/* Face */}
          <circle cx="150" cy="75" r="30" fill={colors.skin} />
          
          {/* Features */}
          <rect x="165" y="70" width="8" height="2" rx="1" fill={colors.dark} /> {/* Eye */}
          <path d="M175 85C175 85 170 88 165 85" stroke={colors.dark} strokeWidth="1.5" strokeLinecap="round" /> {/* Mouth */}
          
          {/* Hair (Front/Top) */}
          <path d="M125 60C125 40 175 40 175 70C175 85 165 100 160 100" stroke={colors.dark} strokeWidth="15" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* --- FRONT LIMBS --- */}
        {/* Front Leg */}
        <motion.g
          variants={legVariants}
          custom={0}
          style={{ originX: "150px", originY: "230px" }}
        >
          <path d="M150 230L160 300L140 360" stroke={colors.dark} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M140 360H120" stroke={colors.dark} strokeWidth="16" strokeLinecap="round" />
        </motion.g>

        {/* Front Arm */}
        <motion.g
          variants={legVariants}
          custom={walkDuration / 2}
          style={{ originX: "150px", originY: "130px" }}
        >
          <path d="M150 130L130 200" stroke={colors.primary} strokeWidth="14" strokeLinecap="round" />
          <circle cx="130" cy="200" r="7" fill={colors.skin} />
        </motion.g>

        {/* Accent Details */}
        <rect x="140" y="140" width="20" height="2" fill={colors.secondary} fillOpacity="0.5" />
      </motion.svg>
    </div>
  );
}
