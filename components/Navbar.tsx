'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'glass border-b border-white/50'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo_symbo.png" 
                alt="LeoTheTechGuy Logo" 
                width={32} 
                height={32}
                className="w-8 h-8 object-contain"
              />
              LeoTheTechGuy
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Services
            </Link>
            {/* <Link href="/media" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Media</Link> */}
            <Link href="/partner" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Partner</Link>
            <Link href="/tech-stack" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Tech Stack</Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link href="/contact" className="group relative px-5 py-2 text-sm font-medium text-[#4C8BFF] bg-white border border-[#4C8BFF]/30 rounded-lg hover:border-[#4C8BFF] hover:shadow-[0_0_15px_rgba(76,139,255,0.2)] transition-all duration-300 overflow-hidden">
              <span className="relative z-10">Work With Me</span>
              <div className="absolute inset-0 h-full w-full bg-[#4C8BFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-100 absolute w-full bg-white/95">
          <div className="px-6 pt-4 pb-6 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50/50">Home</Link>
            
            {/* Mobile Services Submenu */}
            <div className="px-3 py-2">
              <div className="font-medium text-slate-900 mb-2">Services</div>
              <div className="pl-4 space-y-2 border-l-2 border-slate-100">
                 <Link href="/services/sme" className="block text-sm text-slate-600 hover:text-slate-900">SMEs</Link>
                 <Link href="/services/startups" className="block text-sm text-slate-600 hover:text-slate-900">Startups</Link>
                 <Link href="/services/enterprise" className="block text-sm text-slate-600 hover:text-slate-900">Enterprise</Link>
                 <Link href="/services/individuals" className="block text-sm text-slate-600 hover:text-slate-900">Individuals</Link>
                 <Link href="/services" className="block text-sm font-medium text-blue-600 mt-2">View Overview</Link>
              </div>
            </div>

            {/* <Link href="/media" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50/50">Media</Link> */}
            <Link href="/partner" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50/50">Partner</Link>
            <Link href="/tech-stack" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50/50">Tech Stack</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50/50">Contact</Link>
            <div className="pt-4">
              <Link href="/contact" className="block w-full text-center px-5 py-3 text-base font-medium text-[#4C8BFF] border border-[#4C8BFF] rounded-lg bg-white shadow-sm">
                Work With Me
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
