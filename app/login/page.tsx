'use client';

import { useActionState, useState, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/lib/actions/auth';
import WalkingWoman from '@/components/WalkingWoman';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-xl bg-[#22c55e] text-sm font-bold text-white transition hover:bg-[#16a34a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-green-500/20"
    >
      {pending ? 'Authenticating...' : 'Login'}
    </button>
  );
}

type CharacterState = 'idle' | 'walking' | 'typing' | 'success';

function LoginForm({ 
  setCharacterState 
}: { 
  setCharacterState: (state: CharacterState) => void 
}) {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const loginSource = searchParams.get('loginSource') || '';

  const handleTyping = () => {
    setCharacterState('typing');
    const timer = setTimeout(() => setCharacterState('walking'), 1000);
    return () => clearTimeout(timer);
  };

  return (
    <form action={(formData) => {
      setCharacterState('success');
      dispatch(formData);
    }} className="space-y-6 w-full max-w-sm">
      <input type="hidden" name="loginSource" value={loginSource} />
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
          Username / Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onFocus={() => setCharacterState('walking')}
          onChange={(e) => {
            setEmail(e.target.value);
            handleTyping();
          }}
          placeholder="name@company.com"
          className="h-12 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-gray-900 dark:text-white outline-none transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-[#22c55e] hover:underline">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          onFocus={() => setCharacterState('walking')}
          onChange={handleTyping}
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-gray-900 dark:text-white outline-none transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20"
        />
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <span className="material-icons-outlined text-[18px]">error_outline</span>
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

export default function UnifiedLoginPage() {
  const [charState, setCharState] = useState<CharacterState>('walking');

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#09090b]">
      {/* The Stage Area (Split Screen) */}
      <div className="hidden lg:flex w-1/2 bg-[#050508] relative items-center justify-center overflow-hidden border-r border-violet-950/40">
         <div className="w-full h-full max-w-2xl flex items-center justify-center">
            <WalkingWoman state={charState} />
         </div>
      </div>

      {/* The Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 relative">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Mobile Character Fallback */}
          <div className="lg:hidden w-full h-64 mb-8 relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#050508] border border-violet-950/35">
            <WalkingWoman state={charState} />
          </div>

          <div className="mb-10 text-center w-full">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22c55e] text-white font-black text-2xl shadow-lg shadow-green-500/20">
              L
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Please sign in to continue</p>
          </div>

          <Suspense fallback={<div className="h-40 flex items-center justify-center text-gray-400">Loading...</div>}>
            <LoginForm setCharacterState={setCharState} />
          </Suspense>
          
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
            <Link href="/partner/signup" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Looking to join our <span className="text-[#22c55e]">Partner Program</span>?
            </Link>
            <p className="mt-4 text-[11px] text-gray-400 leading-relaxed px-4">
              Authorized access only. By signing in, you agree to our Terms of Service and Data Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}