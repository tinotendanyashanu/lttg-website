'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePayoutSettings } from '@/lib/actions/settings';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface SettingsState {
  message: string;
  errors?: {
    countryOfResidence?: string[];
    payoutMethod?: string[];
    [key: string]: string[] | undefined;
  };
  success: boolean;
}

const initialState: SettingsState = {
  message: '',
  errors: {},
  success: false,
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving...' : 'Save Payout Settings'}
    </button>
  );
}

export default function PayoutSettingsForm({ partner }: { partner: Record<string, unknown> & { payoutMethod?: string, countryOfResidence?: string, localRemittanceDetails?: Record<string, string> } }) {
  const [state, dispatch] = useActionState(updatePayoutSettings, initialState);
  const [method, setMethod] = useState(partner.payoutMethod || '');

  const now = new Date();
  const date = now.getDate();
  const isLockedOut = date >= 2 && date <= 5;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8">
          {isLockedOut && (
             <div className="flex items-start p-4 mb-6 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5 text-amber-600" />
                <div>
                   <p className="font-bold">Settings Locked</p>
                   <p className="mt-1 font-normal text-amber-700">Payout method changes are disabled between the 2nd and 5th of the month to process payouts securely.</p>
                </div>
             </div>
          )}

          {state?.message && !isLockedOut && (
            <div className={`flex items-center p-4 mb-6 rounded-xl text-sm font-medium ${
              state.success 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {state.success 
                ? <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                : <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              }
              {state.message}
            </div>
          )}

          <form action={dispatch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country of Residence *</label>
                <input
                  type="text"
                  name="countryOfResidence"
                  defaultValue={partner.countryOfResidence || ''}
                  required
                  disabled={isLockedOut}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                  placeholder="e.g. Zimbabwe"
                />
                {state?.errors?.countryOfResidence && <p className="text-red-500 text-xs mt-1">{state.errors.countryOfResidence}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payout Method *</label>
                <select
                  name="payoutMethod"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                  disabled={isLockedOut}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white disabled:opacity-50"
                >
                  <option value="" disabled>Select Method</option>
                  <option value="Wise">Wise</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="USDT (TRC20)">USDT (TRC20)</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Local Remittance">Local Remittance (Africa only)</option>
                </select>
                {state?.errors?.payoutMethod && <p className="text-red-500 text-xs mt-1">{state.errors.payoutMethod}</p>}
              </div>
            </div>

            {method === 'Local Remittance' && (
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6 mt-6">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center">
                    Local Remittance Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          defaultValue={partner.localRemittanceDetails?.fullName || ''}
                          required={method === 'Local Remittance'}
                          disabled={isLockedOut}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                        <input
                          type="text"
                          name="mobileNumber"
                          defaultValue={partner.localRemittanceDetails?.mobileNumber || ''}
                          required={method === 'Local Remittance'}
                          disabled={isLockedOut}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          defaultValue={partner.localRemittanceDetails?.city || ''}
                          required={method === 'Local Remittance'}
                          disabled={isLockedOut}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Local Method</label>
                        <input
                          type="text"
                          name="preferredMethod"
                          defaultValue={partner.localRemittanceDetails?.preferredMethod || ''}
                          disabled={isLockedOut}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 bg-white"
                          placeholder="e.g. EcoCash, InnBucks"
                        />
                      </div>
                  </div>
               </div>
            )}

            <div className="flex justify-end pt-4">
              <SaveButton />
            </div>
          </form>
        </div>
      </div>
  );
}
