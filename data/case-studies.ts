export interface CaseStudy {
  id: string;
  name: string;
  category: string;
  title: string;
  summary: string;
  engagement: string;
  problem: string;
  solution: string;
  involvement: string;
  capabilities: string[];
  delivery: string;
  scopeNote: string;
  audience: string;
  color: string;
}

// Source: the owner's October 2026 B2B audit. Add approved screenshots and
// measured results when available; descriptions do not imply a verified ROI.
export const caseStudies: CaseStudy[] = [
  {
    id: "drago",
    name: "Drago Partner",
    category: "Fleet operations",
    title: "Bringing fleet settlements and operations into one place.",
    summary:
      "A fleet management platform connecting settlement data, driver balances and vehicle administration.",
    engagement: "Client project",
    problem:
      "Fleet operators work across multiple transport platforms. Reconciling settlement files, driver balances and vehicle records across separate tools makes routine financial administration difficult to follow.",
    solution:
      "A dedicated operations platform that brings Uber, Bolt and FreeNow settlement data together with driver balances and vehicle management workflows.",
    involvement:
      "Software engineering across the administration interface, settlement workflows and the supporting business logic.",
    capabilities: [
      "Settlement data consolidation",
      "Driver balance management",
      "Vehicle administration",
      "Financial workflows",
    ],
    delivery:
      "A central workspace for reviewing fleet operations and financial information instead of treating each platform as a separate process.",
    scopeNote:
      "This case describes the engineering scope. Client financial records and driver information are not published.",
    audience: "Fleet operators, transport businesses and logistics teams",
    color: "mint",
  },
  {
    id: "maran",
    name: "Maran",
    category: "Booking & operations",
    title: "Connecting customer bookings with the team running the business.",
    summary:
      "Customer booking, pricing rules, loyalty and an administration dashboard for an automotive service business.",
    engagement: "Client project",
    problem:
      "A service business needs a consistent way to connect customer appointments, service pricing and day-to-day administration. Disconnected booking and back-office tools make that coordination harder.",
    solution:
      "A booking and business operations platform with a customer mobile app, configurable pricing rules, loyalty features and an administration dashboard.",
    involvement:
      "Product and software engineering across customer booking journeys and the tools used to administer services and appointments.",
    capabilities: [
      "Customer booking flow",
      "Service pricing rules",
      "Loyalty features",
      "Mobile app & administration",
    ],
    delivery:
      "A connected customer and administration experience, designed around the way the service business takes and manages bookings.",
    scopeNote:
      "Fleet billing is an extension of the product scope and is not presented here as a delivered feature.",
    audience:
      "Car washes, automotive service centres and appointment-based businesses",
    color: "blue",
  },
  {
    id: "swipee",
    name: "Swipee",
    category: "Retail software",
    title: "Building the everyday tools behind a retail business.",
    summary:
      "Founder-led product engineering for point of sale, product inventory, transaction history and a mobile application.",
    engagement: "Founder-led product",
    problem:
      "Small retailers need practical tools to record sales, manage their product catalogue and understand transactions without assembling a complicated stack of separate applications.",
    solution:
      "A retail product built around checkout, product inventory and transaction history, with mobile application development supporting the merchant experience.",
    involvement:
      "Founder-led product development, connecting merchant-facing workflows with the application and business logic behind them.",
    capabilities: [
      "Point-of-sale checkout",
      "Product inventory",
      "Transaction history",
      "Mobile product engineering",
    ],
    delivery:
      "An example of end-to-end product engineering for the operational needs of a retail business.",
    scopeNote:
      "Bank integrations and regulated payment services are separate from the checkout and inventory scope described here. Their availability is not implied.",
    audience:
      "Retail businesses, commerce startups and software product founders",
    color: "violet",
  },
];

export const primaryServices = [
  {
    id: "business-software",
    number: "01",
    name: "Custom business software",
    description:
      "Bring the work your team does every day into one connected system.",
    items: [
      "Internal dashboards & operations",
      "Booking, inventory & financial workflows",
      "Integrations between existing tools",
    ],
    href: "/services/custom-business-software-warsaw",
  },
  {
    id: "product-development",
    number: "02",
    name: "Web & mobile products",
    description:
      "Turn a business idea into a product that customers and your team can use.",
    items: [
      "Customer portals & SaaS platforms",
      "Mobile apps & administration tools",
      "Backends, testing & deployment",
    ],
    href: "/services/web-mobile-development",
  },
  {
    id: "ai-workflows",
    number: "03",
    name: "AI & workflow automation",
    description:
      "Reduce repetitive work with integrations and AI that fit a defined business process.",
    items: [
      "Document processing & knowledge search",
      "Support & administration workflows",
      "Human review for important decisions",
    ],
    href: "/services/business-process-automation",
  },
];

export const deliverySteps = [
  {
    title: "Understand the work",
    description:
      "Talk through the problem, current tools, users and the outcome you need.",
  },
  {
    title: "Agree the scope",
    description:
      "Define deliverables, priorities, costs and milestones before development starts.",
  },
  {
    title: "Build & review",
    description:
      "Review working software together and test it against the agreed requirements.",
  },
  {
    title: "Launch & support",
    description:
      "Plan deployment, handover and any ongoing support as part of the engagement.",
  },
];
