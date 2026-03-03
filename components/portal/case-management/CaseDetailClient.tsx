'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateAdminLeadStatus, AllowedAdminLeadStatus } from '@/lib/actions/admin-leads';

interface CaseDetailClientProps {
  lead: any;
  isAdminOrEmployee: boolean;
}

export default function CaseDetailClient({ lead, isAdminOrEmployee }: CaseDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(lead.status);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleStatusChange = async (newStatus: AllowedAdminLeadStatus) => {
    setStatus(newStatus);
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    const res = await updateAdminLeadStatus(lead._id.toString(), newStatus);
    
    if (res.success) {
      setSuccessMessage(res.message);
      // Let standard Next.js revalidate the path
    } else {
      setError(res.message);
      setStatus(lead.status as AllowedAdminLeadStatus); // Revert on failure
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto overflow-hidden">
      <header className="flex items-center gap-4">
        <Link 
          href="/portal/case-management"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <span className="material-icons-outlined block">arrow_back</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Case Details</h2>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800">
          {successMessage}
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl shadow-soft">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lead.businessName || 'Unnamed Business'}</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="material-icons-outlined text-sm">person</span>
              {lead.contactName || 'No Contact Info'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
              <span className="material-icons-outlined text-sm">email</span>
              {lead.contactEmail || 'No Email'}
            </p>
            {lead.phone && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <span className="material-icons-outlined text-sm">phone</span>
                {lead.phone}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Status</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
              ${status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
              ${status === 'contacted' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
              ${status === 'qualified' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}
              ${status === 'closed' || status === 'converted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
              ${status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
            `}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Deal Information</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Service Interest</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{(lead.serviceInterest || 'N/A').replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estimated Deal Value</span>
                <span className="font-medium text-gray-900 dark:text-white">{lead.dealValue ? `$${lead.dealValue.toLocaleString()}` : 'TBD'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Budget</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{(lead.budget || 'N/A').replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Case Metadata</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Created At</span>
                <span className="font-medium text-gray-900 dark:text-white">{new Date(lead.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Lead ID</span>
                <span className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 p-1 rounded">{lead._id}</span>
              </div>
            </div>
          </div>
        </div>

        {lead.notes && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {isAdminOrEmployee && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Manage Status</h3>
            <div className="flex flex-wrap gap-3">
              {(['new', 'contacted', 'closed', 'rejected'] as AllowedAdminLeadStatus[]).map((s) => (
                <button
                  key={s}
                  disabled={isSubmitting || status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    status === s
                      ? 'bg-[#2F2F2F] text-white shadow-md dark:bg-white dark:text-gray-900 opacity-50 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {status === 'closed' && (
              <p className="mt-4 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">info</span>
                Marking as Closed automatically issues the associated commission.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
