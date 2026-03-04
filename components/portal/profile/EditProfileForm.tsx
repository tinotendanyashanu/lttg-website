'use client';

import { useState } from 'react';
import { updateProfileDetails } from '@/lib/actions/profile';

export default function EditProfileForm({ account }: { account: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const res = await updateProfileDetails(formData);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('An error occurred while updating the profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            defaultValue={account.fullName || ''}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job Title
          </label>
          <input
            type="text"
            name="jobTitle"
            id="jobTitle"
            defaultValue={account.jobTitle || ''}
            placeholder="e.g., Software Engineer"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <input
            type="text"
            name="department"
            id="department"
            defaultValue={account.department || ''}
            placeholder="e.g., Engineering"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            defaultValue={account.location || ''}
            placeholder="e.g., New York, NY"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            defaultValue={account.phoneNumber || ''}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            About Me / Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            rows={4}
            defaultValue={account.bio || ''}
            placeholder="A brief background about your professional role and expertise..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#18181b] px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isSubmitting && <span className="material-icons-outlined animate-spin text-sm">autorenew</span>}
          {isSubmitting ? 'Saving...' : 'Save Profile Information'}
        </button>
      </div>
    </form>
  );
}
