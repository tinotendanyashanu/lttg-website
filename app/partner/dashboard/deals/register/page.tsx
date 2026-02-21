'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerDeal } from '@/lib/actions/partner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
};

export default function RegisterDealPage() {
  const [state, dispatch] = useActionState(registerDeal, initialState);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/partner/dashboard/deals" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Deals
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Register New Deal</h2>
        <p className="text-slate-600 mb-8">Register a new deal to track your commission. Please provide accurate details about the client and project scope. We&apos;ll review the deal within 24 hours.</p>

        <form action={dispatch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Name / Company</label>
            <input 
              type="text" 
              name="clientName" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Acme Corporation"
            />
            {state?.errors?.clientName && <p className="text-red-500 text-xs mt-1">{state.errors.clientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client Email Address</label>
            <input 
              type="email" 
              name="clientEmail" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. contact@acmecorp.com"
            />
            {state?.errors?.clientEmail && <p className="text-red-500 text-xs mt-1">{state.errors.clientEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Deal Value (USD)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                type="number" 
                name="estimatedValue" 
                required 
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="10000"
                />
            </div>
            {state?.errors?.estimatedValue && <p className="text-red-500 text-xs mt-1">{state.errors.estimatedValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <select 
              name="serviceType" 
              required 
              defaultValue=""
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="" disabled>Select service type...</option>
              <option value="SME">SME</option>
              <option value="Startup">Startup</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Individual">Individual</option>
            </select>
             {/* Map error if present, though state.errors type is loose here */}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea 
              name="notes" 
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Tell us about the project scope, timeline, or key decision makers..."
            />
          </div>

          {state?.message && (
             <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {state.message}
             </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Registering Deal...' : 'Register Deal'}
    </button>
  );
}
