'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    ArrowUpRight, 
    Search,
    Briefcase, // Fallback for Office
    Keyboard,  // Fallback for Keychron
    Headphones, // Fallback for Shure
    Cpu,
} from 'lucide-react';
import { 
    SiNextdotjs, 
    SiVercel, 
    SiSupabase, 
    SiRailway, 
    SiVscodium, 
    SiFigma, 
    SiTailwindcss, 
    SiFramer, 
    SiApple, 
    SiLogitech, 
    SiRaycast, 
    SiLinear,
    SiArc,
    SiGoogle
} from 'react-icons/si'; 

// --- Data ---

type Category = 'All' | 'Development' | 'Design' | 'Hardware' | 'Office' | 'Apps';

interface Tool {
    name: string;
    category: Category;
    tags: string[];
    description: string;
    why: string;
    link: string;
    icon: React.ReactNode;
}

const TOOLS: Tool[] = [
    // Development
    {
        name: "Next.js",
        category: "Development",
        tags: ["Frontend", "Framework"],
        description: "The React framework for production.",
        why: "Handles routing, SSR, and API routes seamlessly.",
        link: "https://nextjs.org",
        icon: <SiNextdotjs className="w-5 h-5 text-black" />
    },
    {
        name: "Vercel",
        category: "Development",
        tags: ["Hosting", "CI/CD"],
        description: "Frontend cloud next-gen hosting.",
        why: "Zero-config deployments with incredible edge network.",
        link: "https://vercel.com",
        icon: <SiVercel className="w-5 h-5 text-black" />
    },
    {
        name: "Supabase",
        category: "Development",
        tags: ["Backend", "Database"],
        description: "Open source Firebase alternative.",
        why: "Full Postgres database with Auth and Realtime out of the box.",
        link: "https://supabase.com",
        icon: <SiSupabase className="w-5 h-5 text-emerald-500" />
    },
    {
        name: "Railway",
        category: "Development",
        tags: ["Infrastructure", "Docker"],
        description: "Deployment platform for any code.",
        why: "Perfect for hosting background workers and cron jobs.",
        link: "https://railway.app",
        icon: <SiRailway className="w-5 h-5 text-purple-500" />
    },
    {
        name: "RunPod",
        category: "Development",
        tags: ["Infrastructure", "GPU", "AI"],
        description: "Cloud computing platform for AI and machine learning.",
        why: "Best-in-class GPU instances for training and deploying AI models at scale.",
        link: "https://runpod.io?ref=7kyer76k",
        icon: <Cpu className="w-5 h-5 text-indigo-600" />
    },
    {
        name: "VS Code",
        category: "Development",
        tags: ["Editor", "Microsoft"],
        description: "Code editor redefined.",
        why: "Extensible, fast, and the industry standard for TS.",
        link: "https://code.visualstudio.com",
        icon: <SiVscodium className="w-5 h-5 text-blue-500" />
    },

    // Design
    {
        name: "Figma",
        category: "Design",
        tags: ["UI/UX", "Prototyping"],
        description: "Interface design tool.",
        why: "The collaborative standard for all design work.",
        link: "https://figma.com",
        icon: <SiFigma className="w-5 h-5 text-purple-400" />
    },
    {
        name: "Tailwind CSS",
        category: "Design",
        tags: ["CSS", "Styling"],
        description: "Utility-first CSS framework.",
        why: "Speeds up styling workflow by 10x.",
        link: "https://tailwindcss.com",
        icon: <SiTailwindcss className="w-5 h-5 text-cyan-500" />
    },
    {
        name: "Framer Motion",
        category: "Design",
        tags: ["Animation", "React"],
        description: "Motion library for React.",
        why: "Declarative animations that just work.",
        link: "https://www.framer.com/motion/",
        icon: <SiFramer className="w-5 h-5 text-black" /> 
    },

    // Hardware
    {
        name: 'MacBook Pro 16"',
        category: "Hardware",
        tags: ["Laptop", "Apple"],
        description: "M3 Max, 64GB RAM.",
        why: "The most powerful portable machine for dev work.",
        link: "https://apple.com/macbook-pro",
        icon: <SiApple className="w-5 h-5 text-black" />
    },
    {
        name: "Apple Studio Display",
        category: "Hardware",
        tags: ["Monitor", "5K"],
        description: "27-inch 5K Retina display.",
        why: "Crystal clear text rendering is essential for coding.",
        link: "https://apple.com/studio-display",
        icon: <SiApple className="w-5 h-5 text-black" />
    },
    {
        name: "Keychron Q1 Pro",
        category: "Hardware",
        tags: ["Keyboard", "Mechanical"],
        description: "Custom mechanical keyboard.",
        why: "Great tactile feel for long typing sessions.",
        link: "https://www.keychron.com",
        icon: <Keyboard className="w-5 h-5 text-slate-700" />
    },
     {
        name: "Logitech MX Master 3S",
        category: "Hardware",
        tags: ["Mouse", "Ergonomics"],
        description: "Performance wireless mouse.",
        why: "The scroll wheel and ergonomics are unmatched.",
        link: "https://www.logitech.com",
        icon: <SiLogitech className="w-5 h-5 text-black" />
    },

    // Office
    {
        name: "Herman Miller Aeron",
        category: "Office",
        tags: ["Chair", "Ergonomics"],
        description: "The benchmark for ergonomic seating.",
        why: "Invest in your back. Essential for 8+ hour days.",
        link: "https://www.hermanmiller.com",
        icon: <Briefcase className="w-5 h-5 text-slate-700" />
    },
    {
        name: "Shure SM7B",
        category: "Office",
        tags: ["Audio", "Mic"],
        description: "Vocal dynamic microphone.",
        why: "Broadcast quality audio for calls and recording.",
        link: "https://www.shure.com",
        icon: <Headphones className="w-5 h-5 text-slate-700" />
    },

    // Apps
    {
        name: "Raycast",
        category: "Apps",
        tags: ["Productivity", "Utility"],
        description: "Spotlight replacement.",
        why: "Scriptable, fast, and completely keyboard-driven.",
        link: "https://raycast.com",
        icon: <SiRaycast className="w-5 h-5 text-red-500" />
    },
    {
        name: "Linear",
        category: "Apps",
        tags: ["Project Management", "Issue Tracking"],
        description: "Issue tracking for software teams.",
        why: "It respects your time. Fast and keyboard-centric.",
        link: "https://linear.app",
        icon: <SiLinear className="w-5 h-5 text-indigo-500" />
    },
     {
        name: "Arc Browser",
        category: "Apps",
        tags: ["Browser", "Web"],
        description: "The internet computer.",
        why: "A fresh take on how a browser should work.",
        link: "https://arc.net",
        icon: <SiArc className="w-5 h-5 text-rose-500" />
    },
    {
        name: "Google One",
        category: "Apps",
        tags: ["Productivity", "Storage", "Cloud"],
        description: "Expand your cloud storage and get extra features.",
        why: "Essential for backing up high-quality photos and large project files.",
        link: "https://g.co/g1referral/ECTRK1HA",
        icon: <SiGoogle className="w-5 h-5 text-blue-500" />
    },
];

