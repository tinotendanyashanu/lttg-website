'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Loader2, CheckCircle, MessageCircle, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategySessionModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedProject, setSubmittedProject] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const project = formData.get('project') as string;

    try {
      const res = await fetch('/api/project-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, project, message: project }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Something went wrong');

      setSubmittedName(name);
      setSubmittedProject(project);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Hi Leo, I just submitted a strategy session request.\n\nName: ${submittedName}\nProject: ${submittedProject}\n\nLooking forward to connecting!`
  );
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const emailUrl = `mailto:contact@leothetechguy.com?subject=${encodeURIComponent(`Strategy Session - ${submittedName}`)}&body=${encodeURIComponent(`Hi Leo,\n\nI submitted a strategy session request.\n\nProject: ${submittedProject}\n\nLooking forward to connecting!`)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Details Received!</h2>
            <p className="text-slate-500 mb-8">
              Your request has been saved. Continue the conversation below.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#25D366] text-white font-semibold rounded-2xl hover:bg-[#1ebe5d] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Continue on WhatsApp
              </a>
              <a
                href={emailUrl}
                className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-slate-100 text-slate-900 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Send Email Instead
              </a>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Book a Strategy Session</h2>
            <p className="text-slate-500 mb-7 text-sm">Leave your details and what you need — I&apos;ll reach out to schedule a call.</p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="modal-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    required
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-whatsapp" className="block text-sm font-medium text-slate-700 mb-1.5">
                  WhatsApp Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="modal-whatsapp"
                  name="whatsapp"
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label htmlFor="modal-project" className="block text-sm font-medium text-slate-700 mb-1.5">What do you need?</label>
                <textarea
                  id="modal-project"
                  name="project"
                  required
                  rows={3}
                  placeholder="Briefly describe what you want to build or discuss..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none text-sm transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-[#0071e3] rounded-full hover:bg-[#0077ED] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit & Connect
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
