'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { markCommissionPaid } from './actions';
import { payInternEmployeeCommission, approveInternEmployeeCommissions } from '@/lib/actions/portal-admin';

export default function CommissionManagerClient({ 
  initialCommissions, 
  initialAllocations,
  internalCommissions = []
}: { 
  initialCommissions: any[], 
  initialAllocations: any[],
  internalCommissions?: any[] 
}) {
  const router = useRouter();
  const [commissions, setCommissions] = useState(initialCommissions);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [internComms, setInternComms] = useState(internalCommissions);
  const [isPaying, setIsPaying] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'partners' | 'internal'>('partners');

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Payout modal state
  const [payingCommId, setPayingCommId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payReference, setPayReference] = useState('');
  const [payError, setPayError] = useState('');

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      // If filtering by user, we need to check if this user has an allocation in this case commission
      if (filterUser !== 'all') {
         const hasUserAllocation = allocations.some(a => a.caseCommissionId === c._id && a.accountId?._id === filterUser);
         if (!hasUserAllocation) return false;
      }
      return true;
    });
  }, [commissions, filterStatus, filterUser, allocations]);

  const uniqueUsers = useMemo(() => {
     const users = new Map();
     allocations.forEach(a => {
         if (a.accountId) users.set(a.accountId._id, a.accountId.fullName || a.accountId.email);
     });
     return Array.from(users.entries());
  }, [allocations]);

  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.totalCommission || 0), 0);
  const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.totalCommission || 0), 0);

  const handleMarkPaid = async (e: React.FormEvent, allocationId: string) => {
     e.preventDefault();
     try {
       await markCommissionPaid(allocationId);
       setAllocations(allocations.map(a => a._id === allocationId ? { ...a, status: 'paid' } : a));
       
       // Note: In a real system, we'd also check if all allocations for the case are paid to update the CaseCommission status
       // but for UI optimism, we just refresh the server state
       router.refresh();
     } catch (err) {
       console.error("Failed to mark paid", err);
     }
  };

  const handlePayInternalComm = async () => {
    if (!payingCommId) return;
    if (!payReference.trim()) { setPayError('Reference / payment note is required.'); return; }
    setPayError('');
    try {
      setIsPaying(true);
      await payInternEmployeeCommission(payingCommId, payMethod, payReference.trim());
      setInternComms(internComms.map(c => c._id === payingCommId ? { ...c, status: 'paid' } : c));
      setPayingCommId(null);
      setPayReference('');
      router.refresh();
    } catch (err: any) {
      setPayError(err.message || 'Failed to process payout. Check the approved balance.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Approve all pending commissions?')) return;
    try {
      setIsPaying(true);
      await approveInternEmployeeCommissions();
      setInternComms(internComms.map(c => c.status === 'pending' ? { ...c, status: 'approved' } : c));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve commissions.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'partners'
              ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Partner Commissions
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'internal'
              ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Intern & Employee Commissions
        </button>
      </div>

      {activeTab === 'partners' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Case Commissions</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{commissions.length}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Pending Liability</p>
          <p className="text-3xl font-bold text-yellow-500">${totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Paid Commissions</p>
          <p className="text-3xl font-bold text-green-500">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Statuses</option>
             <option value="pending">Pending</option>
             <option value="paid">Paid</option>
          </select>
          <select 
            value={filterUser} 
            onChange={e => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
             <option value="all">All Users</option>
             {uniqueUsers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
             ))}
          </select>
       </div>

       {/* Table */}
       <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/20">
                 <th className="px-6 py-4">Case / Business</th>
                 <th className="px-6 py-4">Total Commission</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Date Closed</th>
                 <th className="px-6 py-4 text-right">Details</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
               {filteredCommissions.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-16 text-center">
                     <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">receipt_long</span>
                     <p className="text-gray-400 dark:text-gray-500">No commissions found.</p>
                   </td>
                 </tr>
               ) : (
                 filteredCommissions.map((comm) => (
                   <React.Fragment key={comm._id}>
                     <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                             {(comm.caseId?.businessName?.[0] || 'C').toUpperCase()}
                           </div>
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                             {comm.caseId?.businessName || 'Unnamed Case'}
                           </span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                         ${(comm.totalCommission || 0).toFixed(2)}
                       </td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                           comm.status === 'paid'
                             ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                             : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                         }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${comm.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                           {comm.status === 'paid' ? 'Paid' : 'Pending'}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
                         {new Date(comm.caseId?.closedAt || comm.createdAt).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button
                           onClick={() => setExpandedCaseId(expandedCaseId === comm._id ? null : comm._id)}
                           className="text-brand-primary hover:underline text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                         >
                           {expandedCaseId === comm._id ? 'Hide Allocations' : 'View Breakdown'}
                           <span className="material-icons-outlined text-[16px]">{expandedCaseId === comm._id ? 'expand_less' : 'expand_more'}</span>
                         </button>
                       </td>
                     </tr>
                     {/* Expandable row for allocations */}
                     {expandedCaseId === comm._id && (
                       <tr>
                         <td colSpan={5} className="p-0 bg-gray-50/30 dark:bg-[#18181B] border-t border-gray-100 dark:border-gray-800">
                            <div className="px-12 py-6">
                               <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Allocation Breakdown</h4>
                               <div className="bg-white dark:bg-[#27272A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                  <table className="w-full text-left text-sm">
                                     <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                                           <th className="px-4 py-3 font-medium">User</th>
                                           <th className="px-4 py-3 font-medium">Role</th>
                                           <th className="px-4 py-3 font-medium">Allocated Amount</th>
                                           <th className="px-4 py-3 font-medium">Status</th>
                                           <th className="px-4 py-3 font-medium text-right">Action</th>
                                        </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {allocations.filter(a => a.caseCommissionId === comm._id).length === 0 ? (
                                           <tr>
                                              <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No allocations configured for this case yet.</td>
                                           </tr>
                                        ) : (
                                          allocations.filter(a => a.caseCommissionId === comm._id).map(alloc => (
                                             <tr key={alloc._id}>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                   {alloc.accountId?.fullName || alloc.accountId?.email}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">
                                                   {alloc.accountId?.roles?.[0] || 'Unknown'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                   ${alloc.allocatedAmount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                     alloc.status === 'paid'
                                                       ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                       : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                   }`}>
                                                     {alloc.status}
                                                   </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                   {alloc.status === 'pending' ? (
                                                     <form onSubmit={(e) => handleMarkPaid(e, alloc._id)}>
                                                       <button
                                                         type="submit"
                                                         className="text-xs bg-brand-primary text-white hover:opacity-90 px-3 py-1.5 rounded-lg font-medium transition-opacity"
                                                       >
                                                         Mark Paid
                                                       </button>
                                                     </form>
                                                   ) : (
                                                     <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                       Paid on {new Date(alloc.paidAt || alloc.updatedAt).toLocaleDateString()}
                                                     </span>
                                                   )}
                                                </td>
                                             </tr>
                                          ))
                                        )}
                                     </tbody>
                                  </table>
                               </div>
                            </div>
                         </td>
                       </tr>
                     )}
                   </React.Fragment>
                 ))
               )}
             </tbody>
           </table>
         </div>
       </div>
       </>
      ) : (
        /* Internal Commissions Tab */
        <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Internal Commissions Overview</h3>
             <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                   <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                     Approved: ${internComms.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                   </span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                     Pending: ${internComms.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                   </span>
                </div>
                {internComms.some(c => c.status === 'pending') && (
                  <button
                    onClick={handleApproveAll}
                    disabled={isPaying}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Approve All Pending
                  </button>
                )}
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/20">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Case / Business</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {internComms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-5xl block mb-3">group_off</span>
                      <p className="text-gray-400 dark:text-gray-500">No internal commissions found.</p>
                    </td>
                  </tr>
                ) : (
                  internComms.map((comm) => (
                    <tr key={comm._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {comm.accountId?.profileImageUrl ? (
                             <img src={comm.accountId.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm bg-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {(comm.accountId?.fullName?.[0] || comm.accountId?.email?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">
                              {comm.accountId?.fullName || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">{comm.accountId?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                         {comm.role} ({(comm.commissionRate * 100).toFixed(0)}%)
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">
                          {comm.caseId?.businessName || 'Unnamed Case'}
                        </span>
                        <span className="text-xs text-gray-500">{comm.caseId?.caseId}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        ${(comm.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          comm.status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          comm.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                          'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {comm.status === 'pending' && (
                           <span className="text-xs text-orange-500 font-medium">Awaiting approval</span>
                         )}
                         {comm.status === 'approved' && (
                           <button
                             onClick={() => { setPayingCommId(comm._id); setPayError(''); setPayReference(''); setPayMethod('bank_transfer'); }}
                             disabled={isPaying}
                             className="text-xs bg-brand-primary text-white hover:opacity-90 px-3 py-1.5 rounded-lg font-medium transition-opacity disabled:opacity-50"
                           >
                             Pay Now
                           </button>
                         )}
                         {comm.status === 'paid' && (
                           <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                             Paid Out
                           </span>
                         )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout modal */}
      {payingCommId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Record Payout</h3>
              <button onClick={() => setPayingCommId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                  <option value="wise">Wise</option>
                  <option value="crypto">Crypto</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Reference / Notes *</label>
                <input
                  type="text"
                  value={payReference}
                  onChange={e => setPayReference(e.target.value)}
                  placeholder="Transaction ID, notes, etc."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              {payError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="material-icons-outlined text-[14px]">error_outline</span>
                  {payError}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePayInternalComm}
                disabled={isPaying}
                className="flex-1 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                {isPaying ? 'Processing...' : 'Confirm Payout'}
              </button>
              <button
                onClick={() => setPayingCommId(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
