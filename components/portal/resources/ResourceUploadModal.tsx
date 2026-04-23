'use client';

import { useState } from 'react';
import { uploadResource } from '@/lib/actions/resources';

export default function ResourceUploadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(formData: FormData) {
    setIsUploading(true);
    try {
      const res = await uploadResource(formData);
      if (res.success) {
        alert(res.message);
        setIsOpen(false);
      } else {
        alert(res.message || 'Failed to upload resource');
      }
    } catch (error) {
      alert('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        <span className="material-icons-outlined text-lg">add</span>
        Upload Resource
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        <span className="material-icons-outlined text-lg">add</span>
        Upload Resource
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#27272a]/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Resource</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>
          
          <form action={handleUpload} className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="E.g., Company Handbook 2024"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-brand-primary outline-none"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                placeholder="Brief description of the resource..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-brand-primary outline-none resize-none"
              />
            </div>

            <div>
              <label htmlFor="roleVisibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Visibility
              </label>
              <select
                name="roleVisibility"
                id="roleVisibility"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-brand-primary outline-none"
              >
                <option value="all">Everyone</option>
                <option value="client">Clients Only</option>
                <option value="admin">Admins Only</option>
                <option value="employee">Employees & Admins</option>
                <option value="intern">Interns Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File
              </label>
              <input
                type="file"
                name="file"
                id="file"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#27272a] px-4 py-2 text-sm focus:border-brand-primary focus:ring-brand-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 transition-colors cursor-pointer"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isUploading && <span className="material-icons-outlined animate-spin text-sm">autorenew</span>}
                {isUploading ? 'Uploading...' : 'Upload Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
