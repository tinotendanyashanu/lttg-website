'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validateOnboardingToken, setupUserPassword } from '@/lib/actions/onboarding';
import Link from 'next/link';

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ email: string; fullName: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function checkToken() {
      const res = await validateOnboardingToken(token);
      if (res.valid) {
        setUserData({ email: res.email!, fullName: res.fullName! });
      } else {
        setError(res.message!);
      }
      setLoading(false);
    }
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    const res = await setupUserPassword({ token, password, confirmPassword });
    
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else if (res.errors) {
      setFieldErrors(res.errors);
    } else {
      setError(res.message || 'An unexpected error occurred.');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090b]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/20" />
          <p className="text-gray-500 font-medium">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090b] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#18181b] p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <Link href="/login" className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-2xl font-semibold transition hover:opacity-90">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090b] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#18181b] p-10 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Aboard!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Your account has been secured. Redirecting you to the login portal...
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full animate-[progress_3s_linear]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#09090b]">
      {/* Branding Side */}
      <div className="hidden md:flex flex-col justify-center p-16 w-1/2 bg-gray-50 dark:bg-[#111113] border-r border-gray-100 dark:border-gray-800">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">L</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">LEO THE TECH GUY</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6">
            Professional <br /> <span className="text-blue-600">Employee Workspace</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
            Welcome to the team, <span className="font-bold text-gray-900 dark:text-white">{userData?.fullName}</span>. 
            Please secure your account by setting up your primary credentials.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: 'security', title: 'Enterprise Security', desc: 'Secure encryption for all internal communications.' },
              { icon: 'speed', title: 'Real-time Analytics', desc: 'Instant feedback on your performance and goals.' },
              { icon: 'hub', title: 'Unified Management', desc: 'Everything you need to manage cases in one place.' }
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <span className="material-icons-outlined text-xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20">
        <div className="max-w-md w-full">
          <div className="md:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">L</div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">LEO THE TECH GUY</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Set Password</h2>
            <p className="text-gray-500 dark:text-gray-400">Account: <span className="font-medium text-gray-700 dark:text-gray-200">{userData?.email}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
              <input 
                name="password"
                type="password"
                required
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="At least 8 characters"
              />
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.password[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
              <input 
                name="confirmPassword"
                type="password"
                required
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Confirm your password"
              />
              {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword[0]}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gray-900/10 dark:shadow-none mt-4"
            >
              {isSubmitting ? 'Securing Account...' : 'Complete Setup'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400 leading-relaxed px-8">
            By completing this setup, you agree to our Internal Security Policy and Employee Conduct Guidelines.
          </p>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
