'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { signContract } from '@/lib/actions/admin-contracts';

interface Props {
  contractId: string;
  contractNumber: string;
  title: string;
  accountName: string;
}

export default function SignContractButton({ contractId, contractNumber, title, accountName }: Props) {
  const [step, setStep] = useState<'idle' | 'sign' | 'draw' | 'confirm' | 'done'>('idle');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState(accountName);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Set up canvas drawing handlers when draw step is active
  useEffect(() => {
    if (step !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
      const r = canvas!.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
      }
      return { x: (e as MouseEvent).clientX - r.left, y: (e as MouseEvent).clientY - r.top };
    }

    function onStart(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getPos(e);
    }

    function onMove(e: MouseEvent | TouchEvent) {
      if (!isDrawingRef.current || !lastPosRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx!.beginPath();
      ctx!.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx!.lineTo(pos.x, pos.y);
      ctx!.stroke();
      lastPosRef.current = pos;
    }

    function onEnd() {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    }

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);

    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('mouseleave', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, [step]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  }

  function isCanvasEmpty(): boolean {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return false;
    }
    return true;
  }

  function captureAndProceed() {
    if (!isCanvasEmpty()) {
      setSignatureDataUrl(canvasRef.current!.toDataURL('image/png'));
    } else {
      setSignatureDataUrl(null);
    }
    setStep('confirm');
  }

  function handleSign() {
    setError(null);
    if (!signerName.trim() || signerName.trim().length < 2) {
      setError('Please enter your full legal name to sign.');
      return;
    }
    startTransition(async () => {
      try {
        await signContract(contractId, signerName.trim(), signatureDataUrl || undefined);
        setStep('done');
      } catch (err: any) {
        setError(err?.message || 'Failed to sign contract. Please try again.');
        setStep('confirm');
      }
    });
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl px-6 py-5">
        <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400 text-[28px]">verified</span>
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Contract Signed</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
            You have successfully signed <strong>{contractNumber}</strong>. A confirmation has been recorded.
          </p>
        </div>
      </div>
    );
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-6 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-icons-outlined text-amber-500 text-[24px] mt-0.5">warning</span>
          <div>
            <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Confirm Your Signature</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
              By clicking <strong>Sign Contract</strong> below, you agree to the terms and conditions
              outlined in <strong>&ldquo;{title}&rdquo;</strong> ({contractNumber}). This action is
              legally binding and cannot be undone.
            </p>
          </div>
        </div>

        {/* Signature summary */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-amber-200 dark:border-amber-900/40 px-4 py-3 space-y-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Signing as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white italic">{signerName}</p>
          </div>
          {signatureDataUrl && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Drawn signature</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signatureDataUrl}
                alt="Your drawn signature"
                className="max-h-16 border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('draw')}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSign}
            disabled={isPending || signerName.trim().length < 2}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            {isPending ? (
              <><span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>Signing…</>
            ) : (
              <><span className="material-icons-outlined text-[16px]">draw</span>Sign Contract</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Draw signature ────────────────────────────────────────────────────────
  if (step === 'draw') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-5 space-y-4">
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Draw Your Signature</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Optional. Draw your signature below using your mouse or finger. You can skip this step if you prefer to sign by typed name only.
          </p>
        </div>

        {/* Canvas */}
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-[#1c1c1e]">
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '160px',
              display: 'block',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          />
          {/* Ghost placeholder */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ opacity: signatureDataUrl ? 0 : 0.25 }}
          >
            <p className="text-gray-400 text-sm font-medium italic">Sign here</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
          >
            <span className="material-icons-outlined text-[13px]">restart_alt</span>
            Clear
          </button>
          <button
            type="button"
            onClick={() => setStep('confirm')}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
          >
            Skip drawing →
          </button>
          <button
            type="button"
            onClick={captureAndProceed}
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:opacity-90 text-white dark:text-gray-900 rounded-xl px-4 py-1.5 text-xs font-semibold transition-opacity ml-auto"
          >
            Use this signature →
          </button>
        </div>
      </div>
    );
  }

  // ── Type name ─────────────────────────────────────────────────────────────
  if (step === 'sign') {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-6 py-5 space-y-4">
        <div>
          <p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Step 1 of 3 — Confirm Your Name</p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
            Type your full legal name exactly as it should appear on the contract.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wider">
            Full Legal Name *
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Your full legal name"
            className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#27272a] text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 font-medium"
          />
          <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1">
            Typing your name constitutes your electronic signature.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('idle')}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep('draw')}
            disabled={signerName.trim().length < 2}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            Next: Draw Signature
            <span className="material-icons-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={() => setStep('sign')}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm"
      >
        <span className="material-icons-outlined text-[18px]">draw</span>
        Review &amp; Sign Contract
      </button>
    </div>
  );
}
