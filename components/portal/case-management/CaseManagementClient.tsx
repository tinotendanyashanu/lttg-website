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

  const totalCases = initialCases.length;
  const newCases = initialCases.filter((c) => c.status === 'new').length;
  const activeCases = initialCases.filter((c) => c.status === 'active').length;
  const needsAssistanceCases = initialCases.filter((c) => c.status === 'needs_assistance').length;
  const closedCases = initialCases.filter((c) => c.status === 'closed').length;

  const filteredCases = initialCases.filter((c) => {
    if (statusFilter && c.status !== statusFilter) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.businessName?.toLowerCase().includes(q);
      const matchContact = c.contactName?.toLowerCase().includes(q);
      const matchService = c.serviceInterest?.toLowerCase().includes(q);
      
      if (!matchName && !matchContact && !matchService) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cases</h2>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-full max-w-md hidden md:block">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 material-icons-outlined text-xl!">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#27272a] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-gray-800 dark:focus:ring-white transition-shadow shadow-sm dark:text-white placeholder-gray-400" 
              placeholder="Search cases, contacts..." 
              type="text"
            />
          </div>
          <Link 
            href="/portal/intern/submit-lead"
            className="bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-transform active:scale-95 shadow-lg whitespace-nowrap"
          >
            <span className="material-icons-outlined text-lg">add</span>
            Create Case
          </Link>
        </div>
      </header>
      
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-2 snap-x">
        <button 
          onClick={() => setStatusFilter(null)}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group snap-start ${statusFilter === null ? 'border-gray-800 dark:border-white shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">All Cases</span>
          <div className="text-2xl font-bold mt-1 group-hover:text-gray-900 dark:group-hover:text-white">{totalCases}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('new')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'new' ? 'border-blue-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> New
          </span>
          <div className="text-2xl font-bold mt-1">{newCases}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('active')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'active' ? 'border-green-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
          </span>
          <div className="text-2xl font-bold mt-1">{activeCases}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('needs_assistance')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'needs_assistance' ? 'border-yellow-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Assistance Needed
          </span>
          <div className="text-2xl font-bold mt-1">{needsAssistanceCases}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('closed')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'closed' ? 'border-gray-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-gray-600 dark:text-gray-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Closed
          </span>
          <div className="text-2xl font-bold mt-1">{closedCases}</div>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-full min-h-0">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl text-center text-gray-500">
              No cases match your filters.
            </div>
          ) : (
            filteredCases.map((c: any) => {
              const nameParts = (c.businessName || 'U M').split(' ');
              const initials = nameParts.length > 1 
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : nameParts[0].substring(0, 2).toUpperCase();

              let statusProps = {
                badgeText: 'New',
                badgeStyle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                avatarStyle: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-300'
              };

              switch (c.status) {
                case 'new':
                  break;
                case 'active':
                  statusProps = { badgeText: 'Active', badgeStyle: 'bg-green-100 text-green-700', avatarStyle: 'from-green-100 text-green-600' };
                  break;
                case 'needs_assistance':
                  statusProps = { badgeText: 'Needs Assist', badgeStyle: 'bg-yellow-100 text-yellow-700', avatarStyle: 'from-yellow-100 text-yellow-600' };
                  break;
                case 'closed':
                  statusProps = { badgeText: 'Closed', badgeStyle: 'bg-gray-100 text-gray-700', avatarStyle: 'from-gray-100 text-gray-600' };
                  break;
              }

              return (
                <div key={c._id.toString()} className="bg-white dark:bg-[#27272a] p-5 rounded-2xl shadow-soft hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center font-bold text-xl ${statusProps.avatarStyle}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{c.businessName || c.contactName || 'Unnamed Case'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {c.businessName ? `${c.contactName} • ` : ''}
                          {c.email ? `${c.email} • ` : ''}
                          {c.phone || 'No Phone'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1 ${statusProps.badgeStyle}`}>
                        {statusProps.badgeText}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs text-right">
                        Created: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Service</span>
                      <span className="font-semibold text-sm block capitalize">{(c.serviceInterest || 'N/A').replace('_', ' ')}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Deal Value</span>
                      <span className="font-semibold text-sm block">{c.dealValue ? `$${c.dealValue.toLocaleString()}` : 'TBD'}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Owner</span>
                      <span className="font-semibold text-sm block">{c.ownerId?.fullName || 'Unknown'}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Participants</span>
                      <span className="font-semibold text-sm block">{c.participants?.length || 1} Mbrs</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Link href={`/portal/case-management/${c._id}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2F2F2F] text-white hover:bg-[#4a4a4a] transition shadow-sm flex items-center gap-2">
                      <span className="material-icons-outlined text-base">visibility</span> View Case Workspace
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
