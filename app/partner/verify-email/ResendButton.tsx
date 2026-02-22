'use client';
import { useState } from 'react';
import { resendVerificationEmail } from '@/lib/actions/auth';

export default function ResendButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function handleResend() {
    setLoading(true);
    setMessage('');
    setError(false);
    
    const result = await resendVerificationEmail();
    if (result.success) {
      setMessage(result.message);
    } else {
      setMessage(result.message || 'Failed to resend. Check your connection.');
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center mt-6">
      <button 
        onClick={handleResend}
        disabled={loading}
        className="w-full bg-emerald-600 text-white font-medium py-3 rounded-lg border border-emerald-700 shadow-sm hover:bg-emerald-700 hover:shadow transition-all disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Resend Verification Email'}
      </button>
      {message && (
        <p className={`mt-3 text-sm font-medium ${error ? 'text-red-500' : 'text-emerald-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
