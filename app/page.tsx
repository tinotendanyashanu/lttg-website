import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Layers3,
  Workflow,
  CalendarDays,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import CaseStudyCard from "@/components/marketing/CaseStudyCard";
import PrimaryServices from "@/components/marketing/PrimaryServices";
import DeliveryProcess from "@/components/marketing/DeliveryProcess";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import { caseStudies } from "@/data/case-studies";
import { marketingMetadata } from "@/lib/marketing-metadata";
import { marketingImages } from "@/data/marketing-images";

export const metadata = marketingMetadata(
  "Custom Business Software & Automation in Warsaw",
  "Custom software, web and mobile apps, and AI automation for businesses. Based in Warsaw, working worldwide. Explore Drago, Maran and Swipee.",
  "/",
);

const problems = [
  {
    icon: Layers3,
    title: "Too many tools. No single view.",
    description:
      "Connect the data behind your operations, from settlement files and inventory to customer records.",
  },
  {
    icon: CalendarDays,
    title: "Bookings that create more admin.",
    description:
      "Connect customer appointments, service rules and the people delivering the work.",
  },
  {
    icon: Workflow,
    title: "The same manual work, every day.",
    description:
      "Map the repetitive steps, automate where it makes sense and keep people in control.",
  },
];

export default function Home() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="home-hero">
          <div className="marketing-container relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="marketing-eyebrow text-emerald-300">
                <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                CUSTOM SOFTWARE · AUTOMATION · AI
              </p>
              <h1 className="mt-7 max-w-4xl text-[clamp(2.75rem,5.1vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
                Software that makes
                <br className="hidden sm:block" /> your business
                <br />
                <span className="text-emerald-300">work better.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300">
                Replace spreadsheets, repetitive tasks and disconnected tools
                with custom platforms, mobile apps and intelligent automation
                built around your business.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/book" className="marketing-button button-mint">
                  Book a discovery call <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/portfolio"
                  className="marketing-button button-outline-light"
                >
                  Explore the work <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-7 flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                Warsaw, Poland · Working with businesses worldwide
              </p>
            </div>
            <aside className="hero-visual">
              <div className="hero-workspace">
                <Image
                  src={marketingImages.workspace.src}
                  alt={marketingImages.workspace.alt}
                  fill
                  sizes="(min-width: 1280px) 480px, (min-width: 1024px) 42vw, 94vw"
                  className="object-cover object-right"
                  quality={85}
                  priority
                />
                <div className="hero-image-label">
                  <span />
                  Thoughtful engineering. Practical software.
                </div>
              </div>
              <Link href="/about" className="hero-builder">
                <Image
                  src="/images/leos-portrait.png"
                  alt="Leo, founder of LeoTheTechGuy"
                  width={56}
                  height={56}
                  className="hero-builder-portrait"
                />
                <span>
                  <strong>A direct line to the builder.</strong>
                  <span>Work with Leo, from discovery to delivery.</span>
                </span>
                <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-emerald-300" />
              </Link>
            </aside>
          </div>
          <div className="marketing-container relative z-10 mt-16">
            <div className="grid gap-5 border-t border-white/15 pt-6 text-sm text-slate-300 sm:grid-cols-3">
              <span>
                <span className="mr-3 font-mono text-xs text-emerald-300">
                  01
                </span>
                Business operations software
              </span>
              <span>
                <span className="mr-3 font-mono text-xs text-emerald-300">
                  02
                </span>
                Web & mobile products
              </span>
              <span>
                <span className="mr-3 font-mono text-xs text-emerald-300">
                  03
                </span>
                AI & workflow automation
              </span>
            </div>
          </div>
        </section>
        <section className="marketing-section" id="selected-work">
          <div className="marketing-container">
            <div className="section-heading-row">
              <div>
                <p className="marketing-eyebrow">SELECTED WORK</p>
                <h2 className="marketing-heading mt-4">
                  Real businesses.
                  <br />
                  Practical software.
                </h2>
              </div>
              <div className="max-w-sm">
                <p className="text-slate-600 leading-relaxed">
                  Fleet finances, customer bookings and retail operations.
                  Explore the problems, the engineering and the scope behind
                  each project.
                </p>
                <Link
                  href="/portfolio"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
                >
                  All projects <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <CaseStudyCard key={study.id} study={study} index={index} />
              ))}
            </div>
          </div>
        </section>
        <section className="marketing-section border-y border-slate-200 bg-slate-50">
          <div className="marketing-container">
            <p className="marketing-eyebrow">SOUND FAMILIAR?</p>
            <h2 className="marketing-heading mt-4">
              Your business has outgrown
              <br />
              the workaround.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {problems.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <Icon className="h-6 w-6 text-emerald-700" />
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="marketing-section" id="services">
          <div className="marketing-container">
            <div className="section-heading-row">
              <div>
                <p className="marketing-eyebrow">HOW I CAN HELP</p>
                <h2 className="marketing-heading mt-4">
                  The right build.
                  <br />
                  For the work that matters.
                </h2>
              </div>
              <p className="max-w-sm leading-relaxed text-slate-600">
                Start with the business problem. Choose the tools, integrations
                and engineering around it.
              </p>
            </div>
            <div className="mt-12">
              <PrimaryServices />
            </div>
          </div>
        </section>
        <Testimonials />
        <DeliveryProcess />
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
