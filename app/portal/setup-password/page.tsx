'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { setupClientPassword } from '@/lib/actions/client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SetupPasswordForm() {
  const [state, dispatch] = useActionState(setupClientPassword, undefined);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  if ((state as any)?.success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-outlined text-green-500 text-3xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Activated</h2>
        <p className="text-neutral-400 mb-8">
          Your password has been set. You can now log in to your client portal.
        </p>
        <Link
          href="/portal/login"
          className="w-full inline-block bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          New Password
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-neutral-600"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          className="w-full px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-neutral-600"
          placeholder="Confirm your password"
        />
      </div>

      <div className="h-4">
        {(state as any)?.message && (
          <p className="text-sm text-red-400">{(state as any).message}</p>
        )}
      </div>

      <SetupButton />
    </form>
  );
}

function SetupButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {pending ? 'Activating...' : 'Set Password & Activate Account'}
    </button>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-neutral-950 text-white relative overflow-hidden border-r border-neutral-900">
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-2xl font-bold tracking-tighter text-white"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black tracking-tighter shadow-lg shadow-blue-500/20">
                L
              </span>
              <span>LEO THE TECH GUY</span>
            </Link>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-br from-white to-neutral-400">
            Set Up Your Client Portal
          </h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            You have been invited to the LeoTheTechGuy Client Portal. Set a secure
            password to access your cases, invoices, and more.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Track your cases in real-time',
              'Secure evidence locker',
              'Direct messaging with our team',
              'Invoice and payment management',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-neutral-300">
                <span className="material-icons-outlined text-blue-400 text-[16px]">
                  check_circle
                </span>
                <span className="text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-8 bg-[#0a0a0a] text-white">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-12">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xl font-bold tracking-tighter text-white"
            >
              <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-black tracking-tighter">
                L
              </span>
              <span>LEO THE TECH GUY</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Activate Account</h1>
          <p className="text-neutral-500 mb-8">
            Create a secure password to access your portal.
          </p>
          <Suspense fallback={<div className="text-neutral-500 text-sm">Loading...</div>}>
            <SetupPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