const CATEGORIES: Category[] = ['All', 'Development', 'Design', 'Hardware', 'Office', 'Apps'];

export default function ResourcesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('All');

    // Filter Logic
    const filteredTools = TOOLS.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            
            {/* Header */}
            <section className="pt-32 pb-12 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Resources
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                        A curated list of the software, hardware, and infrastructure I use to build and ship products. 
                        Field-tested and production-ready.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3 lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)]">
                        <div className="space-y-8">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search tools..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Categories */}
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Categories</h3>
                                <nav className="space-y-1">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                activeCategory === category 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Note */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    <span className="font-semibold text-slate-700">Transparency:</span> Some links may be affiliate-based. I only recommend tools I genuinely use and trust.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="space-y-2 mb-8">
                            <h2 className="text-xl font-bold text-slate-900">
                                {activeCategory === 'All' ? 'All Resources' : activeCategory}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
                            </p>
                        </div>

                        {filteredTools.length > 0 ? (
                            <div className="grid grid-cols-1 border-t border-slate-100">
                                {filteredTools.map((tool) => (
                                    <div 
                                        key={tool.name}
                                        className="group py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-start md:justify-between gap-6 hover:bg-slate-50/50 transition-colors -mx-4 px-4 rounded-xl"
                                    >
                                        <div className="flex gap-4 md:max-w-2xl">
                                            <div className="shrink-0 mt-1">
                                                <div className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 shadow-sm group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                                                    {tool.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                                        {tool.category}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                                                    {tool.description}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    <span className="font-medium text-slate-700">Why:</span> {tool.why}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="shrink-0 pt-1">
                                            <a 
                                                href={tool.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors group/link"
                                            >
                                                Check it out
                                                <ArrowUpRight className="ml-1.5 w-4 h-4 text-slate-400 group-hover/link:text-blue-600 transition-colors" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-slate-500">No tools found matching your search.</p>
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('All');
                                    }}
                                    className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
