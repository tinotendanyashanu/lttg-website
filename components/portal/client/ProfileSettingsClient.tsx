'use client';

import { useActionState } from 'react';
import { updateClientProfile, updateClientPassword } from '@/lib/actions/client';

export default function ProfileSettingsClient({
  initialName,
  initialEmail,
  initialPhone,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateClientProfile, null);
  const [pwState, pwAction, pwPending] = useActionState(updateClientPassword, null);

  return (
    <div className="space-y-6">
      {/* Profile */}
      <form action={profileAction} className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Full Name
            </label>
            <input
              name="name"
              defaultValue={initialName}
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Email
            </label>
            <input
              name="email"
              defaultValue={initialEmail}
              type="email"
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Phone
            </label>
            <input
              name="phone"
              defaultValue={initialPhone}
              type="tel"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            />
          </div>
        </div>

        {profileState?.success && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">check_circle</span>
            Profile updated successfully
          </p>
        )}
        {profileState?.error && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">error_outline</span>
            {profileState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={profilePending}
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {profilePending ? (
            <><span className="material-icons-outlined text-[16px] animate-spin">refresh</span>Saving...</>
          ) : 'Save Changes'}
        </button>
      </form>

      {/* Password */}
      <form action={pwAction} className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>

        <div className="space-y-4">
          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
            { name: 'confirmPassword', label: 'Confirm New Password' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {f.label}
              </label>
              <input
                name={f.name}
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
              />
            </div>
          ))}
        </div>

        {pwState?.success && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">check_circle</span>
            Password updated successfully
          </p>
        )}
        {pwState?.error && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <span className="material-icons-outlined text-[16px]">error_outline</span>
            {pwState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pwPending}
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {pwPending ? (
            <><span className="material-icons-outlined text-[16px] animate-spin">refresh</span>Updating...</>
          ) : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
