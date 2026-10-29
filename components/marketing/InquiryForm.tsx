"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { businessServices } from "@/data/business-services";

type Attribution = {
  source: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
};
export default function InquiryForm({
  mode = "estimate",
}: {
  mode?: "estimate" | "discovery";
}) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [context, setContext] = useState("");
  const [project, setProject] = useState("");
  const attribution = useRef<Attribution>({
    source: mode === "discovery" ? "discovery-request" : "estimate-form",
  });
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const service = businessServices.find(
      (item) => item.id === query.get("service"),
    );
    if (service) setProject(service.title);
    const related = query.get("project")?.slice(0, 120);
    if (related)
      setContext(
        `I’d like to discuss a project similar to ${related}.\n\nThe business problem is: `,
      );
    attribution.current.source =
      query.get("source") === "case-study"
        ? "case-study"
        : attribution.current.source;
  }, []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (state === "success") successRef.current?.focus();
  }, [state]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setState("loading");
    setError("");
    try {
      let metadata: Attribution = { source: attribution.current.source };
      try {
        if (localStorage.getItem("cookie_consent") === "true")
          metadata = {
            ...JSON.parse(
              sessionStorage.getItem("inquiry_attribution") || "{}",
            ),
            source: metadata.source,
          };
      } catch {
        /* Inquiry submission works without browser storage. */
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(values),
          consent: values.get("consent") === "on",
          ...metadata,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success)
        throw new Error(
          result?.message ||
            "Your request could not be saved. Please try again or email contact@leothetechguy.com.",
        );
      setState("success");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Please try again or email contact@leothetechguy.com.",
      );
      setState("idle");
    }
  }
  if (state === "success")
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-8"
      >
        <CheckCircle2 className="h-9 w-9 text-emerald-700" />
        <h2 className="mt-6 text-2xl font-semibold text-slate-950">
          Your request is saved.
        </h2>
        <p className="mt-4 leading-relaxed text-slate-600">
          Leo will review the business problem, scope and timing, then follow up
          by email with questions or next steps. A project estimate follows that
          review; submitting this form does not book a call.
        </p>
        <Link href="/book" className="marketing-button button-dark mt-7">
          Choose a discovery call time <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="space-y-6"
      aria-busy={state === "loading"}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {mode === "discovery"
            ? "Request an alternative time"
            : "Tell me what needs to work better."}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Name, email and a short description are enough to start. Company
          details, timeline and budget are optional.
        </p>
      </div>
      {error && (
        <div
          tabIndex={-1}
          ref={errorRef}
          role="alert"
          className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="marketing-label" htmlFor="inquiry-name">
            Your name *
          </label>
          <input
            className="marketing-input"
            id="inquiry-name"
            name="name"
            autoComplete="name"
            required
            maxLength={60}
          />
        </div>
        <div>
          <label className="marketing-label" htmlFor="inquiry-email">
            Email *
          </label>
          <input
            className="marketing-input"
            id="inquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="marketing-label" htmlFor="inquiry-company">
            Company{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            className="marketing-input"
            id="inquiry-company"
            name="company"
            autoComplete="organization"
            maxLength={120}
          />
        </div>
        <div>
          <label className="marketing-label" htmlFor="inquiry-company-website">
            Company website{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            className="marketing-input"
            id="inquiry-company-website"
            name="companyWebsite"
            type="url"
            placeholder="https://yourcompany.com"
            maxLength={500}
          />
        </div>
      </div>
      <div>
        <label className="marketing-label" htmlFor="inquiry-project">
          What can I help with?
        </label>
        <select
          className="marketing-input"
          name="project"
          id="inquiry-project"
          value={project}
          onChange={(event) => setProject(event.target.value)}
        >
          <option value="">Help me work out the scope</option>
          {businessServices.map((service) => (
            <option key={service.id} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="Another business software project">
            Another business software project
          </option>
        </select>
      </div>
      <div>
        <label className="marketing-label" htmlFor="inquiry-message">
          {mode === "discovery"
            ? "Your business problem and preferred availability *"
            : "What is the business problem? *"}
        </label>
        <textarea
          className="marketing-input min-h-36"
          id="inquiry-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="What does your team do today, and what would you like to improve?"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="marketing-label" htmlFor="inquiry-timeline">
            Desired timeline{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select
            className="marketing-input"
            id="inquiry-timeline"
            name="timeline"
          >
            <option value="">Not sure yet</option>
            <option>As soon as practical</option>
            <option>Within 1–3 months</option>
            <option>Within 3–6 months</option>
            <option>Planning ahead</option>
          </select>
        </div>
        <div>
          <label className="marketing-label" htmlFor="inquiry-budget">
            Indicative budget{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <select className="marketing-input" id="inquiry-budget" name="budget">
            <option value="">I’d like guidance</option>
            <option>Under €5,000</option>
            <option>€5,000–€15,000</option>
            <option>€15,000–€40,000</option>
            <option>€40,000+</option>
          </select>
        </div>
      </div>
      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="inquiry-fax">Leave this field empty</label>
        <input
          type="text"
          id="inquiry-fax"
          name="faxNumber"
          autoComplete="off"
          tabIndex={-1}
        />
      </div>
      <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-600">
        <input
          className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
          type="checkbox"
          name="consent"
          required
        />
        <span>
          I agree that LeoTheTechGuy may use these details to respond to my
          inquiry, as described in the{" "}
          <Link
            className="font-semibold text-emerald-800 underline underline-offset-2"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          . *
        </span>
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="marketing-button button-dark w-full disabled:cursor-wait disabled:opacity-60"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving your request…
          </>
        ) : (
          <>
            {mode === "discovery"
              ? "Request a discovery call"
              : "Send project brief"}
            <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-xs leading-relaxed text-slate-500">
        Your details are used for this conversation. No newsletter signup.
        Please leave out passwords and confidential customer information.
      </p>
    </form>
  );
}
