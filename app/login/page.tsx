'use client';

import { useActionState, useState, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/lib/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-full bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-blue-500/20"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const loginSource = searchParams.get('loginSource') || '';

  return (
    <form action={dispatch} className="space-y-6">
      {/* loginSource can be 'portal' (staff), 'client_portal', or 'partner' */}
      <input type="hidden" name="loginSource" value={loginSource} />
      
      <div className="space-y-1.5">
        <label htmlFor="email" className="ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#18181b] px-5 text-[15px] text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Password
          </label>
          <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-blue-600 hover:underline">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#18181b] px-5 text-[15px] text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
          <span className="material-icons-outlined text-[18px]">error_outline</span>
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}

export default function UnifiedLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#09090b] px-4 py-10">
      <div className="w-full max-w-[448px] overflow-hidden rounded-[32px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111113] p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none">
        
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-500/20">
            L
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Continue to your workspace</p>
        </div>

        <Suspense fallback={<div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-4 text-center">
            <Link href="/partner/signup" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Looking to join our <span className="text-blue-600">Partner Program</span>?
            </Link>
            <p className="text-[11px] text-gray-400 leading-relaxed px-4">
              Authorized access only. By signing in, you agree to our Terms of Service and Data Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
