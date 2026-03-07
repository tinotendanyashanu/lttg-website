'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminTeam, updateAdminTeam } from '@/lib/actions/portal-admin-teams';

export default function TeamManagerClient({ initialTeams }: { initialTeams: any[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (t.name || '').toLowerCase().includes(query) ||
          (t.description || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [teams, searchQuery]);

  const handleSaveTeam = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     
     const data = {
       name: formData.get('name') as string,
       description: formData.get('description') as string,
       isActive: formData.get('isActive') === 'true',
     };
     
     try {
       if (isCreating) {
          const res = await createAdminTeam(data);
          const newTeam = { ...data, _id: res.teamId, createdAt: new Date().toISOString() };
          setTeams([...teams, newTeam]);
          setIsCreating(false);
          setSelectedTeam(newTeam);
       } else if (selectedTeam) {
          await updateAdminTeam(selectedTeam._id, data);
          setTeams(teams.map(t => t._id === selectedTeam._id ? { ...t, ...data } : t));
          setSelectedTeam({ ...selectedTeam, ...data });
       }
       router.refresh();
     } catch (err) {
       console.error("Failed to save team", err);
     } finally {
       setIsUpdating(false);
     }
  };

  const formTeam = isCreating ? {} : selectedTeam;

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
         <div className="relative flex-1 max-w-md">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
         </div>
         <button 
            onClick={() => { setIsCreating(true); setSelectedTeam(null); }}
            className="ml-auto bg-brand-primary text-white hover:opacity-90 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity"
          >
             <span className="material-icons-outlined text-[18px]">add</span>
             New Team
          </button>
       </div>

       {/* Teams List */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
             {filteredTeams.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">groups</span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No matching teams found.</p>
                </div>
             ) : (
                filteredTeams.map(t => (
                   <div 
                     key={t._id} 
                     onClick={() => { setSelectedTeam(t); setIsCreating(false); }}
                     className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedTeam?._id === t._id && !isCreating ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                   >
                      <div className="flex justify-between items-center mb-1">
                         <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                         <div className={`w-2 h-2 rounded-full ${t.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t.description || 'No description'}</p>
                   </div>
                ))
             )}
          </div>

          {/* Details / Editor Pane */}
          <div className="xl:col-span-2">
             {(selectedTeam || isCreating) ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                   <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      {isCreating ? 'Create New Team' : 'Team Settings'}
                   </h3>
                   
                   <form onSubmit={handleSaveTeam} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Team Name</p>
                          <input
                            required
                            type="text"
                            name="name"
                            defaultValue={formTeam?.name || ''}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                          <select
                            name="isActive"
                            defaultValue={formTeam?.isActive ? 'true' : 'false'}
                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                          >
                             <option value="true">Active</option>
                             <option value="false">Inactive</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</p>
                        <textarea
                          name="description"
                          defaultValue={formTeam?.description || ''}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button disabled={isUpdating} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                            {isUpdating ? 'Saving...' : 'Save Team'}
                        </button>
                      </div>
                   </form>
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[400px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">groups</span>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Select a team to edit or create a new one.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
