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
      className="w-full py-3 px-6 rounded-xl bg-[#4C8BFF] hover:bg-[#3a7aee] disabled:opacity-60 text-white font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(76,139,255,0.3)] hover:shadow-[0_0_30px_rgba(76,139,255,0.5)] flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Signing in...
        </>
      ) : (
        'Sign In to Portal'
      )}
    </button>
  );
}

export default function ClientLoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] relative overflow-hidden flex-col justify-between p-12">
        {/* Ambient blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#4C8BFF]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image
              src="/logo_transparent.png"
              alt="LeoTech Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <p className="text-white font-bold text-lg leading-tight">LeoTech</p>
              <p className="text-[#4C8BFF] text-xs font-semibold tracking-widest uppercase">
                Client Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your Case,
            <br />
            <span className="text-[#4C8BFF]">Your Dashboard.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Track case progress, upload evidence, review invoices, and communicate
            directly with your assigned team — all in one place.
          </p>
          <ul className="space-y-3">
            {[
              { icon: 'folder_shared', text: 'Real-time case tracking' },
              { icon: 'lock', text: 'Secure evidence locker' },
              { icon: 'chat', text: 'Direct team messaging' },
              { icon: 'receipt_long', text: 'Invoices & contracts' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-7 h-7 rounded-lg bg-[#4C8BFF]/15 flex items-center justify-center shrink-0">
                  <span className="material-icons-outlined text-[#4C8BFF] text-[14px]">
                    {item.icon}
                  </span>
                </div>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-xs text-slate-600">
          Are you a team member?{' '}
          <Link href="/portal/login" className="text-[#4C8BFF] hover:underline">
            Staff login →
          </Link>
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-2 text-center">
          <Image
            src="/logo_transparent.png"
            alt="LeoTech Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <p className="font-bold text-gray-900 text-lg">LeoTech Client Portal</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to access your client dashboard
            </p>
          </div>

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="loginSource" value="portal" />

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4C8BFF]/30 focus:border-[#4C8BFF] transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4C8BFF]/30 focus:border-[#4C8BFF] transition-all"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            )}

            <SubmitButton />
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-xs text-gray-400">
              Don't have access yet?{' '}
              <Link href="/contact" className="text-[#4C8BFF] hover:underline font-medium">
                Contact us
              </Link>{' '}
              to get started.
            </p>
            <p className="text-xs text-gray-400">
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
