import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PhysicsZone from '@/components/PhysicsZone';
import { User, Heart, Briefcase, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-white relative">
      <PhysicsZone />
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Who I Am
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Hey, I’m Leo The Tech Guy, a normal guy who’s obsessed with technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column: Story */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* My Story */}
            <div className="prose prose-lg prose-slate max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-full">
                  <User className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 m-0">My Story</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-normal">
                I’m a tech geek at heart. I build software, explore AI, dive into cybersecurity, experiment with gadgets, and break things on purpose just to fix them again.
              </p>
              <p className="text-slate-600 leading-relaxed mt-6 font-normal">
                I’m not trying to be perfect or pretend to be something I’m not. I learn, create, fail, fix, build, and share. It’s always been that way.
              </p>
              <p className="text-slate-600 leading-relaxed mt-6 font-normal">
                I build startups, solve problems I believe technology can fix, and try to make things that help people.
              </p>
            </div>

            {/* Timeline */}
            <div className="border-t border-slate-100 pt-12">
                <h3 className="text-2xl font-semibold text-slate-900 mb-8">My Journey</h3>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                    {[
                    { year: "2018", title: "Started Coding", desc: "Built my first web apps and fell in love with solving problems through code." },
                    { year: "2020", title: "Freelancing & Startups", desc: "Worked with early-stage founders to build MVPs and scale their tech." },
                    { year: "2022", title: "AI & Security Focus", desc: "Deep dived into machine learning and cybersecurity, realizing the power of intelligent, secure systems." },
                    { year: "Present", title: "Leo The Tech Guy", desc: "Helping businesses and founders build world-class technology." }
                    ].map((item, i) => (
                    <div key={i} className="relative flex items-start group">
                        <div className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-[#0071e3] group-hover:text-white transition-colors shadow-sm z-10">
                            <div className="w-3 h-3 bg-current rounded-full"></div>
                        </div>
                        <div className="ml-16">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-slate-900">{item.title}</span>
                                <span className="text-sm text-slate-400">•</span>
                                <span className="text-sm font-medium text-[#0071e3]">{item.year}</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-normal">{item.desc}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* What I Believe */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-50 rounded-full">
                  <Heart className="w-6 h-6 text-[#10B981]" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">What I Believe</h2>
              </div>
              <div className="grid gap-4">
                {[
                  "Technology should feel simple.",
                  "Great software should be clean and elegant.",
                  "Curiosity builds the best products.",
                  "Learning never stops.",
                  "If something can be improved, I want to improve it."
                ].map((item, i) => (
                  <div key={i} className="flex items-center p-4 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] mr-4"></div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Details */}
          <div className="space-y-12">
            
            {/* Skills */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Tech Stack</h3>
                <div className="flex flex-wrap gap-3">
                    {["React", "Next.js", "TypeScript", "Python", "TensorFlow", "Node.js", "PostgreSQL", "AWS", "Docker", "Figma"].map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-100">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
            
            {/* What I Work On */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold">What I Work On</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "AI and automation",
                  "Software engineering",
                  "Cybersecurity",
                  "Product building",
                  "Startups and mentorship",
                  "Systems that solve real problems"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Who I Work With */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-[#4C8BFF]" />
                <h3 className="text-xl font-bold text-slate-900">Who I Work With</h3>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                People who want to build something meaningful, founders, creators, small teams, and anyone curious about tech.
              </p>
            </div>

          </div>

        </div>

        {/* Process & Values */}
        <div className="mt-24 border-t border-slate-100 pt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">How I Approach Work</h2>
                    <div className="space-y-6">
                        {[
                        { title: "User-Centric", desc: "I build for the people using the software, not just for the code." },
                        { title: "Transparent", desc: "No hidden costs, no jargon. Just clear communication." },
                        { title: "Secure by Design", desc: "Security isn't an afterthought; it's baked in from line one." }
                        ].map((val, i) => (
                        <div key={i} className="flex">
                            <div className="flex-shrink-0 mr-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#4C8BFF] font-bold">
                                {i + 1}
                            </div>
                            </div>
                            <div>
                            <h3 className="text-lg font-bold text-slate-900">{val.title}</h3>
                            <p className="text-slate-600">{val.desc}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="aspect-square rounded-2xl bg-slate-900 p-8 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/images/background/bg-particles.json')] opacity-20"></div>
                        <p className="text-2xl font-light italic relative z-10">
                            &quot;Great software is a mix of art, engineering, and empathy. I try to bring all three to every project.&quot;
                        </p>
                        <p className="mt-6 font-bold text-[#4C8BFF] relative z-10">— Leo</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Final Line */}
        <div className="mt-24 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-50 rounded-full mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Let’s nerd out together.
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            If you love tech, learning, experimenting, and creating cool things, you’re in the right place.
          </p>
          <Link href="/contact" className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-[#4C8BFF] rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 transition-all duration-200">
            Work With Me
          </Link>
        </div>

      </section>

      <Footer />
    </main>
  );
}
