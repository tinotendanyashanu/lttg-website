'use client';

import { useState, useTransition } from 'react';
import { Eye, Check, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '@/components/admin/DataTable';
import { updatePartnerStatus, deletePartner } from '@/lib/actions/admin';

interface PartnerRow {
  id: string;
  name: string;
  email: string;
  status: string;
  tier: string;
  revenueFormatted: string;
  createdAtString: string;
  performanceStatus: string;
  isTopPerformer: boolean;
}

function DeleteConfirm({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          Delete <span className="font-semibold text-gray-700 dark:text-gray-300">{name}</span>?
        </span>
        <form
          action={() =>
            startTransition(async () => {
              await deletePartner(id);
            })
          }
        >
          <button
            type="submit"
            disabled={pending}
            className="px-2 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {pending ? '...' : 'Delete'}
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      title="Delete partner"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export default function PartnersClient({ data }: { data: PartnerRow[] }) {
  const columns: Column<PartnerRow>[] = [
    {
      header: 'Partner',
      accessor: (item) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
          <div className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{item.email}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold capitalize border ${
            item.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40'
              : item.status === 'suspended'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40'
          }`}
        >
          {item.status === 'active' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          )}
          {item.status}
        </span>
      ),
    },
    {
      header: 'Tier',
      accessor: (item) => (
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs border border-gray-200 dark:border-gray-700 capitalize font-medium">
          {item.tier}
        </span>
      ),
    },
    {
      header: 'Performance',
      accessor: (item) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
              item.performanceStatus === 'On Track'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                : item.performanceStatus === 'Watchlist'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                : item.performanceStatus === 'At Risk'
                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400'
                : item.performanceStatus === 'Contract Review'
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {item.performanceStatus}
          </span>
          {item.isTopPerformer && (
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <span className="material-icons-outlined text-[10px]">military_tech</span>
              TOP PERFORMER
            </span>
          )}
        </div>
      ),
    },
    { header: 'Revenue', accessor: 'revenueFormatted' },
    { header: 'Joined', accessor: 'createdAtString' },
  ];

  const actions = (item: PartnerRow) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/partners/${item.id}`}
        className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Link>

      {item.status === 'pending' && (
        <form action={updatePartnerStatus.bind(null, item.id, 'active', item.tier)}>
          <button
            type="submit"
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            title="Approve partner"
          >
            <Check className="h-4 w-4" />
          </button>
        </form>
      )}

      {item.status === 'active' && (
        <form action={updatePartnerStatus.bind(null, item.id, 'suspended', item.tier)}>
          <button
            type="submit"
            className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            title="Suspend partner"
          >
            <ShieldOff className="h-4 w-4" />
          </button>
        </form>
      )}

      {item.status === 'suspended' && (
        <form action={updatePartnerStatus.bind(null, item.id, 'active', item.tier)}>
          <button
            type="submit"
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            title="Reinstate partner"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </form>
      )}

      <DeleteConfirm id={item.id} name={item.name} />
    </div>
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKeys={['name', 'email', 'status', 'tier']}
      actions={actions}
    />
  );
}
