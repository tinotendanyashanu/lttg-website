'use client';

import { useState, useTransition, useActionState } from 'react';
import { Lead, LeadStatus } from '@/types';
import { updateLeadStatus, convertLeadToDeal, createManualLead } from '@/lib/actions/leads';
import Link from 'next/link';
import { Search, Plus, ArrowRight, X, UserPlus, Phone, Mail, Calendar, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-slate-100 text-slate-700',
};

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'rejected', 'closed'];

export default function LeadsClient({
  leads,
  query,
  status,
}: {
  leads: Lead[];
  query: string;
  status: string;
}) {
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    startTransition(async () => {
      const result = await updateLeadStatus(leadId, newStatus);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleConvert = async (leadId: string, formData: FormData) => {
    startTransition(async () => {
      const result = await convertLeadToDeal(leadId, formData);
      if (result.success) {
        setConvertingLeadId(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
          <p className="text-slate-500">Track and manage your lead pipeline.</p>
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
            <input type="hidden" name="status" value={status} />
          </form>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0">
          {['all', 'new', 'contacted', 'qualified', 'converted', 'rejected', 'closed'].map((s) => (
            <Link
              key={s}
              href={`?status=${s}&q=${query}`}
              className={`px-4 py-2.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                status === s
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-slate-50">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <div key={lead._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{lead.clientName}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <Mail className="h-3 w-3 mr-1" />
                      {lead.clientEmail}
                    </p>
                    {lead.clientPhone && (
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Phone className="h-3 w-3 mr-1" />
                        {lead.clientPhone}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize bg-slate-50 px-2 py-0.5 rounded text-slate-600 font-medium">
                    {lead.source.replace('_', ' ')}
                  </span>
                  <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {lead.status !== 'converted' && (
                    <>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                        disabled={isPending}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      {(lead.status === 'qualified' || lead.status === 'new' || lead.status === 'contacted') && (
                        <button
                          onClick={() => setConvertingLeadId(lead._id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center"
                        >
                          Convert <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                      )}
                    </>
                  )}
                  {lead.relatedDealId && (
                    <Link
                      href={`/portal/partner/dashboard/deals/${lead.relatedDealId}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                      View Deal
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-slate-400 font-medium text-sm">
              No leads found. Click &quot;Add Lead&quot; to create your first lead.
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-8 py-6 border-b border-slate-50">Client</th>
                <th className="px-8 py-6 border-b border-slate-50">Email</th>
                <th className="px-8 py-6 border-b border-slate-50">Phone</th>
                <th className="px-8 py-6 border-b border-slate-50">Source</th>
                <th className="px-8 py-6 border-b border-slate-50">Status</th>
                <th className="px-8 py-6 border-b border-slate-50">Date</th>
                <th className="px-8 py-6 border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900">{lead.clientName}</td>
                    <td className="px-8 py-5 text-slate-600">{lead.clientEmail}</td>
                    <td className="px-8 py-5 text-slate-500">{lead.clientPhone || '—'}</td>
                    <td className="px-8 py-5">
                      <span className="capitalize text-xs bg-slate-100 px-2.5 py-1 rounded-full font-semibold text-slate-600">
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {lead.status === 'converted' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      ) : (
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                          disabled={isPending}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-semibold capitalize"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-medium">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status !== 'converted' && !lead.relatedDealId && (
                          <button
                            onClick={() => setConvertingLeadId(lead._id)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                          >
                            Convert to Deal <ArrowRight className="h-3 w-3 ml-1" />
                          </button>
                        )}
                        {lead.relatedDealId && (
                          <Link
                            href={`/portal/partner/dashboard/deals/${lead.relatedDealId}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                          >
                            View Deal
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-medium">
                    No leads found. Click &quot;Add Lead&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert Lead Modal */}
      {convertingLeadId && (
        <ConvertLeadModal
          lead={leads.find((l) => l._id === convertingLeadId)!}
          onClose={() => setConvertingLeadId(null)}
          onConvert={handleConvert}
          isPending={isPending}
        />
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <AddLeadModal onClose={() => setShowAddLead(false)} />
      )}
    </div>
  );
}

// ─── Convert Lead Modal ────────────────────────────────────────────

function ConvertLeadModal({
  lead,
  onClose,
  onConvert,
  isPending,
}: {
  lead: Lead;
  onClose: () => void;
  onConvert: (leadId: string, formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Convert Lead to Deal</h3>
        <p className="text-sm text-slate-500 mb-6">
          Creating a deal for <strong>{lead.clientName}</strong> ({lead.clientEmail})
        </p>

        <form
          action={(formData) => onConvert(lead._id, formData)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Deal Value (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                name="estimatedValue"
                required
                min="1"
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <select
              name="serviceType"
              required
              defaultValue=""
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="" disabled>Select service type...</option>
              <option value="SME">SME</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Additional context..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
          >
            {isPending ? 'Converting...' : 'Convert to Deal'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Add Lead Modal ────────────────────────────────────────────────

function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [state, dispatch] = useActionState(createManualLead, {
    message: '',
    errors: {},
  });
  const router = useRouter();

  // Close modal on success
  if (state && 'success' in state && state.success) {
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Lead</h3>
            <p className="text-sm text-slate-500">Create a lead manually</p>
          </div>
        </div>

        <form action={dispatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
            <input
              type="text"
              name="clientName"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="e.g. Acme Corporation"
            />
            {state?.errors?.clientName && (
              <p className="text-red-500 text-xs mt-1">{state.errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Email</label>
            <input
              type="email"
              name="clientEmail"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="e.g. contact@acmecorp.com"
            />
            {state?.errors?.clientEmail && (
              <p className="text-red-500 text-xs mt-1">{state.errors.clientEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Phone (optional)</label>
            <input
              type="tel"
              name="clientPhone"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="e.g. +1 555 123 4567"
            />
            {state?.errors?.clientPhone && (
              <p className="text-red-500 text-xs mt-1">{state.errors.clientPhone}</p>
            )}
          </div>

          {state?.message && !('success' in state) && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Create Lead
          </button>
        </form>
      </div>
    </div>
  );
}
