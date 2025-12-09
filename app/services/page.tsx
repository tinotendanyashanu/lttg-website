import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BrainCircuit, Code2, ShieldCheck, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Services() {
  const services = [
    {
      title: "AI & Intelligent Automation",
      subtitle: "Smarter Systems, Less Work",
      description: "I build AI tools that automate tasks, analyze data, and bring intelligence into everyday operations. From prediction engines to chatbots to custom models, if it’s powered by AI, I’m interested.",
      offerings: [
        "AI and machine learning models",
        "Automation systems",
        "Predictive analytics",
        "Data analysis and dashboards",
        "Natural language processing",
        "Computer vision"
      ],
      outcome: "You get systems that think, learn, and save you time.",
      cta: "Book an AI Consultation",
      icon: <BrainCircuit className="w-10 h-10 text-[#10B981]" />,
      gradient: "from-[#10B981]/10 to-[#10B981]/5"
    },
    {
      title: "Software & Full-Stack Development",
      subtitle: "Clean, Modern Software Built With Care",
      description: "I build applications that feel smooth, work fast, and scale. Whether it's a platform, dashboard, API, or full system, I make sure it’s elegant, efficient, and future-ready.",
      offerings: [
        "Web apps (Next.js, React)",
        "SaaS platforms",
        "APIs and integrations",
        "Dashboards and CRMs",
        "Automation tools",
        "Blockchain-integrated systems"
      ],
      outcome: "Technology that actually works, and works beautifully.",
      cta: "Start Building",
      icon: <Code2 className="w-10 h-10 text-[#0071e3]" />,
      gradient: "from-[#0071e3]/10 to-[#0071e3]/5"
    },
    {
      title: "Cybersecurity & Secure Engineering",
      subtitle: "Protect What Matters",
      description: "I break things to understand them, then secure them so nobody else can break them. I help founders keep their systems safe.",
      offerings: [
        "Vulnerability reviews",
        "Secure architecture",
        "Encryption guidance",
        "Best practices",
        "Security automation",
        "Secure code reviews"
      ],
      outcome: "Peace of mind knowing your product is harder to break into.",
      cta: "Secure Your System",
      icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
      gradient: "from-emerald-500/10 to-emerald-500/5"
    },
    {
      title: "Startup & Tech Mentorship",
      subtitle: "Helping You Build Something Real",
      description: "If you have an idea but don’t know how to execute it, I’ll help you plan it, break it down, and turn it into a working product.",
      offerings: [
        "Technical planning",
        "System architecture",
        "Feature roadmap",
        "Founder guidance",
        "Problem-solving sessions",
        "Build-from-scratch strategy"
      ],
      outcome: "Clarity, confidence, and a real path forward.",
      cta: "Let’s build something cool, start your project today.",
      icon: <Lightbulb className="w-10 h-10 text-amber-500" />,
      gradient: "from-amber-500/10 to-amber-500/5"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            What I Do
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            I don’t do hype or empty promises. I build useful, clean, real technology. Whether you need software, AI, security, or guidance, here’s what I can help you with.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="pb-24 px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {services.map((service, index) => (
          <div key={index} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-start ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Visual / Icon Side */}
            <div className="w-full lg:w-1/3 sticky top-32">
              <div className={`p-8 rounded-2xl bg-gradient-to-br ${service.gradient} border border-slate-100`}>
                <div className="bg-white w-20 h-20 rounded-xl shadow-sm flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-500 font-medium">{service.subtitle}</p>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-2/3">
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {service.description}
              </p>

              <div className="bg-slate-50 rounded-2xl p-8 mb-8">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">What I Offer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.offerings.map((item, i) => (
                    <div key={i} className="flex items-center text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-3"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-slate-100 pt-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Outcome</h4>
                  <p className="text-slate-600">{service.outcome}</p>
                </div>
                <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap">
                  {service.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "Leo transformed our manual process into a slick AI-driven workflow. Saved us 20 hours a week.", author: "Sarah J.", role: "Operations Director" },
              { quote: "The security audit was eye-opening. We fixed critical vulnerabilities before launching.", author: "Mike T.", role: "CTO, FinTech Startup" },
              { quote: "Best technical partner we've worked with. Clear communication and rock-solid code.", author: "Elena R.", role: "Product Manager" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-slate-600 mb-6 italic">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="font-bold text-slate-900">{t.author}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Anchors */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Investment Models</h2>
          <p className="text-lg text-slate-600">Transparent starting points to help you plan.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Starter / MVP", price: "From $5k", desc: "Perfect for validating ideas or small tools.", features: ["Core features", "Standard UI/UX", "2-4 weeks timeline"] },
            { name: "Growth / Scale", price: "From $15k", desc: "Full-featured platforms and complex automations.", features: ["Advanced AI/Logic", "Custom Design System", "1-3 months timeline"] },
            { name: "Enterprise", price: "Custom", desc: "Security audits, legacy modernization, and consulting.", features: ["Full Audit & Strategy", "SLA Support", "Dedicated Team"] }
          ].map((plan, i) => (
            <div key={i} className={`p-8 rounded-2xl border ${i === 1 ? 'border-[#4C8BFF] bg-blue-50/30 ring-1 ring-[#4C8BFF]/50' : 'border-slate-200 bg-white'} flex flex-col`}>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-[#4C8BFF] mb-4">{plan.price}</p>
              <p className="text-slate-600 mb-8">{plan.desc}</p>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-3"></div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={`w-full inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${i === 1 ? 'bg-[#4C8BFF] text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                Get a Quote
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            {[
              { q: "Do you work with non-technical founders?", a: "Absolutely. I specialize in translating tech jargon into plain English and guiding you through the entire process." },
              { q: "What is your typical timeline?", a: "Small tools take 2-4 weeks. Full platforms usually take 2-3 months. I provide a detailed schedule before we start." },
              { q: "Do you offer post-launch support?", a: "Yes, I offer maintenance packages to keep your system secure, updated, and running smoothly." }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-8 last:border-0">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
