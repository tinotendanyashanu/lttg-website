import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Youtube, Instagram, Twitter, ExternalLink, Play, ArrowRight } from 'lucide-react';

export const metadata = {
  title: "Learn System Architecture | Leo The Tech Guy",
  description: "Free tutorials, system breakdowns, and engineering insights. Learn how to build scalable AI infrastructure.",
};

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Learn How Systems <span className="text-[#FF0000]">Are Built.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              I believe in building in public and sharing the knowledge. No gatekeeping. Just practical engineering guides and architectural patterns.
            </p>
            <div className="flex justify-center gap-4">
                 <a href="https://www.youtube.com/@LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-[#FF0000] text-white rounded-full font-bold hover:bg-red-700 transition-colors">
                    <Youtube className="mr-2 w-5 h-5" />
                    Subscribe
                </a>
                 <a href="https://instagram.com/leothetechguy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors">
                    <Instagram className="mr-2 w-5 h-5" />
                    Follow
                </a>
            </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 border-l-4 border-[#FF0000] pl-4">Latest Breakdowns</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder Video Cards since we don't have real thumbnails right now, using gradients/colors */}
            {[
                { title: "How to Build a SaaS in 2 Hours", views: "12K views", color: "bg-slate-800" },
                { title: "AI Agents Explained", views: "8.5K views", color: "bg-slate-800" },
                { title: "Next.js 14 Server Actions Guide", views: "15K views", color: "bg-slate-800" }
            ].map((video, i) => (
                <div key={i} className="group cursor-pointer">
                    <div className={`aspect-video rounded-xl ${video.color} relative overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 backdrop-blur-sm transition-colors">
                                <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{video.title}</h3>
                    <p className="text-slate-500 text-sm mt-2">{video.views}</p>
                </div>
            ))}
          </div>
          
           <div className="mt-12 text-center">
                <a href="https://www.youtube.com/@LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 font-bold hover:underline">
                    View full channel <ArrowRight className="ml-1 w-4 h-4" />
                </a>
            </div>
        </div>
      </section>

      {/* Social Feed Concept */}
      <section className="py-24 bg-slate-50">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="flex items-center justify-between mb-12">
                   <h2 className="text-3xl font-bold text-slate-900">Daily Insights</h2>
                   <div className="flex gap-2">
                       <a href="https://instagram.com/leothetechguy" className="p-2 bg-white rounded-full text-pink-600 hover:bg-pink-50 transition-colors"><Instagram className="w-5 h-5"/></a>
                       <a href="https://x.com/LeoTheTechGuy" className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors"><Twitter className="w-5 h-5"/></a>
                   </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[1, 2, 3, 4].map((item) => (
                       <div key={item} className="aspect-[4/5] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center text-center">
                           <p className="text-slate-400 text-sm">Social Post Preview</p>
                       </div>
                   ))}
               </div>
           </div>
      </section>

      <Footer />
    </main>
  );
}
