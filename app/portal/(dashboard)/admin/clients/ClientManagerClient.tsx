'use client';

import { useState, useMemo } from 'react';
import {
  updateAdminClient,
  archiveAdminClient,
  createAdminClient,
  resetClientPortalPassword,
  resendClientPortalInvite,
  createPortalAccountForClient,
  toggleClientPortalStatus,
} from '@/lib/actions/portal-admin-clients';
import { useRouter } from 'next/navigation';

type StatusFilter = 'active' | 'archived' | 'all';

const CLIENT_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'rejected', 'closed'] as const;

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success'
        ? 'bg-green-600 text-white'
        : 'bg-red-600 text-white'
    }`}>
      <span className="material-icons-outlined text-[18px]">
        {type === 'success' ? 'check_circle' : 'error_outline'}
      </span>
      {message}
    </div>
  );
}

export default function ClientManagerClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [portalActionLoading, setPortalActionLoading] = useState<string | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const isArchived = (c: any) => c.status === 'closed' || c.status === 'rejected';

  const filteredClients = useMemo(() => {
    return clients.filter((c: any) => {
      if (statusFilter === 'active' && isArchived(c)) return false;
      if (statusFilter === 'archived' && !isArchived(c)) return false;

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
  }, [clients, searchQuery, statusFilter]);

  const activeCount = useMemo(() => clients.filter(c => !isArchived(c)).length, [clients]);
  const archivedCount = useMemo(() => clients.filter(c => isArchived(c)).length, [clients]);

  const handleUpdateInfo = async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      businessName: formData.get('businessName'),
      contactName: formData.get('contactName'),
      clientEmail: formData.get('clientEmail'),
      phone: formData.get('phone'),
      serviceInterest: formData.get('serviceInterest'),
      source: formData.get('source'),
      status: formData.get('status'),
      notes: formData.get('notes'),
    };

    try {
      await updateAdminClient(selectedClient._id, data);
      const updated = { ...selectedClient, ...data };
      setClients(clients.map((c: any) => c._id === selectedClient._id ? updated : c));
      setSelectedClient(updated);
      showToast('Client updated successfully.', 'success');
      router.refresh();
    } catch {
      showToast('Failed to update client. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateClient = async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setIsCreatingNew(true);
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
        setStatusFilter('active');
        showToast('Client created and portal account sent.', 'success');
        router.refresh();
      }
    } catch {
      showToast('Failed to create client. Please try again.', 'error');
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handlePortalAction = async (action: string) => {
    if (!selectedClient) return;
    setPortalActionLoading(action);
    try {
      if (action === 'reset_password') {
        await resetClientPortalPassword(selectedClient._id);
        showToast('Password reset link sent to client.', 'success');
      } else if (action === 'resend_invite') {
        await resendClientPortalInvite(selectedClient._id);
        showToast('Portal invite resent successfully.', 'success');
      } else if (action === 'create_account') {
        const res = await createPortalAccountForClient(selectedClient._id);
        setClients(clients.map((c: any) =>
          c._id === selectedClient._id ? { ...c, accountId: { _id: res.accountId, email: selectedClient.clientEmail } } : c
        ));
        setSelectedClient({ ...selectedClient, accountId: { _id: res.accountId, email: selectedClient.clientEmail } });
        showToast('Portal account created. Welcome email sent.', 'success');
        router.refresh();
      } else if (action === 'toggle_status') {
        const res = await toggleClientPortalStatus(selectedClient._id);
        const updatedAccount = { ...selectedClient.accountId, isActive: res.isActive };
        setClients(clients.map((c: any) =>
          c._id === selectedClient._id ? { ...c, accountId: updatedAccount } : c
        ));
        setSelectedClient({ ...selectedClient, accountId: updatedAccount });
        showToast(`Portal account ${res.isActive ? 'activated' : 'suspended'}.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed. Please try again.', 'error');
    } finally {
      setPortalActionLoading(null);
    }
  };

  const handleArchiveClient = async () => {
    if (!selectedClient) return;
    try {
      await archiveAdminClient(selectedClient._id);
      setClients(clients.map((c: any) => c._id === selectedClient._id ? { ...c, status: 'closed' } : c));
      setSelectedClient(null);
      setArchiveConfirm(false);
      showToast('Client archived successfully.', 'success');
      router.refresh();
    } catch {
      showToast('Failed to archive client. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {([
            ['active', 'Active', activeCount],
            ['archived', 'Archived', archivedCount],
            ['all', 'All', clients.length],
          ] as [StatusFilter, string, number][]).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === value
                  ? 'bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === value
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { setIsCreating(true); setSelectedClient(null); setArchiveConfirm(false); }}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-[18px]">add</span>
          Create Client
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="xl:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800">
              <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">domain_disabled</span>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No clients found.</p>
            </div>
          ) : (
            filteredClients.map((c: any) => (
              <div
                key={c._id}
                onClick={() => { setSelectedClient(c); setIsCreating(false); setArchiveConfirm(false); }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedClient?._id === c._id
                    ? 'bg-brand-primary/5 border-brand-primary dark:bg-brand-primary/10'
                    : 'bg-white dark:bg-[#27272a] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {(c.businessName?.[0] || c.contactName?.[0] || 'C').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.businessName || c.contactName || 'Unnamed Client'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.contactName} · {c.clientEmail || c.accountId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {c.accountId && (
                      <span title="Has portal account" className="material-icons-outlined text-[16px] text-green-500">verified_user</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[c.status] || STATUS_COLORS.new}`}>
                      {c.status || 'new'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm mt-3 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="material-icons-outlined text-[15px]">call</span>
                    {c.phone || c.clientPhone || 'N/A'}
                  </div>
                  {c.serviceInterest && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-icons-outlined text-[15px]">label</span>
                      {c.serviceInterest}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 ml-auto">
                    Added {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          {isCreating ? (
            <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-xl">New Client</h3>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Business Name</label>
                  <input name="businessName" type="text" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Contact Name</label>
                  <input name="contactName" type="text" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Email</label>
                  <input name="clientEmail" type="email" required className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Phone</label>
                  <input name="phone" type="text" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Service Interest</label>
                  <input name="serviceInterest" type="text" placeholder="e.g. Legal Consulting" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Source</label>
                  <select name="source" className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                    <option value="">Select source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Partner">Partner</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Direct">Direct</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  disabled={isCreatingNew}
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/20"
                >
                  {isCreatingNew ? 'Creating...' : 'Create Client'}
                </button>
              </form>
            </div>
          ) : selectedClient ? (
            <div className="bg-white dark:bg-[#27272a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">Edit Client</h3>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {selectedClient._id}</p>
                </div>
                <button
                  onClick={() => { setSelectedClient(null); setArchiveConfirm(false); }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Business Name</label>
                    <input type="text" name="businessName" defaultValue={selectedClient.businessName} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Contact Name</label>
                    <input type="text" name="contactName" defaultValue={selectedClient.contactName} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Email</label>
                  <input type="email" name="clientEmail" defaultValue={selectedClient.clientEmail || selectedClient.accountId?.email} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Phone</label>
                  <input type="text" name="phone" defaultValue={selectedClient.phone || selectedClient.clientPhone} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Service</label>
                    <input type="text" name="serviceInterest" defaultValue={selectedClient.serviceInterest} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Source</label>
                    <select name="source" defaultValue={selectedClient.source || ''} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                      <option value="">Select source</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Partner">Partner</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Direct">Direct</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Status</label>
                  <select name="status" defaultValue={selectedClient.status || 'new'} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                    {CLIENT_STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Notes</label>
                  <textarea name="notes" defaultValue={selectedClient.notes} rows={3} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none" />
                </div>

                <button
                  disabled={isSaving}
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-3 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              {/* Portal Account Management */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-3">Portal Account</p>

                {selectedClient.accountId ? (
                  <>
                    <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg mb-3">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <span className="material-icons-outlined text-[15px]">verified_user</span>
                        {selectedClient.accountId?.email}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        selectedClient.accountId?.isActive !== false
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {selectedClient.accountId?.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePortalAction('reset_password')}
                      disabled={portalActionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60"
                    >
                      <span className="material-icons-outlined text-[15px]">lock_reset</span>
                      {portalActionLoading === 'reset_password' ? 'Sending...' : 'Reset Portal Password'}
                    </button>
                    <button
                      onClick={() => handlePortalAction('resend_invite')}
                      disabled={portalActionLoading !== null}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60"
                    >
                      <span className="material-icons-outlined text-[15px]">forward_to_inbox</span>
                      {portalActionLoading === 'resend_invite' ? 'Sending...' : 'Resend Portal Invite'}
                    </button>
                    <button
                      onClick={() => handlePortalAction('toggle_status')}
                      disabled={portalActionLoading !== null}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60 border ${
                        selectedClient.accountId?.isActive !== false
                          ? 'bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                          : 'bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                      }`}
                    >
                      <span className="material-icons-outlined text-[15px]">
                        {selectedClient.accountId?.isActive !== false ? 'block' : 'check_circle'}
                      </span>
                      {portalActionLoading === 'toggle_status'
                        ? 'Updating...'
                        : selectedClient.accountId?.isActive !== false
                          ? 'Suspend Portal Access'
                          : 'Activate Portal Access'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handlePortalAction('create_account')}
                    disabled={portalActionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-60 shadow-sm"
                  >
                    <span className="material-icons-outlined text-[15px]">person_add</span>
                    {portalActionLoading === 'create_account' ? 'Creating...' : 'Create Portal Account'}
                  </button>
                )}
              </div>

              <div className="pt-5 mt-2 border-t border-gray-100 dark:border-gray-800">
                {archiveConfirm ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">Archive this client? This will close the account.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleArchiveClient}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Confirm Archive
                      </button>
                      <button
                        onClick={() => setArchiveConfirm(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setArchiveConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-4 py-3 rounded-xl font-medium transition-all"
                  >
                    <span className="material-icons-outlined text-xl">archive</span>
                    Archive & Close
                  </button>
                )}
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
