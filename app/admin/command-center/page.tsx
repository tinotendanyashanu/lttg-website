import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { buildExecSummary } from '@/lib/services/executive-intelligence';

export const metadata = { title: 'Command Center | Admin' };
export const dynamic = 'force-dynamic';

function KpiCard({
  icon,
  tone,
  value,
  label,
  hint,
}: {
  icon: string;
  tone: string;
  value: string | number;
  label: string;
  hint?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
      <div className="flex items-center gap-3">
        <span className={`material-icons-outlined text-2xl ${tone}`}>{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-2">{hint}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">{title}</h2>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-6 text-right">{value}</span>
    </div>
  );
}

export default async function CommandCenterPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/admin');

  let data;
  try {
    data = await buildExecSummary(7);
  } catch {
    return (
      <div className="space-y-6">
        <AdminPageBanner
          icon="rocket_launch"
          title="Command Center"
          description="Executive AI business overview — revenue, leads, projects, support, and AI health."
        />
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-12 text-center text-sm text-gray-500">
          Unable to load Command Center data. Check database connectivity.
        </div>
      </div>
    );
  }

  const { revenue, leads, projects, support, knowledge, narrative } = data;
  const msLabel =
    projects.milestonesTotal > 0
      ? `${projects.milestonesDone}/${projects.milestonesTotal} done`
      : 'No milestones';
  const msPct =
    projects.milestonesTotal > 0
      ? Math.round((projects.milestonesDone / projects.milestonesTotal) * 100)
      : 0;
  const sourceMax = Math.max(1, ...leads.bySource.map((s) => s.count));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="rocket_launch"
        title="Command Center"
        description="Executive AI business overview — last 7 days."
      />

      {/* AI Narrative */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
        <div className="flex items-start gap-3">
          <span className="material-icons-outlined text-brand-primary text-xl mt-0.5">neurology</span>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">AI Executive Summary</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{narrative}</p>
          </div>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="space-y-3">
        <SectionHeader title="Revenue" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon="payments"
            tone="text-emerald-500"
            value={`$${Math.round(revenue.collectedInWindow).toLocaleString()}`}
            label="Collected (USD)"
            hint="Last 7 days"
          />
          <KpiCard
            icon="account_balance_wallet"
            tone="text-amber-500"
            value={`$${Math.round(revenue.outstanding).toLocaleString()}`}
            label="Outstanding (USD)"
          />
          <KpiCard
            icon="receipt_long"
            tone="text-blue-500"
            value={revenue.invoicesPaid}
            label="Invoices Paid"
          />
          <KpiCard
            icon="warning_amber"
            tone={revenue.invoicesOverdue > 0 ? 'text-red-500' : 'text-gray-400'}
            value={revenue.invoicesOverdue}
            label="Overdue Invoices"
          />
        </div>
      </div>

      {/* Leads & Conversion */}
      <div className="space-y-3">
        <SectionHeader title="Leads & Conversion" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="person_add" tone="text-blue-500" value={leads.newInWindow} label="New Leads" />
          <KpiCard icon="verified_user" tone="text-emerald-500" value={leads.qualified} label="Qualified" />
          <KpiCard
            icon="trending_up"
            tone={leads.conversionRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}
            value={`${leads.conversionRate}%`}
            label="Conversion Rate"
          />
          <KpiCard icon="chat_bubble" tone="text-purple-500" value={leads.chatSessions} label="Chat Sessions" hint={`${leads.chatConverted} converted`} />
        </div>

        {leads.bySource.length > 0 && (
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Lead Sources</p>
            <div className="space-y-3">
              {leads.bySource.map((s) => (
                <BarRow
                  key={s.source}
                  label={s.source.replace(/_/g, ' ')}
                  value={s.count}
                  max={sourceMax}
                  color="bg-blue-400"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-3">
        <SectionHeader title="Projects" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="folder_shared" tone="text-blue-500" value={projects.active} label="Active Projects" />
          <KpiCard icon="check_circle" tone="text-emerald-500" value={projects.completedInWindow} label="Completed (7d)" />
          <KpiCard icon="flag" tone="text-purple-500" value={msLabel} label="Milestone Progress" />
          <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Overall milestone completion</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{msPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-2 rounded-full ${msPct >= 75 ? 'bg-emerald-400' : msPct >= 40 ? 'bg-amber-400' : 'bg-blue-400'}`}
                style={{ width: `${msPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="space-y-3">
        <SectionHeader title="Support" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon="support_agent" tone="text-blue-500" value={support.openTickets} label="Open Tickets" />
          <KpiCard icon="done_all" tone="text-emerald-500" value={support.resolvedInWindow} label="Resolved (7d)" />
          <KpiCard
            icon="timer"
            tone={support.slaBreaches > 0 ? 'text-red-500' : 'text-emerald-500'}
            value={support.slaBreaches}
            label="SLA Breaches"
          />
          <KpiCard
            icon="favorite"
            tone={support.atRiskCustomers > 0 ? 'text-red-500' : 'text-gray-400'}
            value={support.atRiskCustomers}
            label="At-Risk Customers"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/support/health"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">open_in_new</span>
            Customer Health
          </Link>
          <Link
            href="/admin/support/insights"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">open_in_new</span>
            Support Insights
          </Link>
          <Link
            href="/admin/tickets"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">open_in_new</span>
            All Tickets
          </Link>
        </div>
      </div>

      {/* AI & Knowledge */}
      <div className="space-y-3">
        <SectionHeader title="AI & Knowledge" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon="menu_book"
            tone="text-blue-500"
            value={knowledge.publishedArticles}
            label="Published Articles"
          />
          <KpiCard
            icon="auto_awesome"
            tone={knowledge.aiDraftedPending > 0 ? 'text-amber-500' : 'text-gray-400'}
            value={knowledge.aiDraftedPending}
            label="AI Drafts Pending"
            hint="Awaiting admin review"
          />
          <KpiCard
            icon="psychology"
            tone={knowledge.successRate >= 70 ? 'text-emerald-500' : 'text-amber-500'}
            value={`${knowledge.successRate}%`}
            label="Retrieval Success"
          />
          <KpiCard
            icon="escalator_warning"
            tone={knowledge.retrievalEscalated > 0 ? 'text-red-500' : 'text-gray-400'}
            value={knowledge.retrievalEscalated}
            label="Escalated (Low Conf.)"
            hint={`of ${knowledge.retrievalTotal} retrievals`}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/ai-knowledge"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">open_in_new</span>
            AI & Knowledge Dashboard
          </Link>
          <Link
            href="/admin/knowledge"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
          >
            <span className="material-icons-outlined text-[14px]">open_in_new</span>
            Review KB Drafts
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-right">
        Last refreshed {new Date(data.generatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
