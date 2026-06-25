import AdminPageBanner from '@/components/admin/AdminPageBanner';
import { getAISettingsDashboard, updateAISettings } from '@/lib/actions/ai-settings';

export const metadata = { title: 'AI Settings | Admin' };
export const dynamic = 'force-dynamic';

function Field({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string | number; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f23] px-3 py-2 text-sm text-gray-900 dark:text-white"
      />
    </label>
  );
}

function Toggle({ label, name, enabled }: { label: string; name: string; enabled: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2">
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      <input name={name} type="checkbox" defaultChecked={enabled} className="h-4 w-4 accent-brand-primary" />
    </label>
  );
}

export default async function AISettingsPage() {
  const data = await getAISettingsDashboard();
  const { config, metrics, taskKeys, featureKeys } = data;
  const featureLabels: Record<string, string> = {
    rag: 'RAG pipeline',
    ticketTriage: 'Ticket AI triage',
    replyGeneration: 'AI reply generation',
    knowledgeGaps: 'Knowledge gap detection',
    leadQualification: 'Lead qualification',
    quotationGeneration: 'AI quotation generation',
    executiveSummaries: 'Executive summaries',
    employeeAssistant: 'Employee AI assistant',
    whatsappAI: 'WhatsApp AI workflows',
    automationAgents: 'Automation agents',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="settings_suggest"
        title="AI Settings"
        description="Ollama Cloud provider configuration, model routing, health, and AI performance."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-xs text-gray-400">Provider</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{config.provider}</p>
          <p className={config.health.ok ? 'text-xs text-emerald-600 mt-2' : 'text-xs text-red-500 mt-2'}>
            {config.health.ok ? 'Healthy' : config.health.error || 'Unavailable'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-xs text-gray-400">AI calls, 24h</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics.totalCalls}</p>
          <p className="text-xs text-gray-400 mt-2">{metrics.fallbackCalls} fallback events</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-xs text-gray-400">Failure rate</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(metrics.failureRate * 100)}%</p>
          <p className="text-xs text-gray-400 mt-2">{metrics.failedCalls} failures</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-xs text-gray-400">Avg latency</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{metrics.avgLatencyMs}ms</p>
          <p className="text-xs text-gray-400 mt-2">last 24 hours</p>
        </div>
      </div>

      <form action={updateAISettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Provider Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Default provider" name="provider" defaultValue="ollama_cloud" />
            <Field label="Default model" name="defaultModel" defaultValue={config.defaultModel} />
            <Field label="Embedding model" name="embeddingModel" defaultValue={config.embeddingModel} />
            <Field label="Temperature" name="temperature" type="number" defaultValue={config.temperature} />
            <Field label="Max tokens" name="maxTokens" type="number" defaultValue={config.maxTokens} />
            <Field label="Timeout (ms)" name="timeoutMs" type="number" defaultValue={config.timeoutMs} />
            <Field label="Retry count" name="retryCount" type="number" defaultValue={config.retryCount} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Task Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskKeys.map((task) => (
                <Field key={task} label={task.replace(/_/g, ' ')} name={`model_${task}`} defaultValue={config.taskModels[task]} />
              ))}
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
            Save AI settings
          </button>
        </div>

        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Feature Toggles</h2>
          <div className="space-y-2">
            {featureKeys.map((feature) => (
              <Toggle key={feature} label={featureLabels[feature]} name={`feature_${feature}`} enabled={config.featureToggles[feature] !== false} />
            ))}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Calls By Task</h2>
          <div className="space-y-2">
            {metrics.byTask.length ? metrics.byTask.map((row) => (
              <div key={row.task} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-200">{row.task}</span>
                <span className="text-gray-500">{row.count} calls · {row.failures} failed</span>
              </div>
            )) : <p className="text-sm text-gray-400">No AI calls logged yet.</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Recent Failures</h2>
          <div className="space-y-3">
            {metrics.recentFailures.length ? metrics.recentFailures.map((row, index) => (
              <div key={`${row.createdAt}-${index}`} className="text-sm">
                <p className="font-medium text-gray-800 dark:text-gray-100">{row.task} · {row.selectedModel}</p>
                <p className="text-xs text-red-500 truncate">{row.error || 'Unknown error'}</p>
              </div>
            )) : <p className="text-sm text-gray-400">No recent AI failures.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
