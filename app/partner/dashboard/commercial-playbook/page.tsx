import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import CommercialPlaybookConfig, { ICommercialPlaybookConfig } from '@/models/CommercialPlaybookConfig';

// Components
import PricingMatrixTable from '@/components/partner/commercial-playbook/PricingMatrixTable';
import ServiceLevelAccordion from '@/components/partner/commercial-playbook/ServiceLevelAccordion';
import RegionalAdjustmentCard from '@/components/partner/commercial-playbook/RegionalAdjustmentCard';
import InvestmentPositioningScripts from '@/components/partner/commercial-playbook/InvestmentPositioningScripts';
import CommissionCalculator from '@/components/partner/commercial-playbook/CommissionCalculator';
import EscalationGuardrails from '@/components/partner/commercial-playbook/EscalationGuardrails';

export default async function CommercialPlaybookPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/partner/login');
  }

  await dbConnect();

  // Fetch config or use defaults/initial
  // We use .lean() and cast to unknown then type to avoid Mongoose document methdos serialization issues in Server Components if passed to client
  // But here we are passing to components, so serialization is needed.
  // Actually, for Server Components to Client Components, we need plain objects.
// Initial data for seeding (mirrors API route)
const INITIAL_DATA = {
  pricingMatrix: [
    { serviceLevel: "Starter Digital Setup", tier1: "$150–$400", tier2: "$120–$300", tier3: "$100–$250" },
    { serviceLevel: "Professional Website", tier1: "$900–$3,500", tier2: "$600–$2,500", tier3: "$350–$1,500" },
    { serviceLevel: "Automation Systems", tier1: "$3,500–$12,000", tier2: "$2,500–$8,000", tier3: "$1,200–$4,500" },
    { serviceLevel: "Scalable Platforms", tier1: "$12,000+", tier2: "$8,000+", tier3: "$4,000+" },
    { serviceLevel: "Enterprise Initiatives", tier1: "$50,000+", tier2: "$30,000+", tier3: "Case-by-case" }
  ],
  regionalGuidelines: {
    tier1: "Full range",
    tier2: "20–30% lower",
    tier3: "40–50% lower, start smaller",
    adjustmentExplanation: "Adjust positioning tone based on client environment. Do not expose internal margin logic."
  },
  scripts: [
    { title: "Standard Pricing Inquiry", content: "Based on similar projects, investment typically falls within the low 4-figure range depending on scope.", category: "pricing" },
    { title: "Small Business Constraint", content: "We have a streamlined setup package designed specifically for leaner budgets while keeping the core professional standards.", category: "pricing" },
    { title: "Enterprise/Retainer", content: "For ongoing support and scaling, we operate on a retainer model that ensures dedicated availability and priority handling.", category: "pricing" }
  ],
  serviceGuides: [
    {
      title: "Starter Digital Setup",
      whoIsItFor: "Solo founders, local businesses, simple portfolios.",
      problemItSolves: "Establish professional digital presence without technical debt.",
      includes: ["Landing page", "Basic SEO", "Contact integration"],
      doesNotInclude: ["Custom automation", "Complex integrations"],
      upgradePath: "Professional Website"
    },
    {
      title: "Professional Website",
      whoIsItFor: "Growing SMEs, Brands needing competitive edge.",
      problemItSolves: "Conversion-focused design, brand authority.",
      includes: ["CMS setup", "Advanced animations", "Lead gen capture"],
      doesNotInclude: ["Custom SaaS development"],
      upgradePath: "Automation Systems"
    },
    {
      title: "Automation Systems",
      whoIsItFor: "Teams wasting time on manual data entry.",
      problemItSolves: "Operational efficiency, scaling without hiring.",
      includes: ["CRM sync", "Email flows", "Task automation"],
      doesNotInclude: ["Full ERP replacement"],
      upgradePath: "Scalable Platforms"
    }
  ],
  escalationRules: [
    "Enterprise client",
    "Multi-phase request",
    "Custom system",
    "Heavy negotiation",
    "Budget uncertainty"
  ]
};

  let config = await CommercialPlaybookConfig.findOne({}).lean() as unknown as ICommercialPlaybookConfig;

  if (!config) {
     // Seed initial data directly if missing
     const newConfig = await CommercialPlaybookConfig.create(INITIAL_DATA);
     // Convert to plain object (lean equivalent)
     config = JSON.parse(JSON.stringify(newConfig));
  }
  
  // JSON serialization hack for mongo _id objects if needed, but lean() usually helps. 
  // We might need to convert _id to string if passed to client components.
  const serializedConfig = JSON.parse(JSON.stringify(config));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Commercial Playbook</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Strategic pricing frameworks and enablement resources for partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                Live Guidance
            </span>
        </div>
      </div>

      {/* 1. Quick Pricing Reference */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                Quick Pricing Reference
            </h2>
            <p className="text-slate-500 mt-1 ml-10">Base investment ranges for standard engagements.</p>
        </div>
        <PricingMatrixTable data={serializedConfig.pricingMatrix} />
      </section>

      {/* 2. Service Level Guide */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                Service Level Guide
            </h2>
            <p className="text-slate-500 mt-1 ml-10">Detailed breakdown of deliverables and positioning.</p>
        </div>
        <ServiceLevelAccordion data={serializedConfig.serviceGuides} />
      </section>

      {/* 3. Regional Adjustment */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                Regional Guidelines
            </h2>
            <p className="text-slate-500 mt-1 ml-10">Market-specific pricing adjustments.</p>
        </div>
        <RegionalAdjustmentCard data={serializedConfig.regionalGuidelines} />
      </section>

      {/* 4. Positioning Scripts */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">4</span>
                Investment Positioning Scripts
            </h2>
            <p className="text-slate-500 mt-1 ml-10">Copy-ready responses for common pricing discussions.</p>
        </div>
        <InvestmentPositioningScripts data={serializedConfig.scripts} />
      </section>

      {/* 5. Commission Calculator */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">5</span>
                Commission Calculator
            </h2>
            <p className="text-slate-500 mt-1 ml-10">Estimate your potential earnings for this project.</p>
        </div>
        <CommissionCalculator />
      </section>

      {/* 6. Escalation & Guardrails */}
      <section>
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">6</span>
                Escalation & Guardrails
            </h2>
            <p className="text-slate-500 mt-1 ml-10">When to bring in internal sales engineering.</p>
        </div>
        <EscalationGuardrails data={serializedConfig.escalationRules} />
      </section>

    </div>
  );
}
