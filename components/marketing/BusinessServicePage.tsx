import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EngagementCTA from "./EngagementCTA";
import CaseStudyCard from "./CaseStudyCard";
import { businessServices } from "@/data/business-services";
import { caseStudies } from "@/data/case-studies";
import { serviceImages } from "@/data/marketing-images";
import EditorialImage from "./EditorialImage";

export default function BusinessServicePage({
  service,
}: {
  service: (typeof businessServices)[number];
}) {
  const relevant = caseStudies.filter((study) =>
    service.caseIds.includes(study.id),
  );
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero border-b border-slate-200 bg-slate-50">
          <div className="marketing-container service-hero-grid">
            <div>
              <p className="marketing-eyebrow">{service.eyebrow}</p>
              <h1 className="marketing-heading mt-5 max-w-4xl !text-[clamp(2.25rem,4vw,3.9rem)]">
                {service.title}
              </h1>
              <p className="mt-5 text-xl font-medium text-emerald-800">
                {service.headline}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                {service.description}
              </p>
              <Link
                href={`/contact?service=${encodeURIComponent(service.id)}`}
                className="marketing-button button-dark mt-8"
              >
                Discuss your requirements <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <EditorialImage image={serviceImages[service.id]} priority />
          </div>
        </section>
        <section className="marketing-section">
          <div className="marketing-container grid gap-12 lg:grid-cols-2">
            <div>
              <p className="marketing-eyebrow">THE PROBLEM TO SOLVE</p>
              <h2 className="marketing-heading mt-4">
                Start with how the work happens.
              </h2>
              <p className="mt-6 leading-relaxed text-slate-600">
                {service.problem}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-8">
              <h2 className="text-xl font-semibold">
                What an engagement can cover
              </h2>
              <ul className="mt-6 space-y-5">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                The delivery approach
              </h2>
              <p className="mt-5 max-w-3xl leading-relaxed text-slate-600">
                {service.approach}
              </p>
            </div>
          </div>
        </section>
        {relevant.length > 0 && (
          <section className="marketing-section border-y border-slate-200 bg-slate-50">
            <div className="marketing-container">
              <p className="marketing-eyebrow">RELATED WORK</p>
              <h2 className="marketing-heading mt-4">
                Explore the engineering in context.
              </h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {relevant.map((study, index) => (
                  <CaseStudyCard
                    study={study}
                    index={index}
                    columns={2}
                    key={study.id}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="marketing-section">
          <div className="marketing-container max-w-3xl">
            <h2 className="marketing-heading">Before we start.</h2>
            <div className="mt-8 divide-y divide-slate-200">
              {service.faqs.map((faq) => (
                <details key={faq.q} className="py-6">
                  <summary className="cursor-pointer text-lg font-medium text-slate-950">
                    {faq.q}
                  </summary>
                  <p className="mt-4 leading-relaxed text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
