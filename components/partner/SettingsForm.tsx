'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // From react-dom in 19, but importing from react works too if types allow, sticking to react-dom for status
import { updateBankDetails } from '@/lib/actions/settings';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsState {
  message: string;
  errors?: {
    accountName?: string[];
    bankName?: string[];
    accountNumber?: string[];
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
      {pending ? 'Saving...' : 'Save Bank Details'}
    </button>
  );
}

interface BankDetails {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  sortCode?: string;
  iban?: string;
}

export default function SettingsForm({ bankDetails }: { bankDetails?: BankDetails }) {
  const [state, dispatch] = useActionState(updateBankDetails, initialState);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8">
          {state?.message && (
            <div className={`flex items-center p-4 mb-6 rounded-xl text-sm font-medium ${
              state.success 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {state.success 
                ? <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              }
              {state.message}
            </div>
          )}

          <form action={dispatch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountName"
                  defaultValue={bankDetails?.accountName || ''}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. John Smith"
                />
                {state?.errors?.accountName && <p className="text-red-500 text-xs mt-1">{state.errors.accountName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  defaultValue={bankDetails?.bankName || ''}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. FNB, Standard Bank, Barclays"
                />
                {state?.errors?.bankName && <p className="text-red-500 text-xs mt-1">{state.errors.bankName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                defaultValue={bankDetails?.accountNumber || ''}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. 1234567890"
              />
              {state?.errors?.accountNumber && <p className="text-red-500 text-xs mt-1">{state.errors.accountNumber}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort Code / Branch Code</label>
                <input
                  type="text"
                  name="sortCode"
                  defaultValue={bankDetails?.sortCode || ''}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IBAN (International)</label>
                <input
                  type="text"
                  name="iban"
                  defaultValue={bankDetails?.iban || ''}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <SaveButton />
            </div>
          </form>
        </div>
      </div>
  );
}
