import React from 'react';
import Link from 'next/link';

export default function KnowledgeBaseOverview() {
  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Search and Action Bar */}
      <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-2xl">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 !text-xl">
            search
          </span>
          <input
            className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white"
            placeholder="Search for answers..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button className="px-5 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap shrink-0">
                Upload Article
            </button>
            <button className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="material-icons-outlined">notifications</span>
            </button>
             <div className="h-12 w-12 shrink-0 rounded-2xl bg-center bg-cover border-2 border-white dark:border-gray-700 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ-DCmJvMsrabV5pV1Ai6ueYGxFRkP-NCcloCzzLmchCaa7LRXZVCnkZ5F3nEVuqdkUwWtH6ELRM9dRKLDfCmHU5PBRq25s3RgWBuGjPk0hK_buXxntwIhiDvdAkgijcN3aHhGsj0QT2YzDJP2qO_8hSDAA99uD9Ha6xx5spEW9J7QYxJXKmsKKplL8QPM0iWsY93jBs3nA4Kqbc_H6YE4NRsdMuQ3HfurU1sCCHRIxo2JHan48AvexdyrI_oqhX7B8VMpPsMkQ3k")' }}></div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest">
            <span>Home</span>
            <span className="material-icons-outlined !text-[12px]">chevron_right</span>
            <span>Sales</span>
            <span className="material-icons-outlined !text-[12px]">chevron_right</span>
            <span className="text-blue-500">Scripts</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {/* Article Card 1 */}
            <Link href="/portal/knowledge-base/q3-sales-pitch" className="block outline-none">
              <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 group cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                      Sales
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900 flex items-center gap-1">
                      <span className="material-icons-outlined !text-[10px] fill">verified</span> Verified
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">Published 2h ago</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Q3 Sales Pitch Deck Guide
                </h2>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl text-sm sm:text-base line-clamp-2 md:line-clamp-3">
                  Updated guidelines for presenting the Q3 value proposition to enterprise clients. Focus on outcomes over features and ROI calculations for the C-suite...
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-center bg-cover border border-gray-200 dark:border-gray-700 shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCUijKDbBvOcFR680wkHRdEIAmO84ojowbz0zKpePJyivsGi_wF8YPqiRJhuH8ZLC192HeJNGygkiOmv25Vdx5U30XK5XGIbSiNYpVK54kKFImGYJu-gaPqIi50Ptsr0ZvtL8PMCsAZM3vzVjMA2UjoDCO9dXMrTKD-FUYyTBMvSUcPcuMCzOauDv7sN5Wp8saGaC4rK4bs67xAwi7mPWMcNLpMc6d42tjMoHFVrUFa3FCQJqOwomNF1Il8AsJQZz6XQYQwD52S-A4")' }}></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Alex Morgan</p>
                      <p className="text-[11px] text-gray-400 mt-1">Sales Director</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                      <span className="material-icons-outlined !text-lg">thumb_up</span>
                      <span className="text-xs font-bold">124</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="material-icons-outlined !text-lg">visibility</span>
                      <span className="text-xs font-bold">1.2k</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Article Card 2 */}
            <Link href="/portal/knowledge-base/handling-pricing-pushback" className="block outline-none">
              <div className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 group cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900">
                    Objection
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">1d ago</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Handling Pricing Pushback
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                  Detailed talk tracks for when prospects mention competitor pricing or budget freezes.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                      <span className="material-icons-outlined !text-sm text-gray-500 dark:text-gray-400">person</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sarah Jenkins</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
                    <span className="material-icons-outlined !text-lg">thumb_up</span>
                    <span className="text-xs font-bold">89</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 flex shrink-0 flex-col gap-6">
          
          <section className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white">Popular Articles</h3>
              <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">View all</button>
            </div>
            
            <div className="space-y-4">
              <Link href="/portal/knowledge-base/commission-2024-faq" className="block outline-none">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-blue-600 dark:text-blue-400 fill">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Commission 2024 FAQ
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Updated 2 days ago</p>
                  </div>
                  <div className="text-[10px] font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Active</div>
                </div>
              </Link>

              <Link href="/portal/knowledge-base/onboarding-checklist" className="block outline-none">
                <div className="flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <span className="material-icons-outlined text-purple-600 dark:text-purple-400 fill">school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Onboarding Checklist
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Week 1 Essentials</p>
                  </div>
                  <div className="text-[10px] font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Active</div>
                </div>
              </Link>
            </div>
          </section>

          <section className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#enterprise_sales', '#compliance', '#q3_goals', '#scripts'].map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-[#27272a] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex-1 bg-linear-to-b from-white to-gray-50/50 dark:from-[#27272a] dark:to-gray-900/30 flex flex-col items-center xl:items-stretch text-center xl:text-left">
            <div className="flex items-center gap-2 mb-6 justify-center xl:justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <span className="material-icons-outlined text-blue-600 dark:text-blue-400 !text-lg">auto_awesome</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Recommended for You</h3>
            </div>
            
            <div className="bg-white dark:bg-[#323236] rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-4 text-left w-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Based on your role</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 ml-2 leading-tight">
                Advanced CRM Automations for High-Volume Outreach
              </h4>
              <button className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group ml-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Start Reading
                <span className="material-icons-outlined !text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            
            <div className="p-4 mt-auto">
              <p className="text-xs text-gray-500 dark:text-gray-400">Join the discussion on internal documentation! ⚡</p>
              <div className="flex items-center justify-center xl:justify-start gap-2 mt-4">
                <div className="flex -space-x-2">
                  <img 
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-[#27272a] bg-gray-200 dark:bg-gray-700 object-cover" 
                    alt="user" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRfHGO7tToHNRkMnO5a4OtClFjxtXT-flI6fsm4h_G7cATzIQuYhXCM3TEHN8lHCtg4K4LshVaMiA_5r23JoHtMJoqce0Bm68xh1PCw3liuGptFAAfHMXR3NKUDRm9bgX1D2l6jCvXnbnHuhSY8cFzHanRdrenwR0xQVLxqn_LMm1EBLzVg6RoI8HWh415E5zsraZ0vBxemt6CdQQtwF1clkjOiteWDmTxyrHN38UhDAVFL6Ull4_wce6LH0AGmFOCkd5hw0-D_gc"
                  />
                  <img 
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-[#27272a] bg-gray-200 dark:bg-gray-700 object-cover" 
                    alt="user" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWEjns86zJLEi423wsXVEiBes4Zb9gHbR94mGVRCY42LSg3hIy_Vu_sE1aAfypMT8aNY7N4Y29aOWoK_gmGHlMM1fbF4NhtIeWMjKXCMuyElqbsPngM4qJUD66rb_NhVcHlHH_lFNADgDWy7PFr5hVb_qKOo0U13o47OOPgh3t_4_r6dZf8c46h3iIuWkJsmjmsjjpBu3eY1rWxFoa4a1ql4x393peOaJavn3B5BxQ4Z19umXpUoAhqQR8Pe77yKBSGa5j66lNPnM"
                  />
                  <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#27272a] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    +12
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
