'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { updateAdminCaseStatus, updateAdminCaseDealValue, updateAdminCaseParticipants, closeAdminCase, addAdminCaseNote, getAdminCaseCommissions } from '@/lib/actions/portal-admin';
import { useRouter } from 'next/navigation';
import CaseActivityTimeline from '@/components/admin/CaseActivityTimeline';
import InternalNotesPanel from '@/components/admin/InternalNotesPanel';

// SLA: days since last update — drives the staleness badge
function getSLAStatus(updatedAt: string, status: string): { label: string; color: string } | null {
  if (status === 'closed') return null;
  const days = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days >= 7) return { label: `${Math.floor(days)}d inactive`, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (days >= 3) return { label: `${Math.floor(days)}d no update`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return null;
}

const URGENCY_COLORS: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CaseClientView({ initialCases, users }: { initialCases: any[], users: any[] }) {
  const router = useRouter();
  const [cases, setCases] = useState(initialCases);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterParticipant, setFilterParticipant] = useState('all');
  const [filterSLA, setFilterSLA] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selected case for editing
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isManagingParticipants, setIsManagingParticipants] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  // Commission Breakdown
  const [commissions, setCommissions] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);

  // Sidebar tab
  const [sidebarTab, setSidebarTab] = useState<'details' | 'activity' | 'notes'>('details');

  useEffect(() => {
    if (selectedCase) {
       getAdminCaseCommissions(selectedCase._id).then(res => {
          if (res.success) {
             setCommissions(res.commissions);
             setAllocations(res.allocations);
          }
       });
    } else {
       setCommissions(null);
       setAllocations([]);
    }
  }, [selectedCase]);

  const filteredCases = useMemo(() => {
    return cases.filter((c: any) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterOwner !== 'all' && c.ownerId?._id !== filterOwner) return false;
      if (filterParticipant !== 'all' && !c.participants?.some((p: any) => p._id === filterParticipant)) return false;

      if (filterSLA !== 'all') {
        const days = (Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (filterSLA === 'stale' && (days < 3 || c.status === 'closed')) return false;
        if (filterSLA === 'inactive' && (days < 7 || c.status === 'closed')) return false;
      }

      if (startDate && new Date(c.createdAt) < new Date(startDate)) return false;
      if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         if (new Date(c.createdAt) > end) return false;
      }

      return true;
    });
  }, [cases, filterStatus, filterOwner, filterParticipant, filterSLA, startDate, endDate]);

  const uniqueOwners = useMemo(() => {
     const owners = new Map();
     cases.forEach((c: any) => {
         if (c.ownerId) owners.set(c.ownerId._id, c.ownerId.fullName || c.ownerId.email);
     });
     return Array.from(owners.entries());
  }, [cases]);

  const handleUpdateDealValue = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!selectedCase) return;
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     const dealValue = parseFloat(formData.get('dealValue') as string);
     
     try {
       await updateAdminCaseDealValue(selectedCase._id, dealValue);
       setCases(cases.map((c: any) => c._id === selectedCase._id ? { ...c, dealValue } : c));
       setSelectedCase(null);
       router.refresh();
     } catch (err) {
       console.error("Failed to update deal value", err);
     } finally {
       setIsUpdating(false);
     }
  };

  const handleUpdateStatus = async (caseId: string, status: string) => {
      try {
        await updateAdminCaseStatus(caseId, status);
        setCases(cases.map((c: any) => c._id === caseId ? { ...c, status } : c));
        router.refresh();
      } catch (err) {
        console.error("Failed to update status", err);
      }
  };

  const handleCloseCase = async (caseId: string) => {
      if (!confirm("Are you sure you want to close this case? This cannot be undone.")) return;
      try {
        await closeAdminCase(caseId);
        setCases(cases.map((c: any) => c._id === caseId ? { ...c, status: 'closed' } : c));
        setSelectedCase(null);
        router.refresh();
      } catch (err) {
        console.error("Failed to close case", err);
      }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !noteText.trim()) return;
    setIsUpdating(true);
    try {
      await addAdminCaseNote(selectedCase._id, noteText);
      const timestamp = new Date().toLocaleString();
      const newNoteEntry = `\n[${timestamp} - You]: ${noteText}`;
      setCases(cases.map((c: any) => c._id === selectedCase._id ? { ...c, notes: (c.notes || '') + newNoteEntry } : c));
      setSelectedCase({ ...selectedCase, notes: (selectedCase.notes || '') + newNoteEntry });
      setNoteText('');
      router.refresh();
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleParticipant = async (userId: string) => {
     if (!selectedCase) return;
     const currentParticipants = selectedCase.participants?.map((p: any) => p._id) || [];
     let newParticipants: string[];
     if (currentParticipants.includes(userId)) {
        newParticipants = currentParticipants.filter((id: string) => id !== userId);
     } else {
        newParticipants = [...currentParticipants, userId];
     }
     
     setIsUpdating(true);
     try {
        await updateAdminCaseParticipants(selectedCase._id, newParticipants);
        const updatedParticipantObjs = users.filter((u: any) => newParticipants.includes(u._id));
        setCases(cases.map((c: any) => c._id === selectedCase._id ? { ...c, participants: updatedParticipantObjs } : c));
        setSelectedCase({ ...selectedCase, participants: updatedParticipantObjs });
        router.refresh();
     } catch (err) {
        console.error("Failed to update participants", err);
     } finally {
        setIsUpdating(false);
     }
  };

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Statuses</option>
             <option value="new">New</option>
             <option value="active">Active</option>
             <option value="needs_assistance">Needs Assistance</option>
             <option value="closed">Closed</option>
          </select>
          <select 
            value={filterOwner} 
            onChange={e => setFilterOwner(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Owners</option>
             {uniqueOwners.map(([id, name]: any) => (
                <option key={id} value={id}>{name}</option>
             ))}
          </select>
          <select
            value={filterParticipant}
            onChange={e => setFilterParticipant(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Participants</option>
             {users.map((u: any) => (
                <option key={u._id} value={u._id}>{u.fullName || u.email}</option>
             ))}
          </select>
          <select
            value={filterSLA}
            onChange={e => setFilterSLA(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Activity</option>
            <option value="stale">Stale (3+ days)</option>
            <option value="inactive">Inactive (7+ days)</option>
          </select>
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-500 font-medium">From:</span>
             <input 
               type="date" 
               value={startDate} 
               onChange={e => setStartDate(e.target.value)}
               className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
             />
             <span className="text-xs text-gray-500 font-medium">To:</span>
             <input 
               type="date" 
               value={endDate} 
               onChange={e => setEndDate(e.target.value)}
               className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
             />
          </div>
       </div>

       {/* Cases List */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
             {filteredCases.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">inbox</span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No cases found matching filters.</p>
                </div>
             ) : (
                filteredCases.map((c: any) => (
                   <div 
                     key={c._id} 
                     onClick={() => { setSelectedCase(c); setSidebarTab('details'); }}
                     className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedCase?._id === c._id ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{c.businessName || 'Unnamed Business'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{c.contactName} • {c.email} • {c.serviceInterest}</p>
                         </div>
                         <div className="flex items-center gap-1.5 flex-wrap justify-end">
                           {c.urgencyLevel && (
                             <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${URGENCY_COLORS[c.urgencyLevel.toLowerCase()] || URGENCY_COLORS.medium}`}>
                               {c.urgencyLevel}
                             </span>
                           )}
                           {(() => {
                             const sla = getSLAStatus(c.updatedAt, c.status);
                             return sla ? (
                               <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sla.color}`}>
                                 <span className="material-icons-outlined text-[11px]">schedule</span>
                                 {sla.label}
                               </span>
                             ) : null;
                           })()}
                           <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${c.status === 'closed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : c.status === 'needs_assistance' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                             {c.status.replace('_', ' ')}
                           </span>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mt-4">
                         <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                           <span className="material-icons-outlined text-[16px]">person</span>
                           Owner: {c.ownerId?.fullName || c.ownerId?.email || 'N/A'}
                         </div>
                         <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                           <span className="material-icons-outlined text-[16px]">attach_money</span>
                           Deal Value: ${c.dealValue || 0}
                         </div>
                         <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                           <span className="material-icons-outlined text-[16px]">group</span>
                           Participants: {c.participants?.length || 0}
                         </div>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Details / Editor Sidebar */}
          <div className="xl:col-span-1">
             {selectedCase ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                   {/* Sidebar tabs */}
                   <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                     {(['details', 'notes', 'activity'] as const).map((tab) => (
                       <button
                         key={tab}
                         onClick={() => setSidebarTab(tab)}
                         className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                           sidebarTab === tab
                             ? 'bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white shadow-sm'
                             : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                         }`}
                       >
                         {tab === 'activity' ? 'Activity' : tab === 'notes' ? 'Notes' : 'Details'}
                       </button>
                     ))}
                   </div>

                   {sidebarTab === 'activity' ? (
                     <div className="max-h-[600px] overflow-y-auto">
                       <CaseActivityTimeline caseId={selectedCase._id} />
                     </div>
                   ) : sidebarTab === 'notes' ? (
                     <div className="max-h-[600px] overflow-y-auto">
                       <InternalNotesPanel entityType="case" entityId={selectedCase._id} />
                     </div>
                   ) : (
                   <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                        <select
                          disabled={selectedCase.status === 'closed'}
                          value={selectedCase.status}
                          onChange={(e) => handleUpdateStatus(selectedCase._id, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none mb-2"
                        >
                           <option value="new">New</option>
                           <option value="active">Active</option>
                           <option value="needs_assistance">Needs Assistance</option>
                           <option value="closed" disabled>Closed</option>
                        </select>
                      </div>

                      <form onSubmit={handleUpdateDealValue}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Deal Value ($)</p>
                        <div className="flex gap-2">
                           <input
                             type="number"
                             name="dealValue"
                             defaultValue={selectedCase.dealValue || 0}
                             disabled={selectedCase.status === 'closed'}
                             className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                           />
                           {selectedCase.status !== 'closed' && (
                             <button disabled={isUpdating} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                                Save
                             </button>
                           )}
                        </div>
                      </form>

                      <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 mt-4 flex justify-between items-center">
                             Participants
                             {selectedCase.status !== 'closed' && (
                                <button 
                                  onClick={() => setIsManagingParticipants(!isManagingParticipants)}
                                  className="text-brand-primary hover:underline normal-case"
                                >
                                  {isManagingParticipants ? 'Done' : 'Manage'}
                                </button>
                             )}
                          </p>
                          <div className={`space-y-2 ${isManagingParticipants ? 'max-h-60' : 'max-h-40'} overflow-y-auto mt-2`}>
                             {isManagingParticipants ? (
                                users.map((u: any) => {
                                   const isPart = selectedCase.participants?.some((p: any) => p._id === u._id);
                                   return (
                                      <div key={u._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer" onClick={() => handleToggleParticipant(u._id)}>
                                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${isPart ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-300'}`}>
                                            {isPart && <span className="material-icons-outlined text-[12px]">check</span>}
                                         </div>
                                         <div className="flex-1">
                                            <p className="text-sm font-medium">{u.fullName}</p>
                                            <p className="text-[10px] text-gray-400">{u.email}</p>
                                         </div>
                                      </div>
                                   );
                                })
                             ) : (
                                <>
                                   {selectedCase.participants?.map((p: any) => (
                                      <div key={p._id} className="text-sm bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg flex justify-between items-center group">
                                         <span>{p.fullName || p.email}</span>
                                      </div>
                                   ))}
                                   {(!selectedCase.participants || selectedCase.participants.length === 0) && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">No participants added.</p>
                                   )}
                                </>
                             )}
                          </div>
                       </div>

                       {/* Notes Section */}
                       <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Case Notes</p>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] mb-3">
                             {selectedCase.notes || 'No notes yet.'}
                          </div>
                          <form onSubmit={handleAddNote} className="flex gap-2">
                             <input 
                               value={noteText}
                               onChange={e => setNoteText(e.target.value)}
                               placeholder="Add a note..."
                               className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                             />
                             <button type="submit" className="bg-gray-200 dark:bg-gray-700 p-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                <span className="material-icons-outlined text-[18px]">send</span>
                             </button>
                          </form>
                       </div>

                       {/* Commission Breakdown for Closed Cases */}
                       {selectedCase.status === 'closed' && (allocations.length > 0 || commissions) && (
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-3">Commission Breakdown</p>
                             <div className="space-y-3">
                                {commissions && (
                                   <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                      <span className="text-xs font-semibold">Total Pool</span>
                                      <span className="text-sm font-bold text-brand-primary">${commissions.totalCommission.toLocaleString()}</span>
                                   </div>
                                )}
                                {allocations.map((a: any) => (
                                   <div key={a._id} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-500">{a.accountId?.fullName || 'N/A'}</span>
                                      <div className="text-right">
                                         <p className="font-semibold">${a.amount.toLocaleString()}</p>
                                         <p className={`text-[10px] ${a.status === 'paid' ? 'text-green-500' : 'text-orange-500'}`}>{a.status}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}

                       <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                          {selectedCase.status !== 'closed' ? (
                            <button
                              onClick={() => handleCloseCase(selectedCase._id)}
                              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg shadow-green-600/20"
                            >
                              <span className="material-icons-outlined text-xl">check_circle</span>
                              Close Case
                            </button>
                          ) : (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-center border border-green-100 dark:border-green-900/30">
                               <span className="material-icons-outlined text-3xl mb-1">verified</span>
                               <p className="font-bold text-sm">Case Closed</p>
                               <p className="text-xs mt-1">Finalized on {selectedCase.closedAt ? new Date(selectedCase.closedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          )}
                       </div>
                   </div>
                   )} {/* end sidebarTab conditional */}
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[400px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">touch_app</span>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Select a case to view details</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
