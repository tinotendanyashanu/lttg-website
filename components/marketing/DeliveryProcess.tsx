import { deliverySteps } from "@/data/case-studies";

export default function DeliveryProcess() {
  return (
    <section className="marketing-section bg-slate-50" id="process">
      <div className="marketing-container">
        <p className="marketing-eyebrow">A CLEAR WAY FORWARD</p>
        <h2 className="marketing-heading mt-4">
          From the first conversation
          <br />
          to the work your team uses.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {deliverySteps.map((step, index) => (
            <div className="border-t border-slate-300 pt-5" key={step.title}>
              <span className="font-mono text-xs text-slate-500">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
