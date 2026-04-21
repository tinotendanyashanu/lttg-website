'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { authenticate } from '@/lib/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {pending ? 'Signing in...' : 'Sign in to Staff Portal'}
    </button>
  );
}

export default function PortalLoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a] px-4">
      <div className="w-full max-w-[448px] bg-white dark:bg-[#111111] p-8 md:p-12 rounded-2xl border border-[#dadce0] dark:border-[#222] shadow-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
             <div className="text-2xl font-bold tracking-tighter text-[#1a73e8]">LeoTheTechGuy</div>
          </Link>
          <h1 className="text-2xl font-semibold text-[#202124] dark:text-white">Staff Portal</h1>
          <p className="text-sm text-[#5f6368] dark:text-gray-400 mt-2">Internal employee &amp; admin access</p>
        </div>

        <form action={dispatch} className="space-y-6">
          <input type="hidden" name="loginSource" value="portal" />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#3c4043] dark:text-gray-300">
              Internal Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 bg-white dark:bg-[#181818] border border-[#dadce0] dark:border-[#333] rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all text-[#202124] dark:text-white"
              placeholder="name@leothetechguy.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-[#3c4043] dark:text-gray-300">
                Password
              </label>
              <Link href="/forgot-password" title="Recover password" className="text-sm text-[#1a73e8] hover:underline font-medium">
                Forgot?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2.5 bg-white dark:bg-[#181818] border border-[#dadce0] dark:border-[#333] rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all text-[#202124] dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <SubmitButton />
        </form>

        <div className="mt-8 pt-8 border-t border-[#f1f3f4] dark:border-[#222] text-center">
          <p className="text-sm text-[#5f6368] dark:text-gray-400 font-medium">
            Authorized access only. All sessions are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
