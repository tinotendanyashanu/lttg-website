'use client';

import { useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupportTicket } from '@/lib/actions/client';
import { TICKET_CATEGORIES } from '@/lib/support/constants';

const CATEGORIES = TICKET_CATEGORIES;

function CreateTicketForm() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || '';
  const [state, action, pending] = useActionState(createSupportTicket, null);

  if (state?.success) {
    return (
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-12 text-center">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-outlined text-green-600 dark:text-green-400 text-3xl">
            check_circle
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Ticket Submitted
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Ticket ID: <span className="font-mono font-bold text-gray-900 dark:text-white">{state.ticketId}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Our team will respond within 24 hours.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/portal/client/tickets"
            className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            View All Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {caseId && <input type="hidden" name="caseId" value={caseId} />}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            name="subject"
            required
            type="text"
            placeholder="Brief description of your issue"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Category
            </label>
            <select
              name="category"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Priority
            </label>
            <select
              name="priority"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            >
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={6}
            placeholder="Describe your issue in detail. Include any relevant information such as error messages, steps to reproduce, or expected behaviour."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none"
          />
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          <span className="material-icons-outlined text-[16px]">error_outline</span>
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
        >
          {pending ? (
            <>
              <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
              Submitting...
            </>
          ) : (
            <>
              <span className="material-icons-outlined text-[16px]">send</span>
              Submit Ticket
            </>
          )}
        </button>
        <Link
          href="/portal/client/tickets"
          className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function CreateTicketPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Suspense fallback={<div className="h-8" />}>
        <CreateTicketForm />
      </Suspense>
    </div>
  );
}
