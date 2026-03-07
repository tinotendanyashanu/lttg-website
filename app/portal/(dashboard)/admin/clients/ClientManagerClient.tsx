'use client';

import React, { useState, useMemo } from 'react';
import { updateAdminClient, archiveAdminClient, createAdminClient } from '@/lib/actions/portal-admin-clients';
import { useRouter } from 'next/navigation';

export default function ClientManagerClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Active status in this system maps to whether the lead status is not "closed/rejected"
  const filteredClients = useMemo(() => {
    return clients.filter((c: any) => {
      if (c.status === 'closed' || c.status === 'rejected') return false; // Archived
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (c.businessName || '').toLowerCase().includes(query) ||
          (c.contactName || '').toLowerCase().includes(query) ||
          (c.clientEmail || c.accountId?.email || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [clients, searchQuery]);

  const handleUpdateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!selectedClient) return;
     setIsUpdating(true);
     const formData = new FormData(e.currentTarget);
     
     const data = {
       businessName: formData.get('businessName'),
       contactName: formData.get('contactName'),
       clientEmail: formData.get('clientEmail'),
       phone: formData.get('phone'),
       serviceInterest: formData.get('serviceInterest'),
       source: formData.get('source'),
       notes: formData.get('notes'),
     };
     
     try {
       await updateAdminClient(selectedClient._id, data);
       setClients(clients.map((c: any) => c._id === selectedClient._id ? { ...c, ...data } : c));
       setSelectedClient({ ...selectedClient, ...data });
       router.refresh();
     } catch (err) {
       console.error("Failed to update client", err);
     } finally {
       setIsUpdating(false);
     }
  };

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      businessName: formData.get('businessName'),
      contactName: formData.get('contactName'),
      clientEmail: formData.get('clientEmail'),
      phone: formData.get('phone'),
      serviceInterest: formData.get('serviceInterest'),
      source: formData.get('source'),
      status: 'new',
    };

    try {
      const res = await createAdminClient(data);
      if (res.success) {
        setClients([res.client, ...clients]);
        setIsCreating(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create client", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchiveClient = async (clientId: string) => {
      if (!confirm("Are you sure you want to archive this client? This cannot be undone.")) return;
      try {
        await archiveAdminClient(clientId);
        setClients(clients.map((c: any) => c._id === clientId ? { ...c, status: 'closed' } : c));
        setSelectedClient(null);
        router.refresh();
      } catch (err) {
        console.error("Failed to archive client", err);
      }
  };

  return (
    <div className="space-y-6">
       {/* Filters & Actions */}
       <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
             <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
             <input 
               type="text"
               placeholder="Search clients..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
             />
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-icons-outlined text-[18px]">add</span>
            Create Client
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-auto hidden md:block">
            {filteredClients.length} Active Clients
          </span>
       </div>

       {/* Main Content */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
             {filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">domain_disabled</span>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">No matching clients found.</p>
                </div>
             ) : (
                filteredClients.map((c: any) => (
                   <div 
                     key={c._id} 
                     onClick={() => { setSelectedClient(c); setIsCreating(false); }}
                     className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedClient?._id === c._id ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10' : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                               {(c.businessName?.[0] || c.contactName?.[0] || 'C').toUpperCase()}
                            </div>
                            <div>
                               <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{c.businessName || c.contactName || 'Unnamed Client'}</h3>
                               <p className="text-sm text-gray-500 dark:text-gray-400">{c.contactName} • {c.clientEmail || c.accountId?.email}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mt-4 text-gray-600 dark:text-gray-300">
                         <div className="flex items-center gap-1.5 ">
                           <span className="material-icons-outlined text-[16px]">call</span>
                           {c.phone || c.clientPhone || 'N/A'}
                         </div>
                         <div className="flex items-center gap-1.5 ">
                           <span className="material-icons-outlined text-[16px]">label</span>
                           {c.serviceInterest || 'Consulting'}
                         </div>
                         <div className="text-xs text-gray-400 ml-auto">
                           Added {new Date(c.createdAt).toLocaleDateString()}
                         </div>
                      </div>
                   </div>
                ))
             )}
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-1">
             {isCreating ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in-95 duration-200">
                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                     <h3 className="font-bold text-gray-900 dark:text-white text-xl">New Client</h3>
                     <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="material-icons-outlined">close</span>
                     </button>
                   </div>
                   <form onSubmit={handleCreateClient} className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Business Name</p>
                        <input name="businessName" type="text" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Contact Name</p>
                        <input name="contactName" type="text" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email</p>
                        <input name="clientEmail" type="email" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
                        <input name="phone" type="text" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Service Interest</p>
                        <input name="serviceInterest" type="text" placeholder="e.g. Legal Consulting" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                      </div>
                      <button disabled={isUpdating} type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/20">
                         {isUpdating ? 'Creating...' : 'Create Lead'}
                      </button>
                   </form>
                </div>
             ) : selectedClient ? (
                <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                     <h3 className="font-bold text-gray-900 dark:text-white text-xl">Client Editor</h3>
                   </div>
                   
                   <div className="space-y-4">
                      <form onSubmit={handleUpdateInfo} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                           <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Business Name</p>
                              <input type="text" name="businessName" defaultValue={selectedClient.businessName} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Contact Name</p>
                              <input type="text" name="contactName" defaultValue={selectedClient.contactName} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                           </div>
                        </div>

                        <div>
                           <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Client Email</p>
                           <input type="email" name="clientEmail" defaultValue={selectedClient.clientEmail || selectedClient.accountId?.email} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                        </div>

                        <div>
                           <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
                           <input type="text" name="phone" defaultValue={selectedClient.phone || selectedClient.clientPhone} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Service</p>
                              <input type="text" name="serviceInterest" defaultValue={selectedClient.serviceInterest} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Source</p>
                              <input type="text" name="source" defaultValue={selectedClient.source} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none" />
                           </div>
                        </div>

                        <div>
                           <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Notes</p>
                           <textarea name="notes" defaultValue={selectedClient.notes} rows={3} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none resize-none" />
                        </div>
                        
                        <button disabled={isUpdating} type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
                            {isUpdating ? 'Saving...' : 'Update Lead Info'}
                        </button>
                      </form>

                      <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                         <button
                           onClick={() => handleArchiveClient(selectedClient._id)}
                           className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-4 py-3 rounded-xl font-medium transition-all"
                         >
                           <span className="material-icons-outlined text-xl">archive</span>
                           Archive & Close
                         </button>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center h-[400px]">
                   <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">group_add</span>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Select a client or create a new one</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
