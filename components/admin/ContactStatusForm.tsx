"use client";
import { useActionState } from "react";
import { updateContactStatus } from "@/lib/actions/admin-contacts";
export default function ContactStatusForm({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(updateContactStatus, {
    error: "",
    success: false,
  });
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label
        htmlFor="contact-status"
        className="block text-sm font-semibold text-slate-900"
      >
        Inquiry status
      </label>
      <select
        id="contact-status"
        name="status"
        defaultValue={status}
        className="w-full rounded-lg border border-slate-300 p-3 text-sm"
      >
        {["new", "contacted", "qualified", "proposal", "won", "closed"].map(
          (value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ),
        )}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update status"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-emerald-700">
          Status updated.
        </p>
      )}
    </form>
  );
}
