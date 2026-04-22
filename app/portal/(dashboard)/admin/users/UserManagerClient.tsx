'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminUser, createAdminUser, resetAdminUserPassword } from '@/lib/actions/portal-admin-users';

type UserPerformance = {
  status: string;
  isTopPerformer?: boolean;
  monthlyClosedDeals?: number;
  monthlyQualifiedLeads?: number;
  followUpRate?: number;
  crmUpdateCompliance?: number;
};

type PortalUser = {
  _id: string;
  fullName?: string;
  email: string;
  roles: string[];
  isActive: boolean;
  commissionRate?: number;
  teamId?: string | null;
  jobTitle?: string;
  department?: string;
  phoneNumber?: string;
  location?: string;
  passwordSetupRequired?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  performance?: UserPerformance | null;
};

type Team = {
  _id: string;
  name: string;
};

export default function UserManagerClient({ initialUsers, initialTeams = [] }: { initialUsers: PortalUser[], initialTeams?: Team[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [teams] = useState(initialTeams);
  
  // Filters
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [onboardingFilter, setOnboardingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recentlyCreated');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const AVAILABLE_ROLES = ['admin', 'employee', 'intern', 'partner', 'client'];
  const departments = useMemo(
    () =>
      Array.from(new Set(users.map((user) => (user.department || '').trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [users]
  );

  const hrUsers = useMemo(
    () => users.filter((u) => u.roles.some((r) => ['employee', 'intern', 'admin'].includes(r))),
    [users]
  );

  const workforceStats = useMemo(() => {
    const active = hrUsers.filter((u) => u.isActive).length;
    const onboardingPending = hrUsers.filter((u) => u.passwordSetupRequired).length;
    const watchlist = hrUsers.filter((u) => {
      const status = u.performance?.status || '';
      return status === 'Watchlist' || status === 'At Risk' || status === 'Critical';
    }).length;

    return {
      total: hrUsers.length,
      active,
      inactive: hrUsers.length - active,
      onboardingPending,
      watchlist,
    };
  }, [hrUsers]);

  const filteredUsers = useMemo(() => {
    const result = users.filter(u => {
      if (filterRole !== 'all' && !u.roles.includes(filterRole)) return false;
      if (filterStatus !== 'all') {
        const shouldBeActive = filterStatus === 'active';
        if (u.isActive !== shouldBeActive) return false;
      }
      if (filterDepartment !== 'all' && (u.department || 'Unassigned') !== filterDepartment) return false;
      if (onboardingFilter === 'pending' && !u.passwordSetupRequired) return false;
      if (onboardingFilter === 'completed' && u.passwordSetupRequired) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (u.fullName || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query) ||
          (u.jobTitle || '').toLowerCase().includes(query) ||
          (u.department || '').toLowerCase().includes(query)
        );
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
      if (sortBy === 'lastLogin') return new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime();
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [users, filterRole, filterStatus, filterDepartment, onboardingFilter, searchQuery, sortBy]);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setInviteLink(null);
    const formData = new FormData(e.currentTarget);
    const roles = Array.from(formData.getAll('roles')) as string[];
    
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      roles,
    };
    
    try {
      const res = await createAdminUser(data);
      if (res.inviteLink) {
        setInviteLink(res.inviteLink);
      }
      setIsCreatingUser(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to create user", err);
      alert("Failed to create user. Check if email is already in use.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Are you sure you want to initiate a password reset? This will invalidate the current password and generate a new onboarding link.")) return;
    setIsUpdating(true);
    try {
      const res = await resetAdminUserPassword(userId);
      if (res.resetLink) {
        setInviteLink(res.resetLink);
      }
    } catch (err) {
      console.error("Reset password failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!selectedUser) return;
     setIsUpdating(true);
     setInviteLink(null);
     const formData = new FormData(e.currentTarget);
     
     // Collect all checked roles
     const roles = Array.from(formData.getAll('roles')) as string[];
     
     const data = {
       roles,
       teamId: formData.get('teamId') as string || null,
       commissionRate: parseFloat(formData.get('commissionRate') as string) || 0,
       isActive: formData.get('isActive') === 'true',
       jobTitle: formData.get('jobTitle') as string,
       department: formData.get('department') as string,
       phoneNumber: formData.get('phoneNumber') as string,
       location: formData.get('location') as string,
     };
     
     try {
       await updateAdminUser(selectedUser._id, data);
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...data } : u));
      setSelectedUser({ ...selectedUser, ...data });
       router.refresh();
     } catch (err) {
       console.error("Failed to update user", err);
       alert("Failed to update user. Please check your inputs.");
     } finally {
       setIsUpdating(false);
     }
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
         <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
           <p className="text-xs uppercase tracking-wide text-gray-500">Total Workforce</p>
           <p className="text-2xl font-bold text-gray-900 dark:text-white">{workforceStats.total}</p>
         </div>
         <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
           <p className="text-xs uppercase tracking-wide text-gray-500">Active</p>
           <p className="text-2xl font-bold text-emerald-600">{workforceStats.active}</p>
         </div>
         <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
           <p className="text-xs uppercase tracking-wide text-gray-500">Inactive</p>
           <p className="text-2xl font-bold text-rose-600">{workforceStats.inactive}</p>
         </div>
         <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
           <p className="text-xs uppercase tracking-wide text-gray-500">Onboarding Pending</p>
           <p className="text-2xl font-bold text-amber-600">{workforceStats.onboardingPending}</p>
         </div>
         <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
           <p className="text-xs uppercase tracking-wide text-gray-500">Performance Watchlist</p>
           <p className="text-2xl font-bold text-orange-600">{workforceStats.watchlist}</p>
         </div>
       </div>

       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-3 items-center">
         <div className="relative flex-1 max-w-md">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search by name, email, title, department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
         </div>
         <select 
            value={filterRole} 
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ml-auto"
          >
             <option value="all">All Roles</option>
             <option value="admin">Admin</option>
             <option value="employee">Employee</option>
             <option value="intern">Intern</option>
             <option value="partner">Partner</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <select
            value={onboardingFilter}
            onChange={e => setOnboardingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">All Onboarding</option>
            <option value="pending">Pending Setup</option>
            <option value="completed">Setup Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="recentlyCreated">Newest First</option>
            <option value="lastLogin">Last Login</option>
            <option value="name">Name (A-Z)</option>
          </select>
          <button 
            onClick={() => { setIsCreatingUser(true); setSelectedUser(null); }}
            className="flex items-center gap-1 bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-icons-outlined text-[18px]">person_add</span>
            Create User
          </button>
       </div>

       {/* Users List */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
             {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">group_off</span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No matching users found.</p>
                </div>
             ) : (
                filteredUsers.map(u => (
                   <div 
                     key={u._id} 
                     onClick={() => setSelectedUser(u)}
                     className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedUser?._id === u._id ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                                 {(u.fullName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                               </div>
                               <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#27272a] ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{u.fullName || 'Unnamed User'}</h3>
                                {u.performance && (
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                    u.performance.status === 'On Track' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                    u.performance.status === 'Watchlist' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' :
                                    u.performance.status === 'At Risk' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400' :
                                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {u.performance.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {[u.jobTitle, u.department].filter(Boolean).join(' • ') || 'No title or department'}
                              </p>
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-4 text-gray-600 dark:text-gray-300">
                         <div className="flex gap-2">
                           {u.roles.map((r: string) => (
                              <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                 r === 'admin' ? 'bg-purple-100 text-purple-700' :
                                 r === 'employee' ? 'bg-blue-100 text-blue-700' :
                                 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                 {r}
                              </span>
                           ))}
                         </div>
                         {u.commissionRate !== undefined && (
                            <div className="text-xs font-medium text-gray-500">
                              Commission Rate: {u.commissionRate}%
                            </div>
                         )}
                      </div>
                      {u.passwordSetupRequired && (
                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          <span className="material-icons-outlined text-[12px]">pending</span>
                          Onboarding Pending
                        </div>
                      )}
                   </div>
                ))
             )}
          </div>

          {/* Details / Editor Sidebar */}
          <div className="xl:col-span-1">
             {isCreatingUser ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl">Create User</h3>
                      <button onClick={() => setIsCreatingUser(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                         <span className="material-icons-outlined">close</span>
                      </button>
                   </div>
                   <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                        <input name="fullName" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Email</p>
                        <input type="email" name="email" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Assign Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_ROLES.filter(r => r !== 'client').map(role => (
                            <label key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all has-[:checked]:bg-blue-600 has-[:checked]:border-blue-600 has-[:checked]:text-white">
                               <input 
                                 type="checkbox" 
                                 name="roles" 
                                 value={role} 
                                 defaultChecked={role === 'employee'}
                                 className="hidden" 
                               />
                               <span className="text-[10px] font-bold uppercase">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <button disabled={isUpdating} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-colors mt-4">
                         {isUpdating ? 'Creating Invitation...' : 'Send Invitation'}
                      </button>
                   </form>
                </div>
             ) : selectedUser ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                   <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">User Settings</h3>
                   
                   {selectedUser.performance && (
                     <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                           <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Monthly Performance</p>
                           {selectedUser.performance.isTopPerformer && (
                             <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                               <span className="material-icons-outlined text-[12px]">military_tech</span>
                               TOP
                             </span>
                           )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[10px] text-gray-500 uppercase">Deals</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                 {selectedUser.performance.monthlyClosedDeals} / 2
                                 {selectedUser.performance.monthlyClosedDeals >= 2 && <span className="material-icons text-emerald-500 text-[14px] ml-1">check_circle</span>}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-gray-500 uppercase">Leads</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                 {selectedUser.performance.monthlyQualifiedLeads} / 5
                                 {selectedUser.performance.monthlyQualifiedLeads >= 5 && <span className="material-icons text-emerald-500 text-[14px] ml-1">check_circle</span>}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-gray-500 uppercase">Follow-up</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.performance.followUpRate}%</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-gray-500 uppercase">Compliance</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.performance.crmUpdateCompliance}%</p>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="space-y-4">
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Job Title</p>
                            <input name="jobTitle" defaultValue={selectedUser.jobTitle || ''} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Department</p>
                            <input name="department" defaultValue={selectedUser.department || ''} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Phone Number</p>
                            <input name="phoneNumber" defaultValue={selectedUser.phoneNumber || ''} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Location</p>
                            <input name="location" defaultValue={selectedUser.location || ''} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Team Assignment</p>
                          <select 
                            name="teamId" 
                            defaultValue={selectedUser.teamId || ''} 
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          >
                            <option value="">No Team Assigned</option>
                            {teams.map((team) => (
                              <option key={team._id} value={team._id}>{team.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">System Roles</p>
                          <div className="flex flex-wrap gap-2">
                             {AVAILABLE_ROLES.map(role => {
                               const isActive = selectedUser.roles.includes(role);
                               return (
                                 <label key={role} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                   <input 
                                     type="checkbox" 
                                     name="roles" 
                                     value={role} 
                                     defaultChecked={isActive}
                                     className="hidden" 
                                     onChange={(e) => {
                                       const newRoles = e.target.checked 
                                         ? [...selectedUser.roles, role]
                                         : selectedUser.roles.filter((r: string) => r !== role);
                                       setSelectedUser({ ...selectedUser, roles: newRoles });
                                     }}
                                   />
                                   <span className="text-[10px] font-bold uppercase">{role}</span>
                                 </label>
                               );
                             })}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Commission Rate (%)</p>
                          <input
                            type="number"
                            name="commissionRate"
                            step="0.01"
                            defaultValue={selectedUser.commissionRate || 0}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                          <select
                            name="isActive"
                            defaultValue={selectedUser.isActive ? 'true' : 'false'}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          >
                             <option value="true">Active</option>
                             <option value="false">Deactivated</option>
                          </select>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                          <button disabled={isUpdating} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-colors">
                              {isUpdating ? 'Saving...' : 'Save Settings'}
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => handleResetPassword(selectedUser._id)}
                            className="w-full bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-icons-outlined text-[16px]">lock_reset</span>
                            Reset Password
                          </button>
                        </div>
                      </form>
                   </div>
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[400px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">account_circle</span>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Select a user to edit settings</p>
                </div>
             )}
          </div>
       </div>

       {/* Invitation / Reset Link Modal */}
       {inviteLink && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#18181b] w-full max-w-lg rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons-outlined text-3xl">mark_email_read</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Invitation Link Ready</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Share this secure onboarding link with the employee. It will expire in 48 hours.</p>
             </div>

             <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6 break-all">
                <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{inviteLink}</p>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => copyToClipboard(inviteLink)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <span className="material-icons-outlined">content_copy</span>
                  Copy to Clipboard
                </button>
                <button 
                  onClick={() => setInviteLink(null)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Close
                </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
