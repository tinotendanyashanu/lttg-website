'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addComment } from '@/lib/actions/case-actions';
import Image from 'next/image';

interface CaseDetailClientProps {
  caseDoc: any;
  isAdmin: boolean;
  isAdminOrEmployee: boolean;
  currentUserId: string;
  initialComments: any[];
  initialLogs: any[];
  allAccounts: any[];
}

export default function CaseDetailClient({ caseDoc, isAdmin, isAdminOrEmployee, currentUserId, initialComments, initialLogs, allAccounts }: CaseDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(caseDoc.status);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [dealValue, setDealValue] = useState<number>(caseDoc.dealValue || 0);

  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [comments, setComments] = useState(initialComments);

  const [newParticipantId, setNewParticipantId] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (newStatus === 'closed') {
         // Use the close endpoint
         const res = await fetch(`/api/cases/${caseDoc._id}/close`, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' }
         });
         const data = await res.json();
         if (res.ok) {
            setStatus('closed');
            setSuccessMessage('Case closed and commission allocated.');
            router.refresh();
         } else {
            setError(data.error || 'Failed to close case');
         }
      } else if (newStatus === 'needs_assistance') {
         const res = await fetch(`/api/cases/${caseDoc._id}/assistance`, {
            method: 'POST'
         });
         const data = await res.json();
         if (res.ok) {
            setStatus('needs_assistance');
            setSuccessMessage('Marked as needs assistance.');
            router.refresh();
         } else {
            setError(data.error || 'Failed to update assistance status');
         }
      } else {
         const res = await fetch(`/api/cases/${caseDoc._id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
            headers: { 'Content-Type': 'application/json' }
         });
         const data = await res.json();
         if (res.ok) {
            setStatus(newStatus);
            setSuccessMessage(`Status updated to ${newStatus}`);
            router.refresh();
         } else {
            setError(data.error || 'Failed to update status');
         }
      }
    } catch (err: any) {
      setError('An error occurred');
    }
    
    setIsSubmitting(false);
  };

  const handleDealValueUpdate = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
       const res = await fetch(`/api/cases/${caseDoc._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ dealValue }),
          headers: { 'Content-Type': 'application/json' }
       });
       const data = await res.json();
       if (res.ok) {
          setSuccessMessage(`Deal value updated to $${dealValue}`);
          router.refresh();
       } else {
          setError(data.error || 'Failed to update deal value');
       }
    } catch (err) {
       setError('An error occurred');
    }

    setIsSubmitting(false);
  };

  const handleAddParticipant = async () => {
    if (!newParticipantId) return;
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
       const res = await fetch(`/api/cases/${caseDoc._id}/participants`, {
          method: 'POST',
          body: JSON.stringify({ accountId: newParticipantId }),
          headers: { 'Content-Type': 'application/json' }
       });
       const data = await res.json();
       if (res.ok) {
          setSuccessMessage(`Participant added successfully.`);
          setNewParticipantId('');
          router.refresh();
       } else {
          setError(data.error || 'Failed to add participant');
       }
    } catch (err) {
       setError('An error occurred');
    }

    setIsSubmitting(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsCommenting(true);
    const res = await addComment(caseDoc._id.toString(), commentText);
    if (res.success) {
      setCommentText('');
      router.refresh();
    } else {
      setError(res.message);
    }
    setIsCommenting(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto overflow-hidden">
      <header className="flex items-center gap-4">
        <Link
          href="/portal/employee/case-management"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <span className="material-icons-outlined block">arrow_back</span>
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Case Workspace</h2>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800">
          {successMessage}
        </div>
      )}

      <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl shadow-soft">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{caseDoc.businessName || caseDoc.contactName || 'Unnamed Case'}</h1>
            {caseDoc.businessName && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="material-icons-outlined text-sm">person</span>
                {caseDoc.contactName}
              </p>
            )}
            {caseDoc.email && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <span className="material-icons-outlined text-sm">email</span>
                <a href={`mailto:${caseDoc.email}`} className="hover:text-brand-primary transition-colors">{caseDoc.email}</a>
              </p>
            )}
            {caseDoc.phone && (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <span className="material-icons-outlined text-sm">phone</span>
                <a href={`tel:${caseDoc.phone}`} className="hover:text-brand-primary transition-colors">{caseDoc.phone}</a>
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Status</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
              ${status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
              ${status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
              ${status === 'needs_assistance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
              ${status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' : ''}
            `}>
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Deal Information</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Service Interest</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{(caseDoc.serviceInterest || 'N/A').replace('_', ' ')}</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                   <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estimated Deal Value</span>
                   {isAdmin && status !== 'closed' ? (
                      <input 
                         type="number"
                         value={dealValue}
                         onChange={(e) => setDealValue(Number(e.target.value))}
                         className="w-full bg-gray-50 dark:bg-[#18181b] p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                   ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{caseDoc.dealValue ? `$${caseDoc.dealValue.toLocaleString()}` : 'TBD'}</span>
                   )}
                </div>
                {isAdmin && status !== 'closed' && (
                   <button 
                      onClick={handleDealValueUpdate}
                      disabled={isSubmitting}
                      className="bg-brand-primary text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-brand-secondary"
                   >
                      Update
                   </button>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Case Team</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Owner</span>
                <span className="font-medium text-gray-900 dark:text-white">{caseDoc.ownerId?.fullName} ({caseDoc.ownerId?.email})</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Commission Participants</span>
                <div className="flex flex-col gap-1 mt-1">
                   {caseDoc.participants?.map((p: any) => (
                      <span key={p._id} className="text-sm bg-gray-50 dark:bg-[#18181b] px-2 py-1 rounded inline-block w-fit text-gray-800 dark:text-gray-200">{p.fullName}</span>
                   ))}
                </div>
              </div>
              {isAdmin && status !== 'closed' && (
                 <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Add Participant</span>
                    <div className="flex gap-2">
                       <select 
                          value={newParticipantId}
                          onChange={(e) => setNewParticipantId(e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm p-2"
                       >
                          <option value="">Select account...</option>
                          {allAccounts.filter(a => !caseDoc.participants.some((p: any) => p._id === a._id)).map(acc => (
                             <option key={acc._id} value={acc._id}>{acc.fullName} ({acc.roles.join(', ')})</option>
                          ))}
                       </select>
                       <button onClick={handleAddParticipant} disabled={isSubmitting || !newParticipantId} className="bg-[#2F2F2F] text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50">Add</button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Knowledge Base Integration */}
        {isAdminOrEmployee && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8 mt-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-primary text-sm">library_books</span>
              Support Resources
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">
                Find relevant scripts, objection handling guides, or playbooks for this case type ({caseDoc.serviceInterest}).
            </p>
            <div className="flex items-center gap-3">
                <Link 
                    href={`/portal/employee/knowledge-base?search=${caseDoc.serviceInterest?.replace('_', ' ')}`} 
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-sm font-medium transition-colors border border-blue-100 dark:border-blue-800"
                >
                    <span className="material-icons-outlined text-lg">search</span>
                    Search related playbooks
                </Link>
                <Link 
                    href="/portal/employee/knowledge-base" 
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700"
                >
                    Open Knowledge Base
                    <span className="material-icons-outlined text-sm">open_in_new</span>
                </Link>
            </div>
          </div>
        )}

        {status !== 'closed' && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {isAdmin && status !== 'active' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange('active')}
                  className="px-6 py-3 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Mark as Active
                </button>
              )}
              {isAdmin && (
                <button
                  disabled={isSubmitting || !caseDoc.dealValue}
                  onClick={() => handleStatusChange('closed')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all text-white ${caseDoc.dealValue ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600/50 cursor-not-allowed'}`}
                  title={!caseDoc.dealValue ? 'Requires a deal value greater than 0' : ''}
                >
                  Close Case (Issue Commission)
                </button>
              )}
              {!isAdmin && status !== 'needs_assistance' && (
                 <button
                 disabled={isSubmitting}
                 onClick={() => handleStatusChange('needs_assistance')}
                 className="px-6 py-3 rounded-xl font-medium transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400"
               >
                 Request Assistance
               </button>
              )}
            </div>
            {isAdmin && !caseDoc.dealValue && (
                <p className="mt-2 text-xs text-red-500">You must set a deal value before closing this case.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-12">
        {/* Comments Section */}
        <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl shadow-soft flex flex-col h-[500px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Comments Thread</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No comments yet.</p>
            ) : (
             comments.map((comment, idx) => (
               <div key={idx} className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shrink-0 overflow-hidden">
                   {comment.authorAccountId?.profileImageUrl ? (
                     <Image src={comment.authorAccountId.profileImageUrl} alt="PFP" width={32} height={32} className="w-full h-full object-cover" />
                   ) : (
                     comment.authorAccountId?.roles?.[0]?.[0]?.toUpperCase() || 'U'
                   )}
                 </div>
                 <div className="bg-gray-50 dark:bg-[#18181b] p-3 rounded-xl rounded-tl-none border border-gray-100 dark:border-gray-800 w-full">
                   <div className="flex justify-between items-start mb-1 gap-2">
                     <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{comment.authorAccountId?.roles?.join(', ')}</span>
                     <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                   </div>
                   <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{comment.message}</p>
                 </div>
               </div>
             ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] px-4 py-2 text-sm focus:border-brand-primary outline-none"
              disabled={isCommenting}
            />
            <button 
              type="submit" 
              disabled={isCommenting || !commentText.trim()}
              className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Post
            </button>
          </form>
        </div>

        {/* Activity Log Section */}
        <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl shadow-soft flex flex-col h-[500px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Activity Log</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {initialLogs.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No activity logs recorded.</p>
            ) : (
              initialLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== initialLogs.length - 1 && (
                    <div className="absolute top-8 left-4 w-px h-full bg-gray-200 dark:bg-gray-700 -z-10"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#27272a] text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 z-10">
                    <span className="material-icons-outlined text-[16px]">
                      {log.actionType === 'status_changed' ? 'sync_alt' : log.actionType === 'participant_added' ? 'person_add' : 'edit_note'}
                    </span>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold capitalize text-brand-primary mr-1">[{log.actorAccountId?.roles?.join(', ')}]</span>
                      {log.actionType.replace('_', ' ')}
                    </p>
                    {(log.previousValue || log.newValue) && (
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-[#18181b] p-2 rounded-lg border border-gray-100 dark:border-gray-800 inline-block">
                         {log.previousValue && <span className="line-through mr-1 opacity-70">{log.previousValue}</span>}
                         {log.previousValue && log.newValue && <span className="material-icons-outlined text-[10px] mx-1 align-middle">arrow_forward</span>}
                         {log.newValue && <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase shrink-0 px-1 py-0.5 rounded bg-white dark:bg-[#27272a] shadow-sm">{log.newValue}</span>}
                       </p>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
