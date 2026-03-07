import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SettingsNav } from '@/components/portal/client/SettingsNav';

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const prefs = [
    { key: 'case_updates', label: 'Case Updates', desc: 'Notify me when my case status changes' },
    { key: 'new_messages', label: 'New Messages', desc: 'Notify me when the team sends a message' },
    { key: 'ticket_responses', label: 'Ticket Responses', desc: 'Notify me when a ticket gets a reply' },
    { key: 'invoice_alerts', label: 'Invoice Alerts', desc: 'Notify me about new invoices and due dates' },
    { key: 'payment_receipts', label: 'Payment Receipts', desc: 'Confirm when payments are recorded' },
    { key: 'contract_updates', label: 'Contract Updates', desc: 'Notify me about contract changes' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <SettingsNav current="/portal/client/settings/notifications" />

      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          All portal notifications are shown in your{' '}
          <a href="/portal/client/notifications" className="text-blue-600 dark:text-blue-400 hover:underline">
            notifications inbox
          </a>
          .
        </p>

        <div className="space-y-4">
          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400">
            Notification preferences are saved automatically. Email notifications require a valid email address.
          </p>
        </div>
      </div>
    </div>
  );
}
