'use client';

import React, { useState } from 'react';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/actions/announcements';

const CATEGORIES = [
  'Company Updates',
  'Campaign Focus',
  'Commission Policy Changes',
  'New Service Launch',
  'Performance Recognition',
  'System Updates',
  'Urgent Alerts'
];

const PRIORITIES = ['Normal', 'Important', 'Critical'];
const ROLES = ['all', 'admin', 'employee', 'intern'];

export default function AdminAnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'Company Updates',
    priorityLevel: 'Normal',
    targetRoles: ['all'] as string[],
    isPinned: false,
    isActive: true,
    link: '',
    expiresAt: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      category: 'Company Updates',
      priorityLevel: 'Normal',
      targetRoles: ['all'],
      isPinned: false,
      isActive: true,
      link: '',
      expiresAt: ''
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (announcement: any) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      category: announcement.category || 'Company Updates',
      priorityLevel: announcement.priorityLevel || 'Normal',
      targetRoles: announcement.targetRoles || ['all'],
      isPinned: announcement.isPinned || false,
      isActive: announcement.isActive !== false,
      link: announcement.link || '',
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingId(announcement._id);
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => {
      if (role === 'all') {
        return { ...prev, targetRoles: prev.targetRoles.includes('all') ? [] : ['all'] };
      } else {
        const newRoles = prev.targetRoles.filter(r => r !== 'all');
        if (newRoles.includes(role)) {
          return { ...prev, targetRoles: newRoles.filter(r => r !== role) };
        } else {
          return { ...prev, targetRoles: [...newRoles, role] };
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData: any = {
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : ['all']
    };

    let result;
    if (editingId) {
      result = await updateAnnouncement(editingId, submitData);
    } else {
      result = await createAnnouncement(submitData);
    }

    if (result.success) {
      setIsModalOpen(false);
      resetForm();
      // Optionally we can re-fetch locally, but server action revalidates path
      window.location.reload(); 
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit, or archive internal communications.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-brand-primary/90 flex items-center gap-2"
        >
          <span className="material-icons-outlined">add</span>
          New Announcement
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {announcements.map(announcement => (
                <tr key={announcement._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white mb-1">{announcement.title}</span>
                      <div className="flex gap-2">
                        {announcement.isPinned && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Pinned</span>}
                        {announcement.isActive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">Archived</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{announcement.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      announcement.priorityLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                      announcement.priorityLevel === 'Important' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {announcement.priorityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {announcement.targetRoles?.includes('all') ? 'All Users' : announcement.targetRoles?.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(announcement)} className="text-brand-primary hover:text-brand-primary/80 mr-3">Edit</button>
                    <button onClick={() => handleDelete(announcement._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No announcements found. Create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                  placeholder="e.g., Office Holiday Schedule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea 
                  required rows={4}
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow resize-none"
                  placeholder="Details of the announcement..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority Level</label>
                  <select 
                    value={formData.priorityLevel} onChange={e => setFormData({...formData, priorityLevel: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Roles</label>
                <div className="flex flex-wrap gap-3">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.targetRoles.includes(role)}
                        onChange={() => handleRoleChange(role)}
                        className="rounded text-brand-primary focus:ring-brand-primary cursor-pointer border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link (Optional)</label>
                <input 
                  type="url"
                  value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date (Optional)</label>
                <input 
                  type="datetime-local"
                  value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input 
                    type="checkbox" 
                    checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})}
                    className="rounded text-brand-primary focus:ring-brand-primary cursor-pointer border-gray-300"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Pin to Dashboard</span>
                    <span className="text-[10px] text-gray-500">Stays at the top of the list</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded text-brand-primary focus:ring-brand-primary cursor-pointer border-gray-300"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
                    <span className="text-[10px] text-gray-500">Visible to targeted users</span>
                  </div>
                </label>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {editingId ? 'Save Changes' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
