import { BrainCircuit, Code2, ShieldCheck, Lightbulb } from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  headline: string;     // New: Large primary headline
  subheadline: string;  // New: Secondary colored headline
  description: string;
  longDescription: string;
  offerings: string[];
  outcome: string;
  cta: string;
  icon: string;
  image: string;
  color: string;
  bg: string;
  border: string;
  lightBg: string;
  accentColor: string;  // New: Hex color for accents
  gradient: string;     // New: Tailwind gradient classes
  benefits: {
    title: string;
    description: string;
  }[];
  process: {
    step: string;
    title: string;
    description: string;
  }[];
  technologies?: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const services: Service[] = [
  {
    id: "ai-automation",
    title: "AI & Intelligent Automation",
    subtitle: "Smarter Systems, Less Work",
    headline: "Smarter Systems.",
    subheadline: "Less Work.",
    description: "I build AI tools that automate tasks, analyze data, and bring intelligence into everyday operations. From prediction engines to chatbots to custom models, if it's powered by AI, I'm interested.",
    longDescription: "Artificial Intelligence isn't just a buzzword—it's a transformative tool that can revolutionize how your business operates. I specialize in building practical AI solutions that solve real problems: automating repetitive tasks, extracting insights from data, and creating intelligent systems that learn and improve over time. Whether you need a custom chatbot that actually understands context, a prediction engine that helps you make better decisions, or a computer vision system that processes visual data at scale, I deliver AI that works in the real world—not just in demos.",
    offerings: [
      "Custom LLM Integration (GPT-4, Claude)",
      "Automated Workflows & AI Agents",
      "Predictive Analytics Engines",
      "Intelligent Chatbots & Support Systems",
      "Computer Vision Solutions",
      "Natural Language Processing",
      "Machine Learning Model Development",
      "AI-Powered Data Analysis"
    ],
    outcome: "Systems that think, learn, and save you 20+ hours a week.",
    cta: "Automate Your Business",
    icon: "BrainCircuit",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/20",
    lightBg: "bg-emerald-50",
    accentColor: "#10B981",
    gradient: "from-emerald-500/20 via-transparent to-transparent",
    benefits: [
      {
        title: "Reduce Manual Work",
        description: "Automate repetitive tasks and free your team to focus on high-value activities that drive growth."
      },
      {
        title: "Make Smarter Decisions",
        description: "Leverage predictive analytics and data insights to make informed decisions backed by real data."
      },
      {
        title: "Scale Without Hiring",
        description: "AI systems work 24/7 without breaks, allowing you to scale operations without proportionally increasing headcount."
      },
      {
        title: "Improve Customer Experience",
        description: "Intelligent chatbots and support systems provide instant, accurate responses around the clock."
      }
    ],
    process: [
      {
        step: "01",
        title: "Discovery & Data Audit",
        description: "We analyze your current workflows, data sources, and identify the highest-impact opportunities for AI automation."
      },
      {
        step: "02",
        title: "Solution Design",
        description: "I architect a custom AI solution tailored to your specific needs, selecting the right models and technologies."
      },
      {
        step: "03",
        title: "Development & Training",
        description: "Building and training the AI system with your data, iterating until it performs at the level you need."
      },
      {
        step: "04",
        title: "Deployment & Optimization",
        description: "Seamless integration into your existing systems, with ongoing monitoring and continuous improvement."
      }
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "OpenAI API", "Anthropic Claude", "LangChain", "Hugging Face", "AWS SageMaker", "Google Cloud AI"],
    faqs: [
      {
        question: "Do I need a lot of data to use AI?",
        answer: "Not necessarily. While more data generally improves AI performance, modern techniques like transfer learning and pre-trained models allow us to build effective solutions even with limited data. We'll assess your data situation and recommend the best approach."
      },
      {
        question: "How long does it take to build an AI solution?",
        answer: "It varies based on complexity. A simple chatbot might take 2-4 weeks, while a custom machine learning model could take 2-3 months. We'll give you a realistic timeline after understanding your requirements."
      },
      {
        question: "Will AI replace my team?",
        answer: "AI is designed to augment your team, not replace them. It handles repetitive tasks so your people can focus on creative, strategic work that requires human judgment and empathy."
      }
    ]
  },
  {
    id: "software-dev",
    title: "Full-Stack Engineering",
    subtitle: "Clean, Modern Software Built With Care",
    headline: "Beautiful Code.",
    subheadline: "Scalable Systems.",
    description: "I build applications that feel smooth, work fast, and scale. Whether it's a platform, dashboard, API, or full system, I make sure it's elegant, efficient, and future-ready.",
    longDescription: "Great software isn't just about making things work—it's about building systems that are maintainable, scalable, and delightful to use. With years of experience across the full stack, I create web applications that combine beautiful front-end experiences with robust, secure back-end architecture. From high-performance web apps to complex SaaS platforms, I write clean, tested code that other developers can understand and extend. I don't just ship features—I build foundations that support your growth for years to come.",
    offerings: [
      "High-Performance Web Apps (Next.js, React)",
      "Scalable SaaS Platforms",
      "Custom API Development (REST, GraphQL)",
      "Real-time Dashboards & Analytics",
      "Complex System Architecture",
      "Database Design & Optimization",
      "Third-Party Integrations",
      "Progressive Web Apps (PWA)"
    ],
    outcome: "Technology that actually works, and works beautifully.",
    cta: "Start Building",
    icon: "Code2",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2940&auto=format&fit=crop",
    color: "text-[#4C8BFF]",
    bg: "bg-[#4C8BFF]/10",
    border: "border-[#4C8BFF]/20",
    lightBg: "bg-blue-50",
    accentColor: "#4C8BFF",
    gradient: "from-blue-500/20 via-transparent to-transparent",
    benefits: [
      {
        title: "Fast & Responsive",
        description: "Applications optimized for speed with sub-second load times and smooth interactions across all devices."
      },
      {
        title: "Built to Scale",
        description: "Architecture designed to handle growth—from your first 100 users to your first 100,000."
      },
      {
        title: "Clean Codebase",
        description: "Well-documented, tested code that's easy to maintain and extend as your needs evolve."
      },
      {
        title: "Modern Tech Stack",
        description: "Using the latest proven technologies to ensure your product stays relevant and performant."
      }
    ],
    process: [
      {
        step: "01",
        title: "Requirements & Planning",
        description: "Deep dive into your needs, user flows, and technical requirements to create a detailed project roadmap."
      },
      {
        step: "02",
        title: "Architecture & Design",
        description: "Designing the system architecture, database schema, and UI/UX to ensure everything fits together perfectly."
      },
      {
        step: "03",
        title: "Agile Development",
        description: "Building in sprints with regular demos, allowing for feedback and adjustments throughout the process."
      },
      {
        step: "04",
        title: "Testing & Launch",
        description: "Rigorous testing, performance optimization, and smooth deployment to production."
      }
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "MongoDB", "Redis", "AWS", "Vercel", "Docker"],
    faqs: [
      {
        question: "What technologies do you use?",
        answer: "I primarily work with Next.js, React, TypeScript, and Node.js for web applications. For databases, I use PostgreSQL, MongoDB, or the best fit for your needs. I'm always learning and adapting to use the right tool for each job."
      },
      {
        question: "Do you provide ongoing maintenance?",
        answer: "Yes, I offer maintenance and support packages to keep your application running smoothly, handle updates, and implement new features as your business grows."
      },
      {
        question: "How do you handle project communication?",
        answer: "I believe in transparency. You'll have access to a project dashboard, regular video updates, and direct communication channels. No surprises, no disappearing acts."
      }
    ]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Defense",
    subtitle: "Protect What Matters",
    headline: "Protect Everything.",
    subheadline: "Trust Nothing.",
    description: "I break things to understand them, then secure them so nobody else can break them. I help founders keep their systems safe from day one.",
    longDescription: "In today's threat landscape, security can't be an afterthought—it needs to be built into every layer of your system. I bring a hacker's mindset to defense: understanding how attackers think and operate, then building walls they can't breach. From conducting thorough vulnerability assessments to designing secure architectures from scratch, I help you protect your users' data, your reputation, and your business. Whether you're a startup handling sensitive data or an established company looking to level up your security posture, I provide the expertise you need.",
    offerings: [
      "Vulnerability Assessments & Audits",
      "Secure Architecture Design",
      "Penetration Testing",
      "Security Automation & Monitoring",
      "Compliance & Best Practices (SOC2, GDPR)",
      "Incident Response Planning",
      "Security Training & Awareness",
      "Secure Code Review"
    ],
    outcome: "Peace of mind knowing your product is bulletproof.",
    cta: "Secure Your System",
    icon: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2940&auto=format&fit=crop",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    lightBg: "bg-emerald-50",
    accentColor: "#10B981",
    gradient: "from-emerald-500/20 via-transparent to-transparent",
    benefits: [
      {
        title: "Identify Vulnerabilities",
        description: "Find and fix security weaknesses before malicious actors can exploit them."
      },
      {
        title: "Build User Trust",
        description: "Demonstrate your commitment to security, building confidence with customers and partners."
      },
      {
        title: "Meet Compliance",
        description: "Navigate complex regulatory requirements like SOC2, GDPR, and HIPAA with confidence."
      },
      {
        title: "Prevent Costly Breaches",
        description: "A single breach can cost millions. Proactive security is always cheaper than reactive damage control."
      }
    ],
    process: [
      {
        step: "01",
        title: "Security Assessment",
        description: "Comprehensive review of your current security posture, identifying vulnerabilities and risk areas."
      },
      {
        step: "02",
        title: "Threat Modeling",
        description: "Analyzing potential attack vectors and prioritizing defenses based on your specific risk profile."
      },
      {
        step: "03",
        title: "Implementation",
        description: "Deploying security controls, hardening systems, and implementing monitoring solutions."
      },
      {
        step: "04",
        title: "Ongoing Monitoring",
        description: "Continuous security monitoring, regular testing, and updates to stay ahead of emerging threats."
      }
    ],
    technologies: ["Burp Suite", "Metasploit", "Nmap", "Wireshark", "OWASP ZAP", "AWS Security Hub", "Cloudflare", "Snyk"],
    faqs: [
      {
        question: "I'm a small startup. Do I really need security?",
        answer: "Absolutely. Attackers often target smaller companies because they assume security is weak. Building security in from the start is much cheaper than fixing breaches later—and it builds trust with your early customers."
      },
      {
        question: "What's included in a penetration test?",
        answer: "I simulate real-world attacks on your systems, attempting to find vulnerabilities the way an attacker would. You'll receive a detailed report with findings, risk ratings, and clear remediation steps."
      },
      {
        question: "How often should security assessments be done?",
        answer: "At minimum, annually or after any major system changes. For higher-risk applications, quarterly assessments and continuous monitoring are recommended."
      }
    ]
  },
  {
    id: "mentorship",
    title: "Tech Mentorship & Strategy",
    subtitle: "Helping You Build Something Real",
    headline: "Build Smarter.",
    subheadline: "Move Faster.",
    description: "If you have an idea but don't know how to execute it, I'll help you plan it, break it down, and turn it into a working product.",
    longDescription: "Having a great idea is just the beginning—turning it into reality requires technical knowledge, strategic planning, and experience navigating the countless decisions that come with building a product. Whether you're a non-technical founder trying to understand your options, a startup looking for part-time CTO guidance, or a junior developer wanting to level up, I provide the mentorship and strategic advice you need. I've been through the trenches of building products, making mistakes, and finding solutions. Let me help you skip the expensive lessons and get to success faster.",
    offerings: [
      "Technical Roadmap Planning",
      "MVP Strategy & Scope Definition",
      "Code Reviews & Architecture Guidance",
      "CTO-as-a-Service",
      "Hiring & Team Building Support",
      "Technology Stack Selection",
      "Startup Technical Due Diligence",
      "1-on-1 Developer Mentorship"
    ],
    outcome: "Clarity, confidence, and a real path forward.",
    cta: "Get Expert Guidance",
    icon: "Lightbulb",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2940&auto=format&fit=crop",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    lightBg: "bg-amber-50",
    accentColor: "#F59E0B",
    gradient: "from-amber-500/20 via-transparent to-transparent",
    benefits: [
      {
        title: "Avoid Costly Mistakes",
        description: "Learn from someone who's already made the mistakes—and knows how to avoid them."
      },
      {
        title: "Make Informed Decisions",
        description: "Understand your technical options so you can make decisions with confidence."
      },
      {
        title: "Build the Right Thing",
        description: "Focus on features that matter and avoid building things nobody needs."
      },
      {
        title: "Accelerate Growth",
        description: "Get the strategic guidance you need to move faster and smarter."
      }
    ],
    process: [
      {
        step: "01",
        title: "Initial Consultation",
        description: "Understanding your goals, challenges, and what kind of support you need most."
      },
      {
        step: "02",
        title: "Strategic Planning",
        description: "Creating a clear roadmap with priorities, milestones, and actionable steps."
      },
      {
        step: "03",
        title: "Ongoing Support",
        description: "Regular sessions for guidance, problem-solving, and keeping you on track."
      },
      {
        step: "04",
        title: "Execution Support",
        description: "Hands-on help when you need it—code reviews, technical interviews, critical decisions."
      }
    ],
    technologies: ["Product Strategy", "Agile/Scrum", "Technical Architecture", "Team Management", "Hiring Practices", "Code Review"],
    faqs: [
      {
        question: "I'm non-technical. Can you still help me?",
        answer: "Absolutely! I bridge the gap between business strategy and technical execution. I translate complex architectural concepts into clear business value."
      },
      {
        question: "What's CTO-as-a-Service?",
        answer: "It's fractional technical leadership for startups and SMEs. I provide the strategic oversight of a CTO without the full-time cost—guiding architecture, hiring, and roadmap decisions."
      },
      {
        question: "How often would we meet?",
        answer: "It depends on your needs. Whether it's a one-off strategy session or a monthly retainer for ongoing advisory, we structure the engagement to drive maximum impact."
      }
    ]
  }
];

export function getServiceById(id: string): Service | undefined {
  return services.find(service => service.id === id);
}

export function getServiceIcon(iconName: string) {
  const icons: { [key: string]: any } = {
    BrainCircuit,
    Code2,
    ShieldCheck,
    Lightbulb
  };
  return icons[iconName] || BrainCircuit;
}
