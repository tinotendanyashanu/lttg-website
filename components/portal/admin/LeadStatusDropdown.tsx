'use client';

import { useTransition } from 'react';
import { updateAdminLeadStatus, type AllowedAdminLeadStatus } from '@/lib/actions/admin-leads';

interface LeadStatusDropdownProps {
  leadId: string;
  currentStatus: string;
}

export default function LeadStatusDropdown({ leadId, currentStatus }: LeadStatusDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AllowedAdminLeadStatus;
    startTransition(async () => {
      const res = await updateAdminLeadStatus(leadId, newStatus);
      if (!res.success) {
        alert(res.message);
      }
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={isPending}
      className={`px-3 py-1.5 rounded-md text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
        currentStatus === 'new'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : currentStatus === 'contacted'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : currentStatus === 'closed'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="closed">Closed</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}
