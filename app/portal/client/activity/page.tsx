import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const TYPE_LABELS: Record<string, string> = {
  case_update: 'Case Update',
  new_message: 'New Message',
  ticket_response: 'Ticket Response',
  invoice_alert: 'Invoice Alert',
  payment_received: 'Payment',
  contract_update: 'Contract Update',
  system: 'System',
};

const TYPE_COLORS: Record<string, string> = {
  case_update: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  new_message: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  ticket_response: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  invoice_alert: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  payment_received: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  contract_update: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const ICONS: Record<string, string> = {
  case_update: 'folder_shared',
  new_message: 'chat',
  ticket_response: 'support_agent',
  invoice_alert: 'receipt_long',
  payment_received: 'payments',
  contract_update: 'description',
  system: 'info',
};

async function getActivity(clientId: string) {
  try {
    await dbConnect();
    const { ClientNotification } = await import('@/models/ClientNotification');
    const notifications = await ClientNotification.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return JSON.parse(JSON.stringify(notifications));
  } catch (_) {
    return [];
  }
}

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const activities = await getActivity(session.user.id);

  return (
    <div className="space-y-6">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {activities.length} events recorded
      </p>

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {activities.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              timeline
            </span>
            <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
              Your activity log will appear here as you use the portal
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {activities.map((activity: any, index: number) => (
              <div key={activity._id} className="flex gap-4 px-6 py-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      TYPE_COLORS[activity.type] || TYPE_COLORS.system
                    }`}
                  >
                    <span className="material-icons-outlined text-[16px]">
                      {ICONS[activity.type] || 'info'}
                    </span>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-800 mt-2 min-h-[16px]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 ${
                          TYPE_COLORS[activity.type] || TYPE_COLORS.system
                        }`}
                      >
                        {TYPE_LABELS[activity.type] || activity.type}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {activity.message}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-300 dark:text-gray-600">
                        {new Date(activity.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
