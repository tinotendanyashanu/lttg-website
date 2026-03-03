'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ILead } from '@/models/Lead';

interface CaseManagementClientProps {
  leads: any[];
  isAdminOrEmployee: boolean;
}

export default function CaseManagementClient({ leads: initialLeads, isAdminOrEmployee }: CaseManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Compute stats based on the full initialLeads set (or filtered set? Usually full set for top buttons)
  const totalLeads = initialLeads.length;
  const newLeads = initialLeads.filter((l) => l.status === 'new').length;
  const contactedLeads = initialLeads.filter((l) => l.status === 'contacted').length;
  const closedLeads = initialLeads.filter((l) => l.status === 'converted' || l.status === 'closed').length;
  const rejectedLeads = initialLeads.filter((l) => l.status === 'rejected').length;

  // Filter leads for the list
  const filteredLeads = initialLeads.filter((lead) => {
    // Status filter
    if (statusFilter === 'closed') {
      if (lead.status !== 'converted' && lead.status !== 'closed') return false;
    } else if (statusFilter && lead.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.businessName?.toLowerCase().includes(q);
      const matchContact = lead.contactName?.toLowerCase().includes(q);
      const matchEmail = lead.contactEmail?.toLowerCase().includes(q);
      const matchService = lead.serviceInterest?.toLowerCase().includes(q);
      
      if (!matchName && !matchContact && !matchEmail && !matchService) {
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 material-icons-outlined">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#27272a] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-gray-800 dark:focus:ring-white transition-shadow shadow-sm dark:text-white placeholder-gray-400" 
              placeholder="Search cases, contacts, emails..." 
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
          <div className="flex gap-2">
            <button className="p-3 bg-white dark:bg-[#27272a] rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm">
              <span className="material-icons-outlined block">notifications</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile search (visible only on small screens) */}
      <div className="relative w-full md:hidden">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 material-icons-outlined">search</span>
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#27272a] border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-gray-800 dark:focus:ring-white transition-shadow shadow-sm dark:text-white placeholder-gray-400" 
          placeholder="Search cases..." 
          type="text"
        />
      </div>
      
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-2 snap-x">
        <button 
          onClick={() => setStatusFilter(null)}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group snap-start ${statusFilter === null ? 'border-gray-800 dark:border-white shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">All Cases</span>
          <div className="text-2xl font-bold mt-1 group-hover:text-gray-900 dark:group-hover:text-white">{totalLeads}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('new')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'new' ? 'border-blue-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <div className="absolute right-0 top-0 p-2 opacity-10">
            <span className="material-icons-outlined text-4xl text-blue-500">fiber_new</span>
          </div>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> New
          </span>
          <div className="text-2xl font-bold mt-1">{newLeads}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('contacted')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'contacted' ? 'border-yellow-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <div className="absolute right-0 top-0 p-2 opacity-10">
            <span className="material-icons-outlined text-4xl text-yellow-500">contact_phone</span>
          </div>
          <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Contacted
          </span>
          <div className="text-2xl font-bold mt-1">{contactedLeads}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('closed')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'closed' ? 'border-green-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <div className="absolute right-0 top-0 p-2 opacity-10">
            <span className="material-icons-outlined text-4xl text-green-500">check_circle</span>
          </div>
          <span className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Closed
          </span>
          <div className="text-2xl font-bold mt-1">{closedLeads}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('rejected')}
          className={`min-w-[140px] shrink-0 bg-white dark:bg-[#27272a] p-4 rounded-xl text-left transition-all border-2 group relative overflow-hidden snap-start ${statusFilter === 'rejected' ? 'border-red-500 shadow-md' : 'border-transparent shadow-soft hover:shadow-md'}`}
        >
          <div className="absolute right-0 top-0 p-2 opacity-10">
            <span className="material-icons-outlined text-4xl text-red-500">cancel</span>
          </div>
          <span className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> Rejected
          </span>
          <div className="text-2xl font-bold mt-1">{rejectedLeads}</div>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-full min-h-0">
        {/* Cases List */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl text-center text-gray-500">
              No cases match your filters.
            </div>
          ) : (
            filteredLeads.map((lead: any) => {
              // Extract initials
              const nameParts = (lead.businessName || 'U M').split(' ');
              const initials = nameParts.length > 1 
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                : nameParts[0].substring(0, 2).toUpperCase();

              // Status styles mapping
              let statusProps = {
                badgeText: 'New',
                badgeStyle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                probText: 'Pending',
                probStyle: 'text-gray-600 dark:text-gray-400',
                avatarStyle: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-300'
              };

              switch (lead.status) {
                case 'new':
                  statusProps.badgeText = 'New Lead';
                  break;
                case 'contacted':
                  statusProps = { ...statusProps, badgeText: 'Contacted', badgeStyle: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', avatarStyle: 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-600 dark:text-purple-300' };
                  break;
                case 'qualified':
                  statusProps = { ...statusProps, badgeText: 'Proposal Sent', badgeStyle: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', probText: 'High (80%)', probStyle: 'text-green-600 dark:text-green-400', avatarStyle: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-orange-600 dark:text-orange-300' };
                  break;
                case 'converted':
                case 'closed':
                  statusProps = { ...statusProps, badgeText: 'Closed', badgeStyle: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', probText: 'Won (100%)', probStyle: 'text-green-600 dark:text-green-400', avatarStyle: 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-600 dark:text-green-300' };
                  break;
                case 'rejected':
                  statusProps = { ...statusProps, badgeText: 'Rejected', badgeStyle: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', probText: 'Lost (0%)', probStyle: 'text-red-600 dark:text-red-400', avatarStyle: 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 text-red-600 dark:text-red-300' };
                  break;
              }

              return (
                <div key={lead._id.toString()} className="bg-white dark:bg-[#27272a] p-5 rounded-2xl shadow-soft hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center font-bold text-xl ${statusProps.avatarStyle}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{lead.businessName || 'Unnamed Business'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.contactName || 'No Contact Info'} • {lead.contactEmail || 'No Email'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1 ${statusProps.badgeStyle}`}>
                        {statusProps.badgeText}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs text-right">
                        Created: {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Service</span>
                      <span className="font-semibold text-sm block capitalize">{(lead.serviceInterest || 'N/A').replace('_', ' ')}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estimated Value</span>
                      <span className="font-semibold text-sm block">{lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : 'TBD'}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Budget</span>
                      <span className="font-semibold text-sm block capitalize">{(lead.budget || 'N/A').replace('_', ' ')}</span>
                    </div>
                    <div className="bg-[#F4F4F4] dark:bg-[#18181b] p-3 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Probability</span>
                      <span className={`font-semibold text-sm block ${statusProps.probStyle}`}>{statusProps.probText}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-[#F4F4F4] dark:hover:bg-[#18181b] transition flex items-center gap-2">
                      <span className="material-icons-outlined text-base">history</span> History
                    </button>
                    {isAdminOrEmployee && (
                      <Link href={`/portal/case-management/${lead._id}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2F2F2F] text-white hover:bg-[#4a4a4a] transition shadow-sm flex items-center gap-2">
                        <span className="material-icons-outlined text-base">edit</span> Manage Case
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar (Recent Activity Placeholder) */}
        <div className="hidden xl:block w-80 shrink-0">
          <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft h-full flex flex-col sticky top-0">
            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Recent Activity</h3>
            
            <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
              {initialLeads.slice(0, 3).map((recentLead: any, idx: number) => {
                let badgeClass = "bg-blue-100 dark:bg-blue-900";
                let iconClass = "bg-blue-500";
                let textClass = "text-gray-900 dark:text-white";
                let actionText = "New case created";
                
                if (recentLead.status === 'contacted') {
                    badgeClass = "bg-yellow-100 dark:bg-yellow-900";
                    iconClass = "bg-yellow-500";
                    actionText = "Status Updated";
                    textClass = "text-yellow-600";
                } else if (recentLead.status === 'converted' || recentLead.status === 'qualified' || recentLead.status === 'closed') {
                    badgeClass = "bg-green-100 dark:bg-green-900";
                    iconClass = "bg-green-500";
                    actionText = "Case Progressed";
                    textClass = "text-green-600";
                }

                return (
                  <div key={recentLead._id.toString() + '-act'} className="relative pl-8">
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full ${badgeClass} flex items-center justify-center border-2 border-white dark:border-[#27272a] z-10`}>
                      <div className={`w-2 h-2 rounded-full ${iconClass}`}></div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white">{actionText}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {recentLead.businessName} was updated to <span className={`font-medium ${textClass}`}>{recentLead.status}</span>.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(recentLead.updatedAt || recentLead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Monthly Goal</h4>
                <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{closedLeads >= 10 ? 'Achieved' : 'On Track'}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((closedLeads / 10) * 100, 100)}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{closedLeads} closed</span>
                <span>Goal: 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
