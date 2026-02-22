'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { acceptTerms } from '@/lib/actions/auth';
import { CURRENT_TERMS_VERSION, TERMS_URL } from '@/lib/constants';

const initialState = {
  message: '',
};

export default function AcceptTermsPage() {
  const [state, dispatch] = useActionState(acceptTerms, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Updated Terms Required</h1>
          </div>
          <p className="text-amber-100 text-sm">
            Our Affiliate Agreement has been updated to version <strong>{CURRENT_TERMS_VERSION}</strong>. 
            You must review and accept the new terms before continuing.
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">What&apos;s changed?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Please review the updated Affiliate Agreement carefully. Key changes may include 
              commission structure, payment terms, and compliance requirements.
            </p>
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Read Full Affiliate Agreement ({CURRENT_TERMS_VERSION})
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>

          <form action={dispatch} className="space-y-5">
            <input type="hidden" name="termsAccepted" value="true" />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                onChange={(e) => {
                  const hidden = e.target.form?.querySelector('input[name="termsAccepted"]') as HTMLInputElement;
                  if (hidden) hidden.value = e.target.checked ? 'true' : 'false';
                }}
              />
              <span className="text-sm text-slate-700 leading-snug">
                I have read and agree to the updated{' '}
                <a
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                >
                  Affiliate Agreement ({CURRENT_TERMS_VERSION})
                </a>
              </span>
            </label>

            {state?.message && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
                {state.message}
              </div>
            )}

            <AcceptButton />
          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            Your acceptance will be timestamped and recorded for compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

function AcceptButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20"
    >
      {pending ? 'Processing...' : 'Accept & Continue'}
    </button>
  );
}
