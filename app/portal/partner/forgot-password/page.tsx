'use client';

import { useActionState } from 'react';
import { forgotPassword } from '@/lib/actions/auth';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPassword, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {state?.message && (
            <div className={`p-4 rounded-md text-sm text-center ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {state.message}
            </div>
        )}

        <form action={action} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/partner/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
