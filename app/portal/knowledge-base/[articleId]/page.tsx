import React from 'react';
import Link from 'next/link';

export default function ArticleDetailedView({ params }: { params: { articleId: string } }) {
  // Normally, we'd fetch the article content based on the ID here
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-slate-800 dark:text-slate-200 min-h-screen flex flex-col md:flex-row p-6 gap-6">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 flex shrink-0 flex-col gap-6 md:h-[calc(100vh-3rem)] md:sticky md:top-6">
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-black dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white">
              <span className="material-icons-outlined text-xl">bolt</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">LeoTech</span>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Link href="/portal" className="flex items-center gap-4 p-3 rounded-2xl text-slate-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all group">
               <span className="material-icons-outlined text-xl">dashboard</span>
               <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/portal/knowledge-base" className="flex items-center gap-4 p-3 rounded-2xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white group">
              <span className="material-icons-outlined text-xl">menu_book</span>
              <span className="font-medium">Knowledge Base</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
             <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-center bg-cover border-2 border-white dark:border-gray-700 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-DCmJvMsrabV5pV1Ai6ueYGxFRkP-NCcloCzzLmchCaa7LRXZVCnkZ5F3nEVuqdkUwWtH6ELRM9dRKLDfCmHU5PBRq25s3RgWBuGjPk0hK_buXxntwIhiDvdAkgijcN3aHhGsj0QT2YzDJP2qO_8hSDAA99uD9Ha6xx5spEW9J7QYxJXKmsKKplL8QPM0iWsY93jBs3nA4Kqbc_H6YE4NRsdMuQ3HfurU1sCCHRIxo2JHan48AvexdyrI_oqhX7B8VMpPsMkQ3k")' }}></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Alex Rivera</p>
                  <p className="text-xs text-slate-400">Editor</p>
                </div>
              </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 overflow-hidden max-w-5xl mx-auto w-full">
        <header className="bg-white dark:bg-[#27272a] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-4 flex-1">
            <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-2">
              <span className="material-icons-outlined !text-[18px]">arrow_back</span>
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Internal Documentation
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Implementing Bento Design Systems in Internal Tooling
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-center bg-cover border border-gray-200 dark:border-gray-700 shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDq4AQ6TjEbL42RWS2-QZm85jMlI7ktcYACHkMTYr_WjaJ1TbbOGdaszUddGZ3-yrNjGbwvv7VxSRFx4iKG-pJotdETaKxQ4zp8qBtgiS7n_jb4EDIA3B4jr3Jc-sYltkLRBOQmhCMTPCHFWO1QsMsVslBpUA8Qj_x3stK-rGl09y14qOkEo7gIlg69uSbkht8L8knm3rq6Mf8eSxg0F0v7PrzVES80Zi8u33SthQ6Tj9wIOYwBnE5tnsyspkVZw5f2AXILXFGefu0")' }}></div>
                <div>
                  <p className="text-xs text-slate-400">Author</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Julian G. Vance</p>
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Oct 24, 2023 • 09:42 AM</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-neutral-800 rounded-2xl font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all border border-gray-200 dark:border-gray-700">
              <span className="material-icons-outlined text-lg">share</span>
              Share
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-medium text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
              <span className="material-icons-outlined text-lg">edit</span>
              Edit
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none">
          <article className="bg-white dark:bg-[#27272a] p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 prose prose-slate dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <p className="lead text-lg text-slate-600 dark:text-slate-400 font-medium">
              The Bento UI pattern, popularized by Apple and recent dashboard trends, provides a structured yet flexible way to present complex information. For LeoTech's internal OS, this grid-based approach ensures modularity and scalability.
            </p>
            
            <h3 className="text-xl font-bold mt-8 mb-4">1. Core Principles</h3>
            <p className="mb-6">
              The Bento design system relies on a strict grid hierarchy. Each "cell" or "module" should contain a single functional unit or data point. This reduces cognitive load and allows for easy scanning.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 my-8 not-prose">
              <h4 className="text-emerald-800 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                <span className="material-icons-outlined text-xl">tips_and_updates</span>
                Pro Tip
              </h4>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
                Always maintain consistent padding (typically 24px or 32px) within cards to maintain the "premium" feel. Soft shadows with high blur radius are preferred over hard borders.
              </p>
            </div>
            
            <h3 className="text-xl font-bold mt-8 mb-4">2. Visual Hierarchy</h3>
            <p className="mb-6">
              Use typography to guide the user. Headers should be bold and prominent, while secondary information uses reduced weight and subtle coloring. In our implementation, we use <strong>Inter</strong> for its clarity at all sizes.
            </p>
            
            <div className="my-8 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
                <img 
                    alt="Design System Diagram" 
                    className="w-full h-auto object-cover max-h-[400px]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc1joCID3oxX-WOQnHQeSQBwNKGXfVBseP3SC69NwbzbU_Hj5-Q6XZSD67CC7MeyGzY6u_MgfZLT8b60XeX7hxYXGjnsJo3ja2zYNF21hU2tYUlyTuSCB39cH2nAtasD-r8SW_lf_Uj6aJgdO9-qLMMey1JX_WHpNG0KFOtDUvQ7FaDWfCfwVkEY__oHNRGIg2u5kN7Vj8v-lGULbvst1S-malrNSPkt3Xa2I5tZ0_zv6NRjtggTr2jWyFb1BhDrZta_nda639obs"
                />
            </div>
            
            <h3 className="text-xl font-bold mt-8 mb-4">3. Interactive Elements</h3>
            <p className="mb-6">
              Cards should have subtle hover states. A slight scale increase or shadow deepening (as seen in the reference dashboard) indicates interactivity without being distracting. Use micro-interactions for feedback on actions like "Copy Link" or "Save to Favorites".
            </p>
            
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-8 text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-neutral-800/50 rounded-r-xl">
              "Complexity is fine, as long as it's organized. The Bento box doesn't simplify the meal; it simply makes it digestible."
            </blockquote>
          </article>
          
          <section className="bg-white dark:bg-[#27272a] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="material-icons-outlined">history</span>
              Activity Log
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 z-10">
                  <span className="material-icons-outlined">publish</span>
                </div>
                <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Article Published</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Published by <span className="text-slate-700 dark:text-slate-300 font-bold">Julian G. Vance</span> • Oct 24, 2023, 09:42 AM
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 z-10">
                  <span className="material-icons-outlined">edit</span>
                </div>
                <div className="absolute left-5 top-10 bottom-[-24px] w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Major Revision</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Updated Typography section by <span className="text-slate-700 dark:text-slate-300 font-bold">Sarah Jenkins</span> • Oct 22, 2023, 03:15 PM
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 relative">
                <div className="w-10 h-10 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 z-10">
                  <span className="material-icons-outlined">add_circle</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Article Created</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Drafted by <span className="text-slate-700 dark:text-slate-300 font-bold">Julian G. Vance</span> • Oct 20, 2023, 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-full xl:w-80 hidden md:flex shrink-0 flex-col gap-6 md:h-[calc(100vh-3rem)] md:sticky md:top-6">
        <div className="relative group">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            search
          </span>
          <input 
            className="w-full bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 rounded-3xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none dark:text-white" 
            placeholder="Search knowledge base..." 
            type="text"
          />
        </div>
        
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">On this page</h4>
          <nav className="space-y-1">
             <a className="block py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-400 pl-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg" href="#">1. Core Principles</a>
             <a className="block py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors pl-4 border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600" href="#">2. Visual Hierarchy</a>
             <a className="block py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors pl-4 border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600" href="#">3. Interactive Elements</a>
             <a className="block py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors pl-4 border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600" href="#">4. Summary</a>
          </nav>
        </div>
        
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Related Resources</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                    <span className="material-icons-outlined">picture_as_pdf</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Design_Specs_v2.pdf</p>
                    <p className="text-[10px] text-slate-400">4.2 MB • Pitch Deck</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-icons-outlined">description</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Bento_Template_Fig</p>
                    <p className="text-[10px] text-slate-400">1.8 MB • Figma Kit</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-colors">
              View all resources
              <span className="material-icons-outlined text-lg">arrow_forward</span>
            </button>
        </div>

        <div className="bg-neutral-900 dark:bg-black p-6 rounded-3xl shadow-lg border border-neutral-800 text-white mt-auto">
          <h4 className="font-bold mb-2">Was this helpful?</h4>
          <p className="text-sm text-gray-400 mb-4">Help us improve our documentation by providing feedback.</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <span className="material-icons-outlined text-lg">thumb_up</span>
              Yes
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <span className="material-icons-outlined text-lg">thumb_down</span>
              No
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
