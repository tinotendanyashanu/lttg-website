'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminUser, createAdminUser, resetAdminUserPassword } from '@/lib/actions/portal-admin-users';

export default function UserManagerClient({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  
  // Filters
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filterRole !== 'all' && !u.roles.includes(filterRole)) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (u.fullName || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [users, filterRole, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setTempPassword(null);
    const formData = new FormData(e.currentTarget);
    
    const roleInput = formData.get('roles') as string;
    const roles = roleInput.split(',').map(r => r.trim()).filter(Boolean);
    
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      roles,
      password: formData.get('password') as string || undefined,
    };
    
    try {
      const res = await createAdminUser(data);
      if (res.tempPassword) setTempPassword(res.tempPassword);
      // For local UI update, we could re-fetch or just alert. 
      // Re-fetching via router refresh is safer.
      alert(`User created successfully! Temp password: ${res.tempPassword}`);
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
    if (!confirm("Are you sure you want to reset this user's password?")) return;
    setIsUpdating(true);
    try {
      const res = await resetAdminUserPassword(userId);
      alert(`Password has been reset. New temp password: ${res.tempPassword}`);
      setTempPassword(res.tempPassword);
    } catch (err) {
      console.error("Reset password failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!selectedUser) return;
     setIsUpdating(true);
     setTempPassword(null);
     const formData = new FormData(e.currentTarget);
     
     const roleInput = formData.get('roles') as string;
     const roles = roleInput.split(',').map(r => r.trim()).filter(Boolean);
     
     const data = {
       roles,
       teamId: formData.get('teamId') as string,
       commissionRate: parseFloat(formData.get('commissionRate') as string) || 0,
       isActive: formData.get('isActive') === 'true',
       jobTitle: formData.get('jobTitle') as string,
       department: formData.get('department') as string,
     };
     
     try {
       await updateAdminUser(selectedUser._id, data);
       setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...data } : u));
       setSelectedUser({ ...selectedUser, ...data });
       router.refresh();
     } catch (err) {
       console.error("Failed to update user", err);
     } finally {
       setIsUpdating(false);
     }
  };

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
         <div className="relative flex-1 max-w-md">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search users..."
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
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{u.fullName || 'Unnamed User'}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Roles (comma sep)</p>
                        <input name="roles" defaultValue="employee" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Password (optional)</p>
                        <input type="password" name="password" placeholder="Autogenerated if empty" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <button disabled={isUpdating} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-colors mt-4">
                         {isUpdating ? 'Creating...' : 'Create Account'}
                      </button>
                   </form>
                </div>
             ) : selectedUser ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                   <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">User Settings</h3>
                   
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
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Roles (comma separated)</p>
                          <input
                            type="text"
                            name="roles"
                            defaultValue={selectedUser.roles.join(', ')}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Team ID</p>
                          <input
                            type="text"
                            name="teamId"
                            defaultValue={selectedUser.teamId || ''}
                            placeholder="Optional team ObjectId"
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
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
    </div>
  );
}
