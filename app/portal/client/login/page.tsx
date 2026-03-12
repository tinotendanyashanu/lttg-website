'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] hover:from-[#1d4ed8] hover:to-[#4338ca] disabled:opacity-60 text-white font-semibold text-sm transition-all duration-300 shadow-[0_4px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_32px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Getting you in…
        </>
      ) : (
        <>
          <span className="material-icons-outlined text-[18px]">lock_open</span>
          Sign In to My Portal
        </>
      )}
    </button>
  );
}

export default function ClientLoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Emotional branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
        </div>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="relative">
              <Image
                src="/logo_transparent.png"
                alt="LeoTech Logo"
                width={44}
                height={44}
                className="object-contain"
              />
              <div className="absolute inset-0 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-tight">LeoTech</p>
              <p className="text-indigo-300 text-[11px] font-semibold tracking-[0.2em] uppercase">
                Client Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Main emotional copy */}
        <div className="relative z-10 space-y-8">
          {/* Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Your team is ready
            </div>
            <h1 className="text-4xl font-bold text-white leading-[1.2] tracking-tight">
              We're in your corner,{' '}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)' }}>
                every step.
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Your case matters to us. Sign in to stay informed, connected, and in control
              of what's happening — whenever you need it.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {[
              { icon: 'track_changes', text: 'Live case status — no waiting for updates', color: 'text-blue-400' },
              { icon: 'lock', text: 'End-to-end encrypted evidence locker', color: 'text-indigo-400' },
              { icon: 'forum', text: 'Direct line to your assigned specialist', color: 'text-violet-400' },
              { icon: 'verified', text: 'Signed contracts & invoices in one place', color: 'text-emerald-400' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors mt-0.5">
                  <span className={`material-icons-outlined ${item.color} text-[16px]`}>
                    {item.icon}
                  </span>
                </div>
                <span className="text-slate-300 text-sm leading-relaxed pt-1">{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial / reassurance card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-icons-outlined text-amber-400 text-[14px]">star</span>
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "From the moment I logged in, I felt like they actually cared about my case.
              Transparent, responsive, and I always knew exactly what was happening."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center">
                <span className="material-icons-outlined text-indigo-300 text-[14px]">person</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah M.</p>
                <p className="text-slate-500 text-[11px]">LeoTech Client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Are you a team member?{' '}
            <Link href="/portal/login" className="text-slate-400 hover:text-white transition-colors">
              Staff login →
            </Link>
          </p>
          <div className="flex items-center gap-1 text-slate-600 text-xs">
            <span className="material-icons-outlined text-[14px]">https</span>
            256-bit SSL
          </div>
        </div>
      </div>

      {/* ── Right: Login form ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 bg-[#fafbff]">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Image src="/logo_transparent.png" alt="LeoTech" width={28} height={28} className="object-contain" />
          </div>
          <p className="font-bold text-gray-900 text-lg tracking-tight">LeoTech Client Portal</p>
          <p className="text-gray-400 text-xs">Your case, always within reach.</p>
        </div>

        <div className="w-full max-w-[360px]">
          {/* Greeting */}
          <div className="mb-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
              <span className="material-icons-outlined text-indigo-600 text-[22px]">waving_hand</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
              Good to see you. Your portal is ready with the latest updates on your case.
            </p>
          </div>

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="loginSource" value="client_portal" />

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-300 text-[18px]">
                  mail_outline
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm hover:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-300 text-[18px]">
                  lock_outline
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm hover:border-gray-300"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <SubmitButton />
          </form>

          {/* Trust strip */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="material-icons-outlined text-[13px] text-emerald-400">shield</span>
              Encrypted & secure
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <span className="material-icons-outlined text-[13px] text-blue-400">verified_user</span>
              Private by default
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-center">
            <p className="text-xs text-gray-400">
              Don&apos;t have access yet?{' '}
              <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Contact us to get started
              </Link>
            </p>
            <p className="text-xs">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to website
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
