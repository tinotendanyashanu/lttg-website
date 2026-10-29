import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseStudyCard from "@/components/marketing/CaseStudyCard";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import ProjectGallery from "@/components/marketing/ProjectGallery";
import { caseStudies } from "@/data/case-studies";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const metadata = marketingMetadata(
  "Business Software Case Studies & Projects",
  "Explore fleet operations software, booking platforms and retail product engineering. Case studies from Drago Partner, Maran and Swipee.",
  "/portfolio",
);

export default function Portfolio() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container">
            <p className="marketing-eyebrow">THE WORK BEHIND THE WORDS</p>
            <h1 className="marketing-heading mt-5 max-w-3xl !text-[clamp(2.5rem,5.5vw,4.8rem)]">
              Built around the way
              <br />a business works.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Explore the business problem, the engineering scope and the
              workflows behind selected client projects and founder-led
              products.
            </p>
          </div>
        </section>
        <section className="pb-24">
          <div className="marketing-container grid gap-6 lg:grid-cols-3">
            {caseStudies.map((study, index) => (
              <CaseStudyCard study={study} index={index} key={study.id} />
            ))}
          </div>
        </section>
        <ProjectGallery />
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
