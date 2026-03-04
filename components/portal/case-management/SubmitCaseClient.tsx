'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubmitCaseClientProps {
  submitCaseAction: (formData: FormData, confirmDuplicate: boolean, adminOverride: boolean) => Promise<any>;
  isAdmin: boolean;
}

export default function SubmitCaseClient({ submitCaseAction, isAdmin }: SubmitCaseClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Duplicate detection state
  const [duplicatePrompt, setDuplicatePrompt] = useState<{ clientName: string, count: number } | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [adminOverride, setAdminOverride] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setBlockedMessage(null);
    setDuplicatePrompt(null);

    const formData = new FormData(e.currentTarget);
    setPendingFormData(formData);

    await processSubmission(formData, false, adminOverride);
  };

  const processSubmission = async (formData: FormData, confirmDuplicate: boolean, override: boolean) => {
    try {
      const res = await submitCaseAction(formData, confirmDuplicate, override);
      
      if (res.blocked) {
        setBlockedMessage(res.message);
        setIsSubmitting(false);
        return;
      }

      if (res.promptDuplicate) {
        setDuplicatePrompt({ clientName: res.clientName, count: res.count });
        setIsSubmitting(false);
        return;
      }

      if (res.success) {
        router.push('/portal/case-management');
        router.refresh();
      } else {
        setError(res.error || 'An unexpected error occurred.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  const confirmDuplicateCreation = () => {
    if (pendingFormData) {
      setIsSubmitting(true);
      processSubmission(pendingFormData, true, adminOverride);
    }
  };

  const cancelDuplicateCreation = () => {
    setDuplicatePrompt(null);
    setPendingFormData(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto mt-8">
      <header className="flex items-center gap-4">
        <Link 
          href="/portal/case-management"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
        >
          <span className="material-icons-outlined block">arrow_back</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Submit New Case</h2>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {blockedMessage && (
        <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 p-6 rounded-2xl border border-orange-200 dark:border-orange-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-orange-500 text-2xl">warning</span>
            <h3 className="text-lg font-bold">Duplicate Active Case Detected</h3>
          </div>
          <p className="text-sm">{blockedMessage}</p>
          
          {isAdmin && (
            <div className="mt-2 pt-4 border-t border-orange-200 dark:border-orange-800 flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input 
                  type="checkbox" 
                  checked={adminOverride} 
                  onChange={(e) => setAdminOverride(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary/50"
                />
                Admin Override: Allow creation anyway
              </label>
              {adminOverride && (
                <button 
                  onClick={() => pendingFormData && processSubmission(pendingFormData, true, true)}
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all self-start"
                >
                  Force Create Case
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {duplicatePrompt && !blockedMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-blue-500 text-2xl">info</span>
            <h3 className="text-lg font-bold">Existing Client Found</h3>
          </div>
          <p className="text-sm">
            This client already exists in the system: <strong>{duplicatePrompt.clientName}</strong> with {duplicatePrompt.count} previous case(s).
          </p>
          <p className="text-sm font-medium">Do you want to create a new case for this client?</p>
          <div className="flex gap-3 mt-2">
            <button 
              onClick={confirmDuplicateCreation}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              Yes, Create New Case
            </button>
            <button 
              onClick={cancelDuplicateCreation}
              disabled={isSubmitting}
              className="bg-white dark:bg-[#27272a] hover:bg-gray-50 dark:hover:bg-[#18181b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={`bg-white dark:bg-[#27272a] p-8 rounded-2xl shadow-soft ${duplicatePrompt || blockedMessage ? 'opacity-50 pointer-events-none' : ''}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Name (Optional)</label>
                <input 
                  type="text" 
                  id="businessName" 
                  name="businessName" 
                  className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  placeholder="E.g., Acme Corp"
                />
              </div>
              <div>
                <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="contactName" 
                  name="contactName" 
                  required 
                  className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  required 
                  className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Industry (Optional)</label>
                  <input 
                     type="text" 
                     id="industry" 
                     name="industry" 
                     className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                     placeholder="E.g., Healthcare, Retail"
                  />
               </div>
               <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location (Optional)</label>
                  <input 
                     type="text" 
                     id="location" 
                     name="location" 
                     className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
                     placeholder="City, Country"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="serviceInterest" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Service Interest <span className="text-red-500">*</span></label>
                  <select 
                     id="serviceInterest" 
                     name="serviceInterest" 
                     required 
                     className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all cursor-pointer"
                  >
                     <option value="">Select...</option>
                     <option value="software_development">Software Dev</option>
                     <option value="cloud_infrastructure">Cloud Infra</option>
                     <option value="design">UI/UX Design</option>
                     <option value="consulting">Consulting</option>
                     <option value="other">Other</option>
                  </select>
               </div>
               <div>
                  <label htmlFor="urgencyLevel" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Urgency Level</label>
                  <select 
                     id="urgencyLevel" 
                     name="urgencyLevel" 
                     className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all cursor-pointer"
                  >
                     <option value="">Select...</option>
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                     <option value="immediate">Immediate</option>
                  </select>
               </div>
               <div>
                  <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lead Source</label>
                  <select 
                     id="source" 
                     name="source" 
                     className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all cursor-pointer"
                  >
                     <option value="">Select...</option>
                     <option value="inbound">Inbound</option>
                     <option value="outbound">Outbound</option>
                     <option value="referral">Referral</option>
                     <option value="event">Event</option>
                     <option value="other">Other</option>
                  </select>
               </div>
            </div>

            <div>
               <label htmlFor="dealValue" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estimated Deal Value ($) (Optional)</label>
               <input 
                  type="number" 
                  id="dealValue" 
                  name="dealValue" 
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all cursor-pointer"
                  placeholder="0"
               />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Initial Notes (Optional)</label>
              <textarea 
                id="notes" 
                name="notes" 
                rows={4}
                className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all resize-none"
                placeholder="Any additional details about this lead to assist your team..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Originate Case'}
            </button>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              You will automatically be assigned as the owner of this case.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
