"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, CalendarDays, FileText, X } from "lucide-react";
import Link from "next/link";

// Retains the existing entry points on service pages while using the same two
// journeys as the homepage. Booking no longer requires submitting two forms.
export default function StrategySessionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal();
    if (!isOpen && dialog.current?.open) dialog.current?.close();
  }, [isOpen]);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="strategy-title"
      className="engagement-dialog"
    >
      <div className="relative p-7 sm:p-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-3 text-slate-600 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="marketing-eyebrow">LET’S FIND THE NEXT STEP</p>
        <h2
          id="strategy-title"
          className="mt-4 pr-7 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Talk through your project.
        </h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          Choose a conversation or send a written brief. We’ll explore the
          problem, scope and a sensible way forward.
        </p>
        <div className="mt-7 grid gap-4">
          <Link
            onClick={onClose}
            href="/book"
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 text-slate-950 hover:border-emerald-600"
          >
            <CalendarDays className="h-5 w-5 shrink-0 text-emerald-700" />
            <span>
              <strong className="block text-sm">Book a discovery call</strong>
              <span className="mt-1 block text-xs text-slate-600">
                Choose a time to discuss your workflow.
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4" />
          </Link>
          <Link
            onClick={onClose}
            href="/contact"
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 text-slate-950 hover:border-emerald-600"
          >
            <FileText className="h-5 w-5 shrink-0 text-emerald-700" />
            <span>
              <strong className="block text-sm">
                Request a project estimate
              </strong>
              <span className="mt-1 block text-xs text-slate-600">
                Share requirements, timeline and budget.
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4" />
          </Link>
        </div>
      </div>
    </dialog>
  );
}
