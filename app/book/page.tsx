import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/marketing/BookingCalendar";
import InquiryForm from "@/components/marketing/InquiryForm";
import { marketingMetadata } from "@/lib/marketing-metadata";
export const metadata = marketingMetadata(
  "Book a Discovery Call",
  "Discuss your business workflow, software requirements and next steps directly with Leo. Choose a calendar time or request an alternative.",
  "/book",
);
export default function BookMeeting() {
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero">
          <div className="marketing-container">
            <p className="marketing-eyebrow">A FOCUSED FIRST CONVERSATION</p>
            <h1 className="marketing-heading mt-5 !text-[clamp(2.5rem,5vw,4.6rem)]">
              Book a discovery call.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Talk directly with Leo about your workflow, the problem you want
              to solve and what a useful first step could look like. Bring your
              current tools and a little business context; a technical brief is
              optional.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-800">
              <span>Understand the problem</span>
              <span>Explore possible approaches</span>
              <span>Agree the next step</span>
            </div>
          </div>
        </section>
        <section className="pb-24">
          <div className="marketing-container max-w-5xl">
            <BookingCalendar />
          </div>
        </section>
        <section className="marketing-section border-t border-slate-200">
          <div className="marketing-container max-w-3xl">
            <InquiryForm mode="discovery" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
