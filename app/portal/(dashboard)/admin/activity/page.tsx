import { getAdminActivityLogs } from '@/lib/actions/portal-admin-activity';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Activity Log | Admin Panel',
};

const ACTION_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  case_status_update:        { label: 'Case Status Updated',     icon: 'edit',           color: 'text-blue-500'   },
  case_dealvalue_update:     { label: 'Deal Value Updated',      icon: 'attach_money',   color: 'text-green-500'  },
  case_participants_update:  { label: 'Participants Updated',    icon: 'group',          color: 'text-purple-500' },
  case_closed:               { label: 'Case Closed',             icon: 'check_circle',   color: 'text-green-600'  },
  client_updated:            { label: 'Client Updated',          icon: 'business',       color: 'text-blue-500'   },
  client_archived:           { label: 'Client Archived',         icon: 'archive',        color: 'text-red-500'    },
  commission_paid:           { label: 'Commission Marked Paid',  icon: 'paid',           color: 'text-green-600'  },
  user_updated:              { label: 'User Settings Updated',   icon: 'manage_accounts',color: 'text-purple-500' },
  knowledge_article_created: { label: 'Article Created',         icon: 'add_circle',     color: 'text-green-500'  },
  knowledge_article_updated: { label: 'Article Updated',         icon: 'edit_note',      color: 'text-blue-500'   },
  knowledge_article_deleted: { label: 'Article Deleted',         icon: 'delete',         color: 'text-red-500'    },
  course_created:            { label: 'Course Created',          icon: 'add_circle',     color: 'text-green-500'  },
  course_updated:            { label: 'Course Updated',          icon: 'edit_note',      color: 'text-blue-500'   },
  course_deleted:            { label: 'Course Deleted',          icon: 'delete',         color: 'text-red-500'    },
};

export default async function AdminActivityPage() {
  let logs: any[] = [];

  try {
    const response = await getAdminActivityLogs(200);
    logs = response.logs;
  } catch (error) {
    redirect('/portal');
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="material-icons-outlined text-2xl">history</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log Viewer</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Read-only audit trail of all admin mutations. Showing latest {logs.length} entries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <span className="material-icons-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">history_toggle_off</span>
            <p className="text-gray-500 dark:text-gray-400">No activity logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/20">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {logs.map((log) => {
                  const meta = ACTION_LABEL[log.actionType] ?? {
                    label: log.actionType,
                    icon: 'info',
                    color: 'text-gray-500',
                  };

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`material-icons-outlined text-[20px] ${meta.color}`}>{meta.icon}</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {(log.actorAccountId?.fullName?.[0] || log.actorAccountId?.email?.[0] || 'S').toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {log.actorAccountId?.email || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {log.newValue
                          ? <span title={log.newValue}>{log.newValue}</span>
                          : log.previousValue
                          ? `${log.previousValue} → ?`
                          : <span className="text-gray-300 dark:text-gray-600">—</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
