'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white text-slate-900">
        <div className="w-full max-w-sm">
          <Link href="/partner" className="text-slate-400 text-sm hover:text-slate-900 transition-colors mb-8 block">&larr; Back to Partner Home</Link>
          <h1 className="text-3xl font-bold mb-2">Partner Login</h1>
          <p className="text-slate-500 mb-8">Welcome back. Enter your credentials to access the dashboard.</p>
          
          <form action={dispatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div className="h-4">
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
            </div>

            <LoginButton />
            
            <p className="mt-2 text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/partner/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
                Apply to become a partner
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-6">Complete transparency.</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            &quot;The Leo Systems partner dashboard gives us real-time visibility into our referrals and commissions. It&apos;s the most professional agency program we&apos;ve worked with.&quot;
          </p>
        </div>
        
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[80px]" />
             <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}
