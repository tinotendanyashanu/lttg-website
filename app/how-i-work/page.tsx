import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeliveryProcess from "@/components/marketing/DeliveryProcess";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import { marketingMetadata } from "@/lib/marketing-metadata";
export const metadata = marketingMetadata(
  "How Software Projects Work",
  "A clear delivery process: discovery, agreed scope, working software reviews, deployment and handover. Work directly with Leo from start to finish.",
  "/how-i-work",
);
export default function HowItWorks() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container">
            <p className="marketing-eyebrow">WORK DIRECTLY WITH THE BUILDER</p>
            <h1 className="marketing-heading mt-5 max-w-4xl !text-[clamp(2.5rem,5vw,4.6rem)]">
              Clear scope.
              <br />
              Working software.
              <br />A considered handover.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Every engagement starts by understanding the business problem.
              Deliverables, priorities, milestones and costs are agreed before
              development begins.
            </p>
          </div>
        </section>
        <DeliveryProcess />
        <section className="marketing-section">
          <div className="marketing-container grid gap-9 md:grid-cols-3">
            {[
              {
                title: "What to bring",
                text: "A description of the workflow, the tools you use and the part that causes friction. You do not need a finished technical specification.",
              },
              {
                title: "What we agree",
                text: "The intended outcome, delivery scope, integrations, ownership, milestones, costs and any ongoing support requirements.",
              },
              {
                title: "What happens at launch",
                text: "Test against the agreed requirements, plan the rollout and hand over the information needed to operate and maintain the software.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-4 leading-relaxed text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
