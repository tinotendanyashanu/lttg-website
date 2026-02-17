import { Globe, Database, Smartphone, Layout, Home, Heart, Truck } from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  impact?: string;
  link?: string;
  tags: string[];
  featured?: boolean;
  size: 'large' | 'medium' | 'small';
  gradient: string;
  icon: any;
  status: 'Live' | 'Prototype' | 'Demo' | 'Coming Soon' | 'Pilot';
}

export const projects: Project[] = [
  {
    id: "preciagro",
    title: "PreciAgro",
    category: "AI & Agriculture",
    description: "An intelligent agricultural system that Diagnoses crops, predicts yields, and provides actionable farming insights using advanced AI models.",
    impact: "Empowering rural farmers with data-driven decision making capabilities.",
    link: "https://www.preciagro.com/",
    tags: ["Python", "TensorFlow", "React", "IoT", "AI"],
    featured: true,
    size: 'large',
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: Globe,
    status: 'Pilot'
  },
  {
    id: "nexnet",
    title: "NexNet CyberLab",
    category: "Cybersecurity",
    description: "Comprehensive cybersecurity platform offering system monitoring, vulnerability assessment, and automated defense mechanisms.",
    impact: "Enhanced security posture for enterprise clients.",
    link: "https://www.nexnetcyberlab.com/",
    tags: ["Cybersecurity", "Network Security", "System Admin"],
    featured: true,
    size: 'medium',
    gradient: "from-blue-600/20 to-indigo-600/20",
    icon: Database,
    status: 'Live'
  },
  {
    id: "upperhand",
    title: "Upperhand Zimbabwe",
    category: "Service Platform",
    description: "A digital platform connecting service providers with clients, streamlining booking and management processes.",
    link: "https://www.upperhandzim.com/",
    tags: ["Web Platform", "Service Booking", "React"],
    size: 'medium',
    gradient: "from-orange-500/20 to-red-500/20",
    icon: Layout,
    status: 'Live'
  },
  {
    id: "urban-oasis",
    title: "Urban Oasis Interiors",
    category: "E-Commerce & Design",
    description: "Premium interior design portfolio and mobile application for a high-end design firm.",
    link: "https://vercel.com/digitalgeeksz/urban-oasis-interiors", 
    tags: ["React Native", "Next.js", "Design"],
    size: 'medium',
    gradient: "from-purple-500/20 to-pink-500/20",
    icon: Smartphone,
    status: 'Live'
  },
  {
    id: "moversklub",
    title: "MoversKlub",
    category: "Logistics & Transport",
    description: "Professional logistics platform for South African moving services, featuring refrigerated transport, event logistics, and white-glove removals with real-time tracking.",
    impact: "Streamlining logistics operations across South Africa with 24/7 support.",
    link: "https://www.moversklub.co.za/",
    tags: ["Next.js", "Logistics", "Service Platform"],
    size: 'medium',
    gradient: "from-sky-500/20 to-blue-500/20",
    icon: Truck,
    status: 'Live'
  },
  {
    id: "zimprep",
    title: "ZimPrep SaaS",
    category: "EdTech",
    description: "A SaaS platform for high school student revision powered by AI.",
    link: "https://zimprep.vercel.app/",
    tags: ["SaaS", "Education", "AI"],
    size: 'small',
    gradient: "from-yellow-400/20 to-orange-400/20",
    icon: Layout,
    status: 'Live'
  },
  {
    id: "sanganai",
    title: "Sanganai Events",
    category: "Event Management",
    description: "Comprehensive event management system handling ticketing, scheduling, and logistics.",
    link: "https://sanganai.vercel.app/",
    tags: ["Event Tech", "Management System"],
    size: 'small',
    gradient: "from-cyan-400/20 to-blue-400/20",
    icon: Layout,
    status: 'Prototype'
  },
  {
    id: "maka-foundation",
    title: "Maka Them Right",
    category: "Non-Profit",
    description: "Charity foundation website focused on community support and development initiatives.",
    link: "https://vercel.com/digitalgeeksz/maka-them-right-foundation",
    tags: ["Non-Profit", "Community"],
    size: 'small',
    gradient: "from-rose-400/20 to-red-400/20",
    icon: Heart,
    status: 'Live'
  },
  {
    id: "airbnb-clone",
    title: "Rental Demo",
    category: "Web App Clone",
    description: "A functional clone of the Airbnb platform demonstrating complex UI/UX implementation and filtering logic.",
    link: "https://house-rental-black.vercel.app/",
    tags: ["Clone", "Demo", "Complex UI"],
    size: 'small',
    gradient: "from-slate-500/20 to-gray-500/20",
    icon: Home,
    status: 'Demo'
  }
];
