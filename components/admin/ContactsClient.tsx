"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  project: string;
  budget: string;
  timeline: string;
  createdAtString: string;
  message?: string;
  company?: string;
  status?: string;
  source?: string;
}

export default function ContactsClient({ data }: { data: ContactRow[] }) {
  const columns: Column<ContactRow>[] = [
    {
      header: "Name",
      accessor: (item: ContactRow) => (
        <div>
          <div className="font-medium text-slate-900">{item.name}</div>
          <div className="text-slate-400 text-xs">{item.email}</div>
          {item.company && (
            <div className="mt-1 text-xs text-slate-500">{item.company}</div>
          )}
        </div>
      ),
    },
    {
      header: "Project Type",
      accessor: "project",
    },
    {
      header: "Budget",
      accessor: (item: ContactRow) => (
        <span className="text-slate-600 text-sm">{item.budget || "-"}</span>
      ),
    },
    {
      header: "Timeline",
      accessor: (item: ContactRow) => (
        <span className="text-slate-600 text-sm">{item.timeline || "-"}</span>
      ),
    },
    {
      header: "Status",
      accessor: (item: ContactRow) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700">
          {item.status || "new"}
        </span>
      ),
    },
    {
      header: "Source",
      accessor: (item: ContactRow) => (
        <span className="text-xs text-slate-500">
          {item.source || "Legacy form"}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessor: "createdAtString",
    },
  ];

  const actions = (item: ContactRow) => (
    <div className="flex items-center justify-end space-x-2">
      <Link
        href={`/admin/contacts/${item.id}`}
        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      searchKeys={["name", "email", "project", "message", "company", "status"]}
      actions={actions}
    />
  );
}
