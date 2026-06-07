import Link from 'next/link';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import TicketActionPanel from '@/app/admin/tickets/[ticketId]/TicketActionPanel';
import MessageAttachments from '@/components/support/MessageAttachments';
import AgentWorkupPanel from '@/components/support/AgentWorkupPanel';
import ProjectMilestonesPanel from '@/components/support/ProjectMilestonesPanel';
import { formatDueIn } from '@/lib/services/support-sla';
import { categoryLabel, channelLabel, channelIcon } from '@/lib/support/constants';

const STATUS_STYLES: Record<string, string> = {
  new:            'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/40',
  open:           'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  in_progress:    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/40',
  waiting_client: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  escalated:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  resolved:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  closed:         'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  medium:   'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40',
  high:     'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/40',
  urgent:   'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  critical: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50',
};

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  neutral:  'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  negative: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

const SLA_STATE_STYLES: Record<string, string> = {
  breached: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',
  due_soon: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',
  ok:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40',
  met:      'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
};

interface SlaEval {
  firstResponseState: string;
  resolutionState: string;
  firstResponseDueInMs: number | null;
  resolutionDueInMs: number | null;
}

interface Props {
  ticketId: string;
  ticket: any;
  client: any;
  project: any;
  staff: { _id: string; fullName: string }[];
  sla: SlaEval;
  backHref: string;
  backLabel: string;
  knowledgeHref?: string;
  clientLinks?: { label: string; href: string; external?: boolean }[];
}

/**
 * Shared support-ticket detail view, rendered by both the admin ticket page and
 * the employee support inbox so the staff experience stays identical. The
 * caller supplies already-serialized data plus an evaluated SLA; only the
 * back-link and knowledge-base link differ between surfaces.
 */
