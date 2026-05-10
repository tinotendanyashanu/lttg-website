import { getAdminDashboardStats } from '@/lib/actions/portal-admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | LeoTech Portal',
};

export default async function AdminDashboardOverviewPage() {
  let stats;
  try {
    const response = await getAdminDashboardStats();
    stats = response.data;
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
              <span className="material-icons-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Aggregated system overview and statistics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Cases', icon: 'folder_shared', href: '/portal/employee/admin/cases' },
          { label: 'Clients', icon: 'business', href: '/portal/employee/admin/clients' },
          { label: 'Commissions', icon: 'monetization_on', href: '/portal/employee/admin/manage-commissions' },
          { label: 'Invoice Approvals', icon: 'approval', href: '/portal/employee/admin/invoices' },
          { label: 'Users', icon: 'people', href: '/portal/employee/admin/users' },
          { label: 'Knowledge Base', icon: 'menu_book', href: '/portal/employee/admin/knowledge' },
          { label: 'Academy', icon: 'school', href: '/portal/employee/admin/academy' },
          { label: 'Announcements', icon: 'campaign', href: '/portal/employee/admin/announcements' },
          { label: 'Sales Quests', icon: 'military_tech', href: '/portal/employee/admin/quests' },
          { label: 'Teams', icon: 'groups', href: '/portal/employee/admin/teams' },
          { label: 'Activity Logs', icon: 'history', href: '/portal/employee/admin/activity' },
        ].map((item, idx) => (
          <Link key={idx} href={item.href} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center gap-2 group">
            <span className="material-icons-outlined text-gray-400 group-hover:text-brand-primary transition-colors text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Stats) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
               <div className="flex items-center justify-between mb-4">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Cases</p>
                 <span className="material-icons-outlined text-blue-500 bg-blue-500/10 p-2 rounded-xl text-sm">folder</span>
               </div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.activeCasesCount || 0}</p>
            </div>

            <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
               <div className="flex items-center justify-between mb-4">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Closed Revenue</p>
                 <span className="material-icons-outlined text-green-500 bg-green-500/10 p-2 rounded-xl text-sm">attach_money</span>
               </div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">${(stats?.totalClosedRevenue || 0).toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-colors" />
               <div className="flex items-center justify-between mb-4">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Commissions</p>
                 <span className="material-icons-outlined text-yellow-500 bg-yellow-500/10 p-2 rounded-xl text-sm">account_balance_wallet</span>
               </div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">${(stats?.pendingCommissionLiability || 0).toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
               <div className="flex items-center justify-between mb-4">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Paid Commissions</p>
                 <span className="material-icons-outlined text-purple-500 bg-purple-500/10 p-2 rounded-xl text-sm">payments</span>
               </div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">${(stats?.totalPaidCommission || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-[#27272a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cases by Status</h3>
                <div className="space-y-3">
                   {Object.entries(stats?.casesByStatus || {}).map(([status, count]: [string, any]) => (
                     <div key={status} className="flex justify-between items-center text-sm">
                       <span className="text-gray-500 dark:text-gray-400 capitalize flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${status === 'closed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                         {status.replace('_', ' ')}
                       </span>
                       <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white dark:bg-[#27272a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Demographics</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Total Active Users</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{stats?.totalActiveUsers || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm pb-2">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                         <span className="material-icons-outlined text-[16px]">school</span>
                         Interns
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{stats?.internCount || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm pb-2">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                         <span className="material-icons-outlined text-[16px]">badge</span>
                         Employees
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{stats?.employeeCount || 0}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column (Activity Feed) */}
        <div className="bg-white dark:bg-[#27272a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 overflow-hidden flex flex-col h-full">
           <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
             <span className="material-icons-outlined text-brand-primary">history</span>
             Recent System Activity
           </h3>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-6">
             {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
               <div className="text-center py-8">
                 <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">inbox</span>
                 <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
               </div>
             ) : (
               stats.recentActivity.map((log: any) => (
                 <div key={log._id} className="flex gap-4 group">
                    <div className="relative flex flex-col items-center">
                       <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center shrink-0 z-10 border border-white dark:border-[#27272a]">
                         <span className="material-icons-outlined text-[16px]">bolt</span>
                       </div>
                       <div className="w-px h-full bg-gray-100 dark:bg-gray-800 absolute top-8 group-last:hidden" />
                    </div>
                    <div className="pt-1.5 pb-2">
                       <p className="text-sm text-gray-900 dark:text-white leading-tight">
                          <span className="font-medium">{log.actorAccountId?.fullName || 'System'}</span>
                          {' '} performed {' '}
                          <span className="font-medium">{log.actionType.replace(/_/g, ' ')}</span>
                       </p>
                       <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                          {new Date(log.createdAt).toLocaleString()}
                       </span>
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
