"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { CalendarDays, ArrowUpRight } from "lucide-react";
export default function BookingCalendar() {
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (!opened) return;
    getCalApi({ namespace: "discovery" })
      .then((cal) => {
        cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
      })
      .catch(() => {});
  }, [opened]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-9">
      {!opened ? (
        <div className="py-12 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-emerald-700" />
          <h2 className="mt-6 text-2xl font-semibold text-slate-950">
            Find a time that works.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600">
            The calendar is provided by Cal.com. Open it here or use the direct
            link below to view availability.
          </p>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="marketing-button button-dark mt-7"
          >
            Show available times <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="min-h-[680px]">
          <Cal
            namespace="discovery"
            calLink="leothetechguy/secret"
            style={{ width: "100%", height: "100%", overflow: "auto" }}
            config={{ layout: "month_view" }}
          />
        </div>
      )}
      <p className="mt-5 text-center text-sm text-slate-600">
        Calendar not loading?{" "}
        <a
          className="font-semibold text-emerald-800 underline underline-offset-4"
          href="https://cal.com/leothetechguy/secret"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Cal.com directly
        </a>
        .
      </p>
    </div>
  );
}
