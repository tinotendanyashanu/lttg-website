import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';

const TYPE_ICONS: Record<string, string> = {
  case_update: 'folder_shared',
  new_message: 'chat',
  ticket_response: 'support_agent',
  invoice_alert: 'receipt_long',
  payment_received: 'payments',
  contract_update: 'description',
  system: 'info',
};

const TYPE_COLORS: Record<string, string> = {
  case_update: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  new_message: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  ticket_response: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  invoice_alert: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  payment_received: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  contract_update: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  system: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

async function getNotifications(clientId: string) {
  try {
    await dbConnect();
    const { ClientNotification } = await import('@/models/ClientNotification');
    const notifs = await ClientNotification.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    // Mark all as read
    await ClientNotification.updateMany({ clientId, read: false }, { $set: { read: true } });
    return JSON.parse(JSON.stringify(notifs));
  } catch (_) {
    return [];
  }
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const notifs = await getNotifications(session.user.id);
  const unread = notifs.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-4 max-w-2xl">
      {unread > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {unread} unread notification{unread !== 1 ? 's' : ''}
        </p>
      )}

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        {notifs.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
              notifications_none
            </span>
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {notifs.map((notif: any) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                  !notif.read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    TYPE_COLORS[notif.type] || TYPE_COLORS.system
                  }`}
                >
                  <span className="material-icons-outlined text-[18px]">
                    {TYPE_ICONS[notif.type] || 'info'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-gray-900 dark:text-white ${!notif.read ? 'font-semibold' : ''}`}>
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
