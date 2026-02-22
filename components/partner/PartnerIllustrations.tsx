import React from 'react';

// Hero Section Vector Illustration (Abstract Dashboard)
export const HeroIllustration = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="panelGrad" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" stopOpacity="0.8" />
        <stop offset="1" stopColor="#F1F5F9" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="blueGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <filter id="shadow" x="-20" y="-20" width="840" height="640" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="20" stdDeviation="25" floodOpacity="0.05" />
      </filter>
      <filter id="glow" x="-20" y="-20" width="140" height="140" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Main Background Panel */}
    <rect x="50" y="50" width="700" height="500" rx="32" fill="url(#panelGrad)" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#shadow)" />
    
    {/* Header line of the mock UI */}
    <path d="M50 120 L750 120" stroke="#E2E8F0" strokeWidth="1.5" />
    <circle cx="90" cy="85" r="6" fill="#CBD5E1" />
    <circle cx="115" cy="85" r="6" fill="#CBD5E1" />
    <circle cx="140" cy="85" r="6" fill="#CBD5E1" />

    {/* Big Chart Area */}
    <rect x="100" y="160" width="400" height="250" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    
    {/* Grid lines inside chart */}
    <path d="M120 370 L480 370" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4"/>
    <path d="M120 320 L480 320" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4"/>
    <path d="M120 270 L480 270" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4"/>
    <path d="M120 220 L480 220" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4"/>

    {/* Chart Line - Animated looking */}
    <path d="M120 370 Q160 360 200 300 T280 280 T360 200 T440 240 T480 180" stroke="url(#accentGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M120 370 Q160 360 200 300 T280 280 T360 200 T440 240 T480 180 L480 370 L120 370 Z" fill="url(#accentGrad)" opacity="0.1" />

    {/* Floating Data Points */}
    <circle cx="280" cy="280" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="360" cy="200" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="480" cy="180" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" filter="url(#glow)" />

    {/* Side Metric Cards */}
    <rect x="540" y="160" width="160" height="115" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="560" y="180" width="30" height="30" rx="8" fill="#D1FAE5" />
    <path d="M568 195 L582 195 M575 188 L575 202" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
    <rect x="560" y="230" width="80" height="8" rx="4" fill="#E2E8F0" />
    <rect x="560" y="250" width="120" height="6" rx="3" fill="#F1F5F9" />

    <rect x="540" y="295" width="160" height="115" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="560" y="315" width="30" height="30" rx="8" fill="#DBEAFE" />
    <path d="M570 330 A 5 5 0 1 0 580 330 A 5 5 0 1 0 570 330" fill="none" stroke="#2563EB" strokeWidth="2" />
    <rect x="560" y="365" width="60" height="8" rx="4" fill="#E2E8F0" />
    <rect x="560" y="385" width="100" height="6" rx="3" fill="#F1F5F9" />

    {/* Bottom Activity Bar */}
    <rect x="100" y="440" width="600" height="80" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <circle cx="140" cy="480" r="20" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
    <path d="M135 480 L145 480 M140 475 L140 485" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <rect x="180" y="465" width="150" height="8" rx="4" fill="#E2E8F0" />
    <rect x="180" y="485" width="400" height="6" rx="3" fill="#F1F5F9" />
    
    {/* Stylized Floating Accent Panel (Abstract Tech/Deal) */}
    <rect x="680" y="380" width="80" height="100" rx="12" fill="url(#blueGrad)" opacity="0.9" filter="url(#shadow)" />
    <path d="M700 410 L740 410 M700 430 L730 430 M700 450 L720 450" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
  </svg>
);

export const DashboardMockupIllustration = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dashGrad" x1="0" y1="0" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#F8FAFC" />
      </linearGradient>
      <filter id="dashShadow" x="-50" y="-50" width="1100" height="700" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="25" stdDeviation="35" floodOpacity="0.08" />
      </filter>
    </defs>

    {/* App Window */}
    <rect x="40" y="20" width="920" height="560" rx="16" fill="url(#dashGrad)" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#dashShadow)" />
    
    {/* Sidebar */}
    <rect x="40" y="20" width="220" height="560" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
    {/* Sidebar un-rounded right edge */}
    <rect x="250" y="20" width="10" height="560" fill="#F8FAFC" />
    <path d="M260 20 L260 580" stroke="#E2E8F0" strokeWidth="1" />
    
    <rect x="70" y="60" width="30" height="30" rx="8" fill="#0F172A" />
    <rect x="115" y="68" width="100" height="14" rx="4" fill="#E2E8F0" />

    <rect x="70" y="140" width="140" height="36" rx="8" fill="#E2E8F0" opacity="0.5" />
    <rect x="85" y="152" width="100" height="12" rx="4" fill="#94A3B8" />

    <rect x="70" y="196" width="140" height="36" rx="8" fill="transparent" />
    <rect x="85" y="208" width="80" height="12" rx="4" fill="#CBD5E1" />

    <rect x="70" y="252" width="140" height="36" rx="8" fill="transparent" />
    <rect x="85" y="264" width="110" height="12" rx="4" fill="#CBD5E1" />

    {/* Main Content Area */}
    <rect x="300" y="60" width="200" height="16" rx="4" fill="#94A3B8" />
    <rect x="300" y="90" width="300" height="10" rx="4" fill="#CBD5E1" />

    {/* Metric Cards */}
    <rect x="300" y="140" width="200" height="120" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="320" y="160" width="40" height="40" rx="10" fill="#D1FAE5" />
    <rect x="320" y="215" width="80" height="16" rx="4" fill="#E2E8F0" />
    <rect x="320" y="240" width="120" height="8" rx="4" fill="#F1F5F9" />

    <rect x="520" y="140" width="200" height="120" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="540" y="160" width="40" height="40" rx="10" fill="#DBEAFE" />
    <rect x="540" y="215" width="70" height="16" rx="4" fill="#E2E8F0" />
    <rect x="540" y="240" width="140" height="8" rx="4" fill="#F1F5F9" />

    <rect x="740" y="140" width="180" height="120" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="760" y="160" width="40" height="40" rx="10" fill="#F3E8FF" />
    <rect x="760" y="215" width="90" height="16" rx="4" fill="#E2E8F0" />
    <rect x="760" y="240" width="100" height="8" rx="4" fill="#F1F5F9" />

    {/* Data Table Mockup */}
    <rect x="300" y="290" width="620" height="250" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <path d="M300 350 L920 350" stroke="#F1F5F9" strokeWidth="1" />
    <path d="M300 410 L920 410" stroke="#F1F5F9" strokeWidth="1" />
    <path d="M300 470 L920 470" stroke="#F1F5F9" strokeWidth="1" />

    {/* Table Rows */}
    {[320, 380, 440, 500].map((y, i) => (
      <g key={i}>
        <rect x="330" y={y} width="120" height="12" rx="4" fill={i === 0 ? "#CBD5E1" : "#E2E8F0"} />
        <rect x="480" y={y} width="150" height="12" rx="4" fill={i === 0 ? "#CBD5E1" : "#F1F5F9"} />
        <rect x="680" y={y} width="100" height="12" rx="4" fill={i === 0 ? "#CBD5E1" : "#F1F5F9"} />
        <rect x="830" y={y} width="60" height="12" rx="4" fill={i === 0 ? "#CBD5E1" : (i % 2 === 0 ? "#D1FAE5" : "#DBEAFE")} />
      </g>
    ))}
  </svg>
);

// Background Grid Pattern
export const BackgroundGrid = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);
