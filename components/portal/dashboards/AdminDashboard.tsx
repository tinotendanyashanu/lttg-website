import React from 'react';
import KnowledgeBaseOverview from '../knowledge-base/KnowledgeBaseOverview';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="flex flex-col xl:flex-row gap-6 h-full w-full">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center mb-[-10px]">
          <h2 className="text-lg shrink-0 font-semibold text-gray-800 dark:text-gray-100">Overview</h2>
          <button className="text-sm text-gray-500 flex shrink-0 items-center gap-1 bg-white dark:bg-[#27272a] px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            Last month <span className="material-icons-outlined text-base">expand_more</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 relative group hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span className="material-icons-outlined text-lg">folder_shared</span>
                <span className="font-medium">Total Leads</span>
              </div>
              <span className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                <span className="material-icons-outlined text-xs transform rotate-180">arrow_outward</span> 36.8%
              </span>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-bold text-gray-900 dark:text-white">1,293</h3>
              <span className="text-sm text-gray-400 pb-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 relative group hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span className="material-icons-outlined text-lg">account_balance_wallet</span>
                <span className="font-medium">Pending Commissions</span>
              </div>
              <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                <span className="material-icons-outlined text-xs">arrow_outward</span> 36.8%
              </span>
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-bold text-gray-900 dark:text-white">$256k</h3>
              <span className="text-sm text-gray-400 pb-2">vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">857 new customers today!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Send a welcome message to all new customers.</p>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto pb-2 scrollbar-none">
            {[
              { name: 'Gladyce', initial: 'G' },
              { name: 'Elbert', initial: 'E' },
              { name: 'Dash', initial: 'D' },
              { name: 'Joyce', initial: 'J' },
              { name: 'Marina', initial: 'M' }
            ].map((user, idx) => (
              <div key={idx} className="text-center group cursor-pointer shrink-0">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300 mb-2 border-2 border-transparent group-hover:border-brand-primary transition-all">
                  {user.initial}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{user.name}</span>
              </div>
            ))}
            <div className="text-center ml-auto shrink-0">
              <button className="w-14 h-14 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all mb-2 cursor-pointer">
                <span className="material-icons-outlined">arrow_forward</span>
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">View all</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 flex-1 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center z-10 relative">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Lead Activity Volume</h2>
            <button className="text-sm text-gray-500 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full shrink-0">
              Last 7 days <span className="material-icons-outlined text-base">expand_more</span>
            </button>
          </div>
          <div className="flex items-end justify-between h-48 mt-8 px-4 z-10 relative">
            <div className="w-full absolute bottom-0 left-0 text-[10rem] font-bold text-gray-50 dark:text-white/5 pointer-events-none z-0 leading-none tracking-tighter">
              $10.2m
            </div>
            <div className="w-8 md:w-12 bg-gray-100 dark:bg-gray-700 rounded-t-lg h-24 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
            <div className="w-8 md:w-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg h-32 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
            <div className="w-8 md:w-12 bg-gray-100 dark:bg-gray-700 rounded-t-lg h-20 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
            <div className="w-8 md:w-12 bg-linear-to-t from-green-200 to-green-400 dark:from-green-900 dark:to-green-600 rounded-t-lg h-48 shadow-glow relative group cursor-pointer z-20">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                2.2m Leads
                <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-brand-primary rotate-45"></div>
              </div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-2 border-green-500 rounded-full"></div>
            </div>
            <div className="w-8 md:w-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg h-28 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
            <div className="w-8 md:w-12 bg-gray-100 dark:bg-gray-700 rounded-t-lg h-16 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
            <div className="w-8 md:w-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg h-36 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer z-10"></div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full xl:w-96 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 flex-1">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Recent Leads</h2>
          <div className="space-y-6">
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span className="material-icons-outlined">business</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm group-hover:text-brand-primary transition-colors truncate">TechCorp Systems</h4>
                <p className="text-xs text-gray-400 truncate">Software Upgrade</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white">$3,250</div>
                <span className="text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 relative overflow-hidden shrink-0">
                <span className="material-icons-outlined">brush</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm group-hover:text-brand-primary transition-colors truncate">Bento Studio</h4>
                <p className="text-xs text-gray-400 truncate">New Illustration</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white">$7,890</div>
                <span className="text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <span className="material-icons-outlined">flight</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm group-hover:text-brand-primary transition-colors truncate">Travel Agency X</h4>
                <p className="text-xs text-gray-400 truncate">Web Redesign</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white">$1,500</div>
                <span className="text-[10px] font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">Offline</span>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <span className="material-icons-outlined">spa</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm group-hover:text-brand-primary transition-colors truncate">SimpleSocial Inc</h4>
                <p className="text-xs text-gray-400 truncate">Design Kit</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white">$9,999</div>
                <span className="text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>

          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            All Leads
          </button>
        </div>

        <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Comments</h2>
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">J</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Joyce</span>
                  <span className="text-xs text-gray-400">on Bento Pro 2.0</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Great work! When will the HTML version be available? ⚡
                </p>
                <div className="mt-2 text-[10px] text-gray-400">09:00 AM</div>
              </div>
            </div>
            
            <div className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">G</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Gladyce</span>
                  <span className="text-xs text-gray-400">on Food Delivery App</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  This is amazing! I really like the color palette used here.
                </p>
                <div className="mt-2 text-[10px] text-gray-400">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Knowledge Base Section */}
      <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 w-full mt-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Knowledge Base</h2>
        <KnowledgeBaseOverview />
      </div>
    </div>
  );
}
