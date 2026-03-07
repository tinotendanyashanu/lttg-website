'use client';

import { useActionState } from 'react';
import { updateClientCompany } from '@/lib/actions/client';

export default function CompanySettingsClient({ initialData }: { initialData: any }) {
  const [state, action, pending] = useActionState(updateClientCompany, null);

  const fields = [
    { name: 'companyName', label: 'Company Name', type: 'text' },
    { name: 'companyAddress', label: 'Address', type: 'text' },
    { name: 'phone', label: 'Business Phone', type: 'tel' },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'companySize', label: 'Company Size', type: 'text' },
  ];

  return (
    <form action={action} className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">Company Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.name === 'companyAddress' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {f.label}
            </label>
            <input
              name={f.name}
              type={f.type}
              defaultValue={initialData[f.name] || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={initialData.notes || ''}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none"
        />
      </div>

      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
          <span className="material-icons-outlined text-[16px]">check_circle</span>
          Company info saved
        </p>
      )}
      {state?.error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5">
          <span className="material-icons-outlined text-[16px]">error_outline</span>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
      >
        {pending ? (
          <><span className="material-icons-outlined text-[16px] animate-spin">refresh</span>Saving...</>
        ) : 'Save Changes'}
      </button>
    </form>
  );
}
