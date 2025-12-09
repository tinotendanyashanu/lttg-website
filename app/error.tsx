'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong!</h2>
        <p className="text-slate-600 mb-8">
          We encountered an unexpected error. Don't worry, it's not your fault.
        </p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#0071e3] rounded-full hover:bg-[#0077ED] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
