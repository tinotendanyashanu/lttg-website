import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Server, Layout, Database, Terminal, ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: "Tech Stack & Tools | Leo The Tech Guy",
  description: "The software, hardware, and infrastructure tools I use to build scalable systems. Transparent recommendations for builders.",
};

interface ToolProps {
    name: string;
    description: string;
    why: string;
    bestFor: string;
    link: string;
    icon: React.ReactNode;
}

const ToolCard = ({ name, description, why, bestFor, link, icon }: ToolProps) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        </div>
        <p className="text-slate-600 mb-4 flex-grow">{description}</p>
        
        <div className="space-y-3 mb-6">
            <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Why I Use It</span>
                <p className="text-sm text-slate-700">{why}</p>
            </div>
            <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Best For</span>
                <p className="text-sm text-slate-700">{bestFor}</p>
            </div>
        </div>
        
        <a href={link} target="_blank" rel="noopener noreferrer" className="w-full mt-auto inline-flex justify-center items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Check it out <ArrowUpRight className="ml-2 w-4 h-4" />
        </a>
    </div>
);

export default function TechStackPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              The Tools I <span className="text-blue-600">Build With.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-0 leading-relaxed max-w-2xl mx-auto">
              I only recommend software I actually use in production. Transparent, field-tested infrastructure for serious builders.
            </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Layout className="mr-3 text-blue-600" /> Frontend & Design
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ToolCard 
                    name="Next.js"
                    description="The React framework for production. Hybrid static & server rendering."
                    why="It handles routing, optimization, and API routes out of the box. The standard for modern web."
                    bestFor="Full-stack web applications"
                    link="https://nextjs.org"
                    icon={<Terminal className="w-6 h-6" />}
                />
                <ToolCard 
                    name="Tailwind CSS"
                    description="A utility-first CSS framework for rapid UI development."
                    why="Speed. I can build custom designs 10x faster than writing vanilla CSS."
                    bestFor="Rapid prototyping and custom UIs"
                    link="https://tailwindcss.com"
                    icon={<Layout className="w-6 h-6" />}
                />
                 <ToolCard 
                    name="Framer Motion"
                    description="A production-ready motion library for React."
                    why="Makes complex animations simple and declarative."
                    bestFor="Adding polish and interactivity"
                    link="https://www.framer.com/motion/"
                    icon={<Layout className="w-6 h-6" />}
                />
            </div>
          </div>

          <div className="mb-12">
             <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Server className="mr-3 text-emerald-600" /> Infrastructure & Backend
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ToolCard 
                    name="Vercel"
                    description="Frontend cloud for Next.js and other frameworks."
                    why="Zero-config deployment, global edge network, and seamless CI/CD."
                    bestFor="Deploying web apps instantly"
                    link="https://vercel.com"
                    icon={<Server className="w-6 h-6" />}
                />
                <ToolCard 
                    name="Supabase"
                    description="Open source Firebase alternative. Postgres database, Auth, Realtime."
                    why="It gives me a full backend in minutes without vendor lock-in."
                    bestFor="Backend-as-a-Service, Auth, DB"
                    link="https://supabase.com"
                    icon={<Database className="w-6 h-6" />}
                />
                <ToolCard 
                    name="Railway"
                    description="Infrastructure platform to deploy any code."
                    why="Great for hosting Docker containers, workers, and cron jobs easily."
                    bestFor="Microservices and background jobs"
                    link="https://railway.app"
                    icon={<Terminal className="w-6 h-6" />}
                />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
