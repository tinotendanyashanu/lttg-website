'use client';

import { useState, useMemo } from 'react';

const ENTITY_COLORS: Record<string, string> = {
  invoice:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  client:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  deal:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  partner:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  payout:   'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  ticket:   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  contract: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const PAGE_SIZE = 25;

export default function AuditLogClient({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const entityTypes = useMemo(() => {
    const types = new Set(logs.map((l: any) => l.entityType).filter(Boolean));
    return Array.from(types).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l: any) => {
      if (entityFilter && l.entityType !== entityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (l.action || '').toLowerCase().includes(q) ||
          (l.entityType || '').toLowerCase().includes(q) ||
          (l.performedBy?.name || l.performedBy?.fullName || '').toLowerCase().includes(q) ||
          (l.performedBy?.email || '').toLowerCase().includes(q) ||
          (l.entityId || '').toString().toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, search, entityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-[#27272a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search action, actor, entity ID..."
            value={search}
            onChange={handleFilterChange(setSearch)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <select
          value={entityFilter}
          onChange={handleFilterChange(setEntityFilter)}
          className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none"
        >
          <option value="">All entity types</option>
          {entityTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Time</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
                <th className="px-5 py-3.5 font-semibold">Actor</th>
                <th className="px-5 py-3.5 font-semibold">Entity</th>
                <th className="px-5 py-3.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 dark:text-gray-600">
                    No audit log entries found.
                  </td>
                </tr>
              ) : paginated.map((log: any) => {
                const actor = log.performedBy;
                const entityColor = ENTITY_COLORS[log.entityType] || 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
                const isExpanded = expanded === log._id;
                const hasDetails = log.metadata && Object.keys(log.metadata).length > 0;

                return (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 dark:text-gray-600 whitespace-nowrap text-xs">
                      <div>{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div>{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {actor ? (
                        <>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {actor.fullName || actor.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-600">{actor.email}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-xs">System</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityColor}`}>
                        {log.entityType || 'N/A'}
                      </span>
                      {log.entityId && (
                        <span className="ml-1.5 font-mono text-[11px] text-gray-400 dark:text-gray-600">
                          …{String(log.entityId).slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {hasDetails ? (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : log._id)}
                          className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                        >
                          <span className="material-icons-outlined text-[14px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                      )}
                      {isExpanded && (
                        <pre className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg max-w-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <span className="material-icons-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <span className="material-icons-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
