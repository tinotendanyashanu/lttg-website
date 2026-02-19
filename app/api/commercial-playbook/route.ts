import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CommercialPlaybookConfig from '@/models/CommercialPlaybookConfig';

// Initial data for seeding
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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let config = await CommercialPlaybookConfig.findOne({});

    if (!config) {
      // Seed initial data if none exists
      config = await CommercialPlaybookConfig.create(INITIAL_DATA);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching playbook config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Only admins can update
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Upsert the configuration
    const config = await CommercialPlaybookConfig.findOneAndUpdate(
      {},
      { 
        ...body,
        updatedBy: session.user.email,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating playbook config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