export default function TicketDetailView({
  ticketId,
  ticket,
  client,
  project,
  staff,
  sla,
  backHref,
  backLabel,
  knowledgeHref = '/admin/knowledge',
  clientLinks,
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
      >
        <span className="material-icons-outlined text-[16px]">arrow_back</span>
        {backLabel}
      </Link>

      <AdminPageBanner
        icon="support_agent"
        title={`Ticket ${ticket.ticketId || ticketId.slice(-8).toUpperCase()}`}
        description={`${client?.fullName || 'Unknown Client'} · ${ticket.subject}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket Header */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.subject}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {ticket.ticketId} · {ticket.category?.replace(/_/g, ' ') || 'General'} · Created{' '}
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {ticket.channel && ticket.channel !== 'web' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <span className="material-icons-outlined text-[13px]">{channelIcon(ticket.channel)}</span>
                    {channelLabel(ticket.channel)}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES['medium']}`}>
                  {ticket.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES['open']}`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Client Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* AI Summary + triage */}
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-icons-outlined text-[16px] text-brand-primary">auto_awesome</span>
                AI Summary &amp; Triage
              </h3>
              {ticket.aiSentiment && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${SENTIMENT_STYLES[ticket.aiSentiment] || SENTIMENT_STYLES.neutral}`}>
                  {ticket.aiSentiment} sentiment
                </span>
              )}
            </div>
            {ticket.aiProcessingStatus === 'pending' && !ticket.aiSummary ? (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                AI triage in progress…
              </p>
            ) : ticket.aiSummary ? (
              <>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{ticket.aiSummary}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {ticket.aiSuggestedCategory && (
                    <span className="bg-gray-50 dark:bg-gray-800/50 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300">
                      Suggested category: <strong>{categoryLabel(ticket.aiSuggestedCategory)}</strong>
                    </span>
                  )}
                  {ticket.aiSuggestedPriority && (
                    <span className="bg-gray-50 dark:bg-gray-800/50 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300 capitalize">
                      Suggested priority: <strong>{ticket.aiSuggestedPriority}</strong>
                    </span>
                  )}
                  {ticket.aiSuggestedTeam && (
                    <span className="bg-gray-50 dark:bg-gray-800/50 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300">
                      Suggested team: <strong>{ticket.aiSuggestedTeam}</strong>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No AI summary available. Use “Reprocess with AI” in the panel.</p>
            )}

            {ticket.aiSuggestedArticles && ticket.aiSuggestedArticles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Suggested Knowledge Articles</p>
                <ul className="space-y-1.5">
                  {ticket.aiSuggestedArticles.map((art: any, i: number) => (
                    <li key={i}>
                      <Link href={knowledgeHref} className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline">
                        <span className="material-icons-outlined text-[14px]">menu_book</span>
                        {art.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Conversation */}
          {ticket.messages && ticket.messages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Conversation ({ticket.messages.length})</h3>
              {ticket.messages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`rounded-2xl p-5 ${
                    msg.senderRole === 'client'
                      ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 ml-8'
                      : 'bg-white dark:bg-[#27272a] border border-gray-100 dark:border-gray-800 shadow-soft mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${msg.senderRole === 'client' ? 'text-blue-600 dark:text-blue-400' : 'text-brand-primary'}`}>
                      {msg.senderRole === 'client' ? (client?.fullName || 'Client') : (msg.senderName || 'LeoTheTechGuy Team')}
                      {msg.senderRole !== 'client' && (
                        <span className="ml-2 text-[10px] bg-brand-primary/10 text-brand-primary rounded-md px-1.5 py-0.5 font-semibold">TEAM</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <MessageAttachments attachments={msg.attachments} />
                </div>
              ))}
            </div>
          )}

          {ticket.internalNotes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-5">
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-icons-outlined text-[14px]">lock</span>
                Internal Notes (not visible to client)
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed whitespace-pre-wrap">{ticket.internalNotes}</p>
            </div>
          )}

          {(ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="material-icons-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Ticket {ticket.status} on{' '}
                {new Date(ticket.resolvedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}

          {ticket.activity && ticket.activity.length > 0 && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Activity History</h3>
              <ol className="relative border-l border-gray-100 dark:border-gray-800 ml-2 space-y-4">
                {[...ticket.activity].reverse().map((a: any, i: number) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-brand-primary/30 border-2 border-brand-primary" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.detail || a.type}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {a.actor ? `${a.actor} · ` : ''}
                      {a.actorRole ? `${a.actorRole} · ` : ''}
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">SLA Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">First response</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${SLA_STATE_STYLES[sla.firstResponseState]}`}>
                  {sla.firstResponseState === 'met' ? 'Met' : formatDueIn(sla.firstResponseDueInMs)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Resolution</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${SLA_STATE_STYLES[sla.resolutionState]}`}>
                  {sla.resolutionState === 'met' ? 'Met' : formatDueIn(sla.resolutionDueInMs)}
                </span>
              </div>
            </div>
          </div>

          <TicketActionPanel
            ticketId={ticketId}
            currentStatus={ticket.status}
            ticketRef={ticket.ticketId || ticketId.slice(-8).toUpperCase()}
            currentCategory={ticket.category}
            currentPriority={ticket.priority}
            currentTeam={ticket.assignedTeam}
            ai={{
              summary: ticket.aiSummary,
              sentiment: ticket.aiSentiment,
              suggestedCategory: ticket.aiSuggestedCategory,
              suggestedCategoryLabel: ticket.aiSuggestedCategory ? categoryLabel(ticket.aiSuggestedCategory) : undefined,
              suggestedPriority: ticket.aiSuggestedPriority,
              suggestedTeam: ticket.aiSuggestedTeam,
              processingStatus: ticket.aiProcessingStatus,
            }}
            staff={staff}
          />

          <AgentWorkupPanel ticketId={ticketId} workup={ticket.aiAgentWorkup} />

          {project && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">Linked Project</h3>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{project.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {project.caseNumber} · <span className="capitalize">{project.status?.replace(/_/g, ' ')}</span>
                  {project.assignedTeam ? ` · ${project.assignedTeam}` : ''}
                </p>
              </div>
            </div>
          )}

          {project && (
            <ProjectMilestonesPanel
              caseId={String(project._id)}
              ticketId={ticketId}
              milestones={project.milestones || []}
              editable
            />
          )}

          {!client && ticket.channel && ticket.channel !== 'web' && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">Channel Contact</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <span className="material-icons-outlined text-[18px]">{channelIcon(ticket.channel)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {ticket.channelContact?.displayName || ticket.channelContact?.handle || 'Unknown contact'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {channelLabel(ticket.channel)}
                    {ticket.channelContact?.handle ? ` · ${ticket.channelContact.handle}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {client && (
            <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                  {(client.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.fullName}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </div>
              </div>
              {client.clientProfile?.companyName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Company:</span> {client.clientProfile.companyName}
                </p>
              )}
              {clientLinks && clientLinks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  {clientLinks.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      {...(l.external ? { target: '_blank' } : {})}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      {l.label}
                      {l.external && <span className="material-icons-outlined text-[11px]">open_in_new</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Details</h3>
            <dl className="space-y-2">
              {[
                { label: 'Ticket ID', value: ticket.ticketId },
                { label: 'Priority', value: ticket.priority },
                { label: 'Category', value: ticket.category || 'General' },
                { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString() },
                { label: 'Last Updated', value: new Date(ticket.updatedAt).toLocaleDateString() },
                { label: 'Messages', value: String(ticket.messages?.length || 0) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <dt className="text-xs text-gray-400">{item.label}</dt>
                  <dd className="text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
