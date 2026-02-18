'use client';

import { useState } from 'react';
import { adminSendPasswordReset } from '@/lib/actions/admin-security';
import { KeyRound, Check, Loader2 } from 'lucide-react';

export default function AdminPasswordResetButton({ partnerId }: { partnerId: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');

    const handleReset = async () => {
        if (!confirm('Are you sure you want to send a password reset link to this partner?')) return;
        
        setLoading(true);
        setMessage('');
        try {
            const result = await adminSendPasswordReset(partnerId);
            setSuccess(result.success);
            setMessage(result.message);
        } catch (err) {
            setSuccess(false);
            setMessage('Failed to trigger reset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-2">
            <button 
                onClick={handleReset}
                disabled={loading}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2 text-amber-500" />}
                Send Password Reset
            </button>
            {message && (
                <p className={`text-xs mt-2 ${success ? 'text-emerald-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
