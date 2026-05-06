'use client';

import { useActionState } from 'react';
import { resetPassword } from '@/lib/actions/auth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, action, isPending] = useActionState(resetPassword, undefined);

  if (!token) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">Invalid Link</h1>
            <p className="text-gray-600 mb-4">Missing reset token.</p>
            <Link href="/partner/login" className="text-blue-600 hover:underline">Return to Login</Link>
        </div>
      );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Set New Password
        </h2>
      </div>

      {state?.message && (
          <div className={`p-4 rounded-md text-sm text-center ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {state.message}
          </div>
      )}
      
      {state?.success && (
          <div className="text-center">
              <Link href="/partner/login" className="text-blue-600 font-medium hover:underline">
                  Proceed to Login
              </Link>
          </div>
      )}

      {!state?.success && (
      <form action={action} className="mt-8 space-y-6">
        <input type="hidden" name="token" value={token} />
        
        <div className="space-y-4">
          <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="New Password"
              />
          </div>
          <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
              />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
