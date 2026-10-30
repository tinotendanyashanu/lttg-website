import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
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
        <section className="home-hero" aria-labelledby="hero-title">
          <div className="marketing-container hero-intro">
            <p className="hero-eyebrow">Custom software. Built around you.</p>
            <h1 id="hero-title" className="hero-title">
              <span>Better software.</span>
              <span className="hero-title-accent">Better business.</span>
            </h1>
            <p className="hero-description">
              Custom platforms, mobile apps and intelligent automation.
              <br className="hidden sm:block" /> Built around the way your
              business works.
            </p>
            <div className="hero-actions">
              <Link
                href="/book"
                className="hero-cta"
                aria-label="Book a discovery call"
              >
                Book a call
              </Link>
              <Link href="/portfolio" className="hero-work">
                <span>Explore the work</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="hero-stage">
            <Image
              src={marketingImages.heroDevices.src}
              alt={marketingImages.heroDevices.alt}
              fill
              sizes="(max-width: 640px) 196vw, (min-width: 1280px) 1700px, 146vw"
              className="hero-device-image"
              quality={85}
              priority
            />
          </div>
          <p className="hero-footnote">Based in Warsaw. Working worldwide.</p>
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
