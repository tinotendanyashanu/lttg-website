'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CaseManagementClientProps {
  cases: any[];
  isAdminOrEmployee: boolean;
  isAdmin: boolean;
  currentUserId: string;
}

export default function CaseManagementClient({ cases: initialCases, isAdminOrEmployee, isAdmin, currentUserId }: CaseManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const CASE_STATUSES = ['new', 'active', 'needs_assistance', 'closed'];

  const filteredCases = initialCases.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.businessName?.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q) ||
        c.serviceInterest?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCases = initialCases.length;
  const stats = CASE_STATUSES.reduce((acc, status) => {
    acc[status] = initialCases.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Case Management</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and track your active pipeline.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[300px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-icons-outlined text-xl!">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#18181b] border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm dark:text-white placeholder-gray-400" 
              placeholder="Search by name, business, or service..." 
              type="text"
            />
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
             <button 
               onClick={() => setViewMode('list')}
               className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#18181b] text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <span className="material-icons-outlined text-lg">view_list</span>
               List
             </button>
             <button 
               onClick={() => setViewMode('kanban')}
               className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-[#18181b] text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <span className="material-icons-outlined text-lg">view_kanban</span>
               Pipeline
             </button>
          </div>

          <Link
            href="/portal/employee/intern/submit-lead"
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition hover:opacity-90 active:scale-95 shadow-xl shadow-gray-900/10 whitespace-nowrap"
          >
            <span className="material-icons-outlined text-lg">add_circle</span>
            New Case
          </Link>
        </div>
      </header>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button 
          onClick={() => setStatusFilter(null)}
          className={`p-4 rounded-2xl text-left transition-all border group ${statusFilter === null ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-[#18181b] border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
        >
          <span className={`text-xs font-bold uppercase tracking-widest ${statusFilter === null ? 'text-blue-100' : 'text-gray-500'}`}>Total</span>
          <div className="text-2xl font-black mt-1">{totalCases}</div>
        </button>
        {CASE_STATUSES.map(status => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-2xl text-left transition-all border group ${statusFilter === status ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-[#18181b] border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
          >
            <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusFilter === status ? 'text-blue-100' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${
                status === 'new' ? 'bg-blue-400' : 
                status === 'active' ? 'bg-green-400' : 
                status === 'needs_assistance' ? 'bg-amber-400' : 'bg-gray-400'
              }`}></div>
              {status.replace('_', ' ')}
            </span>
            <div className="text-2xl font-black mt-1">{stats[status] || 0}</div>
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4 pb-10">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#18181b] p-20 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-500">
              <span className="material-icons-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4">inventory_2</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">No cases match your filters.</p>
              <p className="mt-2">Try adjusting your search or status filter.</p>
            </div>
          ) : (
            filteredCases.map((c: any) => (
              <CaseRow key={c._id} c={c} />
            ))
          )}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-10 min-h-[60vh] scrollbar-hide">
          {CASE_STATUSES.map(status => (
            <div key={status} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg flex items-center gap-2">
                  {status.replace('_', ' ')}
                  <span className="text-sm font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{filteredCases.filter(fc => fc.status === status).length}</span>
                </h3>
              </div>
              <div className="flex flex-col gap-4 bg-gray-50/50 dark:bg-[#111113] p-4 rounded-[32px] border border-gray-100 dark:border-gray-800 flex-1">
                {filteredCases.filter(fc => fc.status === status).map(c => (
                  <CaseCard key={c._id} c={c} />
                ))}
                {filteredCases.filter(fc => fc.status === status).length === 0 && (
                  <div className="text-center py-10 opacity-30 italic text-sm">No cases in this stage</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseRow({ c }: { c: any }) {
  return (
    <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
          c.status === 'new' ? 'bg-blue-50 text-blue-600' : 
          c.status === 'active' ? 'bg-green-50 text-green-600' :
          c.status === 'needs_assistance' ? 'bg-amber-50 text-amber-600' :
          'bg-gray-50 text-gray-600'
        }`}>
          {(c.businessName?.[0] || c.contactName?.[0] || 'C').toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{c.businessName || c.contactName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {c.contactName} · {c.serviceInterest}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-widest mb-1">Deal Value</span>
          <span className="font-bold text-gray-900 dark:text-white">{c.dealValue ? `$${c.dealValue.toLocaleString()}` : '—'}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-widest mb-1">Assigned To</span>
          <span className="font-bold text-gray-900 dark:text-white">{c.ownerId?.fullName || 'Unassigned'}</span>
        </div>
        <Link 
          href={`/portal/employee/case-management/${c._id}`} 
          className="h-12 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          Workspace
          <span className="material-icons-outlined text-lg">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

function CaseCard({ c }: { c: any }) {
  return (
    <Link 
      href={`/portal/employee/case-management/${c._id}`}
      className="bg-white dark:bg-[#18181b] p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="h-2 w-12 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className={`h-full ${
             c.urgencyLevel === 'high' ? 'bg-red-500 w-full' : 
             c.urgencyLevel === 'medium' ? 'bg-amber-500 w-2/3' : 'bg-blue-500 w-1/3'
          }`} />
        </div>
        {c.urgencyLevel === 'high' && <span className="material-icons-outlined text-red-500 text-lg animate-pulse">priority_high</span>}
      </div>
      
      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{c.businessName || c.contactName}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium truncate">{c.serviceInterest}</p>
      
      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
        <div className="flex -space-x-2">
           <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-[#18181b] flex items-center justify-center text-[10px] font-bold">
             {c.ownerId?.fullName?.[0] || 'U'}
           </div>
           {c.participants?.length > 0 && (
             <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#18181b] flex items-center justify-center text-[10px] font-bold">
               +{c.participants.length}
             </div>
           )}
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
