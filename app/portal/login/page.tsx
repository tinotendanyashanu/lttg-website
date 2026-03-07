'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions/auth';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-neutral-950 text-white relative overflow-hidden border-r border-neutral-900">
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold tracking-tighter text-white">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black tracking-tighter shadow-lg shadow-blue-500/20">L</span>
              <span>LEO THE TECH GUY</span>
            </Link>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-br from-white to-neutral-400">Internal Operations Portal</h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            Secure access terminal for LeoTech employees, admins, and internship program participants. 
          </p>
        </div>
        
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px]" />
             <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-[#0a0a0a] text-white">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-12">
            <Link href="/" className="inline-flex items-center space-x-2 text-xl font-bold tracking-tighter text-white">
              <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-black tracking-tighter">L</span>
              <span>LEO THE TECH GUY</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Portal Access</h1>
          <p className="text-neutral-500 mb-8">Authenticate with your LeoTech credentials.</p>
          
          <form action={dispatch} className="space-y-4">
            {/* Hidden field to hint to the action where we want to go back to if we are internal */}
            <input type="hidden" name="loginSource" value="portal" />

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-neutral-600"
                placeholder="you@leotech.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
              <input 
                type="password" 
                name="password" 
                className="w-full px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-neutral-600"
                placeholder="••••••••"
              />
            </div>
            
            <div className="h-4">
                {errorMessage && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}
            </div>

            <LoginButton />
            
          </form>
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
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {pending ? 'Authenticating...' : 'Sign In'}
    </button>
  );
}
