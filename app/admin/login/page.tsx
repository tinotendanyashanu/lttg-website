'use client';

import { useActionState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { initiateAdminLogin } from '@/lib/actions/admin-auth';

const initialState = { error: '' };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(initiateAdminLogin, initialState);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Focus password field on load
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-slate-600 via-white/30 to-slate-600" />

          <div className="px-8 py-10">
            {/* Logo + brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <Image
                  src="/logo_transparent.png"
                  width={38}
                  height={38}
                  alt="LeoTheTechGuy"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Access</h1>
              <p className="text-slate-400 text-sm mt-1 text-center">
                Restricted — authorised personnel only
              </p>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Admin Password
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                />
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span className="material-icons-outlined text-red-400 text-[16px]">error_outline</span>
                  <p className="text-red-400 text-sm">{state.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-white text-[#0f172a] font-bold py-3 rounded-xl text-sm hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  <>
                    Continue
                    <span className="material-icons-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Info note */}
            <div className="mt-6 flex items-start gap-2 bg-slate-800/50 rounded-xl p-3">
              <span className="material-icons-outlined text-slate-500 text-[16px] mt-0.5 shrink-0">info</span>
              <p className="text-slate-500 text-xs leading-relaxed">
                A one-time verification code will be sent to your admin email address to complete sign-in.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          LeoTheTechGuy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
