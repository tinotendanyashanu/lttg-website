import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export default function EngagementCTA() {
  return (
    <section className="marketing-cta">
      <div className="marketing-container grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="marketing-eyebrow text-emerald-300">
            LET’S TALK ABOUT YOUR BUSINESS
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            What would work better
            <br className="hidden sm:block" /> with the right software?
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-slate-300">
            Bring the problem. We’ll explore what to build, what to connect and
            where to start.
          </p>
        </div>
        <div className="grid gap-4">
          <Link href="/book" className="cta-option">
            <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
            <span>
              <strong>Book a discovery call</strong>
              <span>
                A focused conversation about your workflow and next steps.
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-5 w-5 shrink-0" />
          </Link>
          <Link href="/contact" className="cta-option">
            <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
            <span>
              <strong>Request a project estimate</strong>
              <span>
                Share the context, timeline and budget you have in mind.
              </span>
            </span>
            <ArrowUpRight className="ml-auto h-5 w-5 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
