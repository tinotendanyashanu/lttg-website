import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata(
  "Meet Leo — Your Software Engineering Partner",
  "Work directly with Leo, a Warsaw-based software builder focused on business operations, web and mobile products, and practical automation.",
  "/about",
);
export default function About() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="marketing-eyebrow">THE PERSON BEHIND THE WORK</p>
              <h1 className="marketing-heading mt-5 !text-[clamp(2.75rem,5vw,4.7rem)]">
                Hi, I’m Leo.
                <br />
                Let’s build something useful.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">
                I’m Tinotenda Nyashanu, the builder behind LeoTheTechGuy. Based
                in Warsaw, I work with business owners and teams to turn
                operational challenges into practical software.
              </p>
              <Link className="marketing-button button-dark mt-8" href="/book">
                Meet on a discovery call <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src="/images/leos-portrait.png"
                alt="Leo, founder of LeoTheTechGuy"
                fill
                sizes="(min-width: 1024px) 384px, 90vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
        <section className="marketing-section border-t border-slate-200 bg-slate-50">
          <div className="marketing-container grid gap-12 lg:grid-cols-2">
            <div>
              <p className="marketing-eyebrow">BUSINESS CONTEXT FIRST</p>
              <h2 className="marketing-heading mt-4">
                Understand the problem.
                <br />
                Then choose the technology.
              </h2>
            </div>
            <div className="space-y-5 leading-relaxed text-slate-600">
              <p>
                My work spans fleet operations, customer bookings, retail tools
                and AI integrations. The common thread is connecting the
                customer experience with the systems and people running the
                business.
              </p>
              <p>
                You work directly with me to define the requirements, review the
                software and plan delivery. Scope, milestones, handover and any
                ongoing support are agreed together.
              </p>
              <p>
                Rather than relying on project counts or headline promises, I
                share the actual workflows and engineering scope behind the
                work.
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 font-semibold text-emerald-800"
              >
                Explore the case studies <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
