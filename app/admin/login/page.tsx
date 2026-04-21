'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { initiateAdminLogin } from '@/lib/actions/admin-auth';
import Link from 'next/link';

const initialState = { error: '' };

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full bg-white text-[#0f172a] font-bold py-3.5 rounded-2xl text-sm hover:bg-slate-100 active:bg-slate-200 transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 group"
    >
      <span className="material-icons-outlined text-[18px]">verified_user</span>
      Continue to Verification
      <span className="material-icons-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(initiateAdminLogin, initialState);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-white/10">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" />
        
        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-400 to-blue-600" />

          <div className="px-10 py-12">
            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="/logo_transparent.png"
                  width={44}
                  height={44}
                  alt="LeoTheTechGuy"
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Admin Panel</h1>
              <div className="mt-2 flex items-center gap-2 text-slate-400 text-xs font-bold tracking-widest">
                <span className="w-8 h-[1px] bg-slate-700" />
                SECURE ACCESS
                <span className="w-8 h-[1px] bg-slate-700" />
              </div>
            </div>

            {/* Login Form */}
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Master Password
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-slate-500 group-focus-within:text-white transition-colors">lock</span>
                  <input
                    type="password"
                    name="password"
                    required
                    autoFocus
                    placeholder="••••••••••••"
                    className="w-full bg-[#0f172a]/50 text-white border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-white/20 focus:ring-4 focus:ring-white/5 focus:outline-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {state?.error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
                  <span className="material-icons-outlined text-red-400 text-[20px]">security</span>
                  <p className="text-red-400 text-sm font-medium">{state.error}</p>
                </div>
              )}

              <SubmitButton />
            </form>

            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-col gap-4 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  This is a restricted administrative system. <br />
                  All activities are logged and monitored.
                </p>
                <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-bold">
                  <span className="material-icons-outlined text-[14px]">logout</span>
                  Exit to Public Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-8 font-bold tracking-[0.3em] uppercase">
          &copy; {new Date().getFullYear()} LeoTheTechGuy Systems
        </p>
      </div>
    </div>
  );
}
