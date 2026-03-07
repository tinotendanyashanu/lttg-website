'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { verifyAdminOTP } from '@/lib/actions/admin-auth';
import Link from 'next/link';

const initialState = { error: '' };
const OTP_LENGTH = 6;

export default function AdminLoginVerifyPage() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('t') ?? '';

  const [state, formAction, isPending] = useActionState(verifyAdminOTP, initialState);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Accept only digits
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits filled
      if (digit && next.every(Boolean)) {
        // Small delay for UX
        setTimeout(() => formRef.current?.requestSubmit(), 80);
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        } else if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (!pasted) return;
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((d, i) => { next[i] = d; });
      setDigits(next);
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      if (pasted.length === OTP_LENGTH) {
        setTimeout(() => formRef.current?.requestSubmit(), 80);
      }
    },
    [],
  );

  const otp = digits.join('');

  if (!tokenId) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Invalid or missing session token.</p>
          <Link href="/admin/login" className="text-white underline text-sm">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-slate-600 via-white/30 to-slate-600" />

          <div className="px-8 py-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <Image
                  src="/logo_transparent.png"
                  width={38}
                  height={38}
                  alt="LeoTheTechGuy"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Verify Your Identity</h1>
              <p className="text-slate-400 text-sm mt-1 text-center">
                Enter the 6-digit code sent to your registered admin email.
              </p>
            </div>

            {/* OTP Form */}
            <form ref={formRef} action={formAction} className="space-y-6">
              {/* Hidden inputs */}
              <input type="hidden" name="tokenId" value={tokenId} />
              <input type="hidden" name="otp" value={otp} />

              {/* 6-box OTP input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digits[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      disabled={isPending}
                      className={`w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none
                        ${digits[i]
                          ? 'bg-white text-[#0f172a] border-white'
                          : 'bg-[#0f172a] text-white border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/10'
                        } disabled:opacity-50`}
                    />
                  ))}
                </div>
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span className="material-icons-outlined text-red-400 text-[16px]">error_outline</span>
                  <p className="text-red-400 text-sm">{state.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || otp.length < OTP_LENGTH}
                className="w-full bg-white text-[#0f172a] font-bold py-3 rounded-xl text-sm hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-[18px]">lock_open</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Info + back link */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2 bg-slate-800/50 rounded-xl p-3">
                <span className="material-icons-outlined text-slate-500 text-[16px] mt-0.5 shrink-0">schedule</span>
                <p className="text-slate-500 text-xs leading-relaxed">
                  This code expires in <strong className="text-slate-400">10 minutes</strong>. Do not share it with anyone.
                </p>
              </div>
              <div className="text-center">
                <Link href="/admin/login" className="text-slate-500 hover:text-slate-300 text-xs transition-colors inline-flex items-center gap-1">
                  <span className="material-icons-outlined text-[14px]">arrow_back</span>
                  Try a different password
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          LeoTheTechGuy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
