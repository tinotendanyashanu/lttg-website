import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrimaryServices from "@/components/marketing/PrimaryServices";
import DeliveryProcess from "@/components/marketing/DeliveryProcess";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import { businessServices } from "@/data/business-services";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata(
  "Custom Software, Mobile Products & AI Automation",
  "Business operations software, web and mobile product development, and practical AI automation. Based in Warsaw, working with businesses worldwide.",
  "/services",
);
export default function Services() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container">
            <p className="marketing-eyebrow">
              SOFTWARE ENGINEERING FOR YOUR BUSINESS
            </p>
            <h1 className="marketing-heading mt-5 max-w-4xl !text-[clamp(2.5rem,5.5vw,4.8rem)]">
              Less friction.
              <br />
              Better-connected work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Build the tools your business needs, connect the systems you
              already use and automate the work that slows your team down.
            </p>
          </div>
        </section>
        <section className="pb-24">
          <div className="marketing-container">
            <PrimaryServices />
            <div className="mt-10 rounded-xl border border-slate-200 p-7">
              <h2 className="text-lg font-semibold">
                Engineering beyond the first build.
              </h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
                Cloud infrastructure, security reviews, technical advisory and
                ongoing support can be scoped alongside delivery. Availability,
                response times and service levels are agreed for each
                engagement.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { href: "/services/cybersecurity", label: "Security" },
                  { href: "/services/mentorship", label: "Technical advisory" },
                  { href: "/how-i-work", label: "Delivery process" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-semibold text-emerald-700 underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="marketing-section border-t border-slate-200">
          <div className="marketing-container">
            <p className="marketing-eyebrow">FIND YOUR STARTING POINT</p>
            <h2 className="marketing-heading mt-4">
              Specific workflows. Focused solutions.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {businessServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="rounded-lg border border-slate-200 p-6 hover:border-emerald-600"
                >
                  <h3 className="font-semibold">{service.title} ↗</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <DeliveryProcess />
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
