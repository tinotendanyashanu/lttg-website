'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export interface ClientComboboxOption {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
}

interface ClientComboboxProps {
  clients: ClientComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  accentClassName?: string;
}

export default function ClientCombobox({
  clients,
  value,
  onChange,
  placeholder = 'Select a client...',
  searchPlaceholder = 'Search clients...',
  className = '',
  accentClassName = 'text-brand-primary',
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = clients.find((client) => client._id === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => {
      const label = `${client.fullName || client.name || ''} ${client.email}`.toLowerCase();
      return label.includes(q);
    });
  }, [clients, query]);

  function closeSoon() {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }

  return (
    <div className={`relative ${className}`} onBlur={closeSoon} onFocus={cancelClose}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:border-gray-700 dark:bg-[#27272a] dark:text-white"
      >
        <span className={selected ? 'min-w-0' : 'text-gray-500'}>
          {selected ? (
            <span className="block min-w-0">
              <span className="block truncate font-semibold">{selected.fullName || selected.name || selected.email}</span>
              <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{selected.email}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-[70] mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#27272a]">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-gray-500">No clients found.</p>
            ) : (
              filtered.map((client) => {
                const active = client._id === value;
                return (
                  <button
                    key={client._id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(client._id);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Check className={`h-4 w-4 shrink-0 ${active ? accentClassName : 'text-transparent'}`} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{client.fullName || client.name || client.email}</span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{client.email}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
