'use client';

import { useState, useTransition } from 'react';
import { signContract } from '@/lib/actions/admin-contracts';

interface Props {
  contractId: string;
  contractNumber: string;
  title: string;
}

export default function SignContractButton({ contractId, contractNumber, title }: Props) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSign() {
    setError(null);
    startTransition(async () => {
      try {
        await signContract(contractId);
        setStep('done');
      } catch (err: any) {
        setError(err?.message || 'Failed to sign contract. Please try again.');
        setStep('idle');
      }
    });
  }

  if (step === 'done') {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl px-6 py-5">
        <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400 text-[28px]">
          verified
        </span>
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Contract Signed</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
            You have successfully signed <strong>{contractNumber}</strong>. A confirmation has been recorded.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-6 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-icons-outlined text-amber-500 text-[24px] mt-0.5">warning</span>
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">
              Confirm Your Signature
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
              By clicking <strong>Sign Contract</strong> below, you agree to the terms and conditions
              outlined in <strong>&ldquo;{title}&rdquo;</strong> ({contractNumber}). This action is
              legally binding and cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('idle')}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            {isPending ? (
              <>
                <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                Signing…
              </>
            ) : (
              <>
                <span className="material-icons-outlined text-[16px]">draw</span>
                Sign Contract
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={() => setStep('confirm')}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm"
      >
        <span className="material-icons-outlined text-[18px]">draw</span>
        Review &amp; Sign Contract
      </button>
    </div>
  );
}
