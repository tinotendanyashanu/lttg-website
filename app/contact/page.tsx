import Link from "next/link";
import { ArrowUpRight, CalendarDays, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryForm from "@/components/marketing/InquiryForm";
import { marketingMetadata } from "@/lib/marketing-metadata";
export const metadata = marketingMetadata(
  "Request a Software Project Estimate",
  "Tell Leo about your business problem, project requirements, timeline and budget. Request a scope discussion or book a discovery call.",
  "/contact",
);
export default function Contact() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container">
            <p className="marketing-eyebrow">START WITH THE PROBLEM</p>
            <h1 className="marketing-heading mt-5 !text-[clamp(2.5rem,5vw,4.6rem)]">
              Let’s work out
              <br />
              what to build.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Share the context and what needs to change. I’ll review your
              requirements, clarify the scope and discuss the next steps before
              proposing an estimate.
            </p>
          </div>
        </section>
        <section className="pb-24">
          <div className="marketing-container grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-9">
              <InquiryForm />
            </div>
            <aside>
              <div className="rounded-xl bg-[#101f20] p-7 text-white">
                <CalendarDays className="h-6 w-6 text-emerald-300" />
                <h2 className="mt-5 text-xl font-semibold">
                  Prefer a conversation?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Use the calendar to choose a discovery call time. We’ll
                  discuss the workflow, the intended outcome and a useful next
                  step.
                </p>
                <Link
                  href="/book"
                  className="marketing-button button-mint mt-6"
                >
                  Book a discovery call <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="py-9">
                <h2 className="text-lg font-semibold">
                  What happens after you send?
                </h2>
                <ol className="mt-5 space-y-5 text-sm leading-relaxed text-slate-600">
                  <li>
                    <strong className="text-slate-950">01 · Review.</strong> I
                    read your brief and identify the questions needed to scope
                    the work.
                  </li>
                  <li>
                    <strong className="text-slate-950">02 · Clarify.</strong> We
                    discuss requirements, timing and whether the project is a
                    fit.
                  </li>
                  <li>
                    <strong className="text-slate-950">03 · Propose.</strong>{" "}
                    Where appropriate, I prepare a scope and estimate for you to
                    review.
                  </li>
                </ol>
              </div>
              <a
                href="mailto:contact@leothetechguy.com"
                className="flex items-center gap-2 break-all text-sm font-medium text-emerald-800"
              >
                <Mail className="h-4 w-4 shrink-0" />
                contact@leothetechguy.com
              </a>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-4 w-4" />
                Warsaw, Poland · Working worldwide
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
