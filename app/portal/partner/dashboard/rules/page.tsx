'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Users, 
  Scale, 
  Megaphone,
  HelpCircle
} from 'lucide-react';

const RULES_SECTIONS = [
  {
    id: 'commission',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Commission Structure & Payout Schedule',
    content: [
      {
        subtitle: 'Commission Rates',
        text: `Your commission rate depends on your partner tier and is calculated as a percentage of the final deal value (the actual amount the client pays).

• Referral Partner: 10% commission — No minimum revenue requirement
• Agency Partner: 15% commission — Requires $10,000+ lifetime referred revenue
• Enterprise Connector: 20% commission — Requires $50,000+ lifetime referred revenue

Commission is applied to the final deal value, not the estimated value you provide at registration. Our admin team sets the final value during deal approval.`
      },
      {
        subtitle: 'Payout Schedule',
        text: `Commissions are paid within 14 business days of the client's payment clearing. The process is:

1. Deal is closed and client payment is received
2. Commission amount is calculated and added to your pending balance
3. Payout is processed to your registered bank account
4. You receive an email confirmation with a payment reference

Payouts are made via bank transfer. Ensure your bank details in Settings are always up to date to avoid delays. There is no minimum payout threshold — you get paid for every closed deal.`
      },
    ]
  },
  {
    id: 'deal-protection',
    icon: Shield,
    color: 'text-blue-600 bg-blue-50',
    title: 'Deal Protection Policy',
    content: [
      {
        subtitle: '90-Day Exclusivity Window',
        text: `When you register a deal, you receive exclusive rights to that lead for 90 calendar days. During this period:

• No other partner can register the same client or company
• If the client contacts us directly, you still receive credit for the referral
• The 90-day clock starts from the moment you submit the deal registration

After 90 days, if the deal has not progressed to "Approved" or "Closed" status, the lead becomes open and can be registered by another partner or pursued directly by our sales team.`
      },
      {
        subtitle: 'Duplicate Lead Policy',
        text: `If you register a lead that is already in our system (either registered by another partner or an existing client), the deal will be rejected. You will be notified immediately with the reason. This is not a penalty — it simply means the lead was already known to us.

To minimize duplicates, try to register deals as early as possible, and provide specific company names and decision-maker contacts.`
      },
    ]
  },
  {
    id: 'conduct',
    icon: Users,
    color: 'text-purple-600 bg-purple-50',
    title: 'Partner Code of Conduct',
    content: [
      {
        subtitle: 'Professional Standards',
        text: `As a Leo Systems partner, you represent our brand in the marketplace. You are expected to:

• Act with honesty and integrity in all client interactions
• Never make false claims about our capabilities, pricing, or timelines
• Never promise discounts or special terms without authorization from our team
• Treat all prospects and clients with professionalism and respect
• Respond to partner communications within 48 hours
• Keep client information confidential`
      },
      {
        subtitle: 'Prohibited Activities',
        text: `The following activities will result in warning, suspension, or permanent removal from the program:

• Submitting fraudulent or fabricated deal registrations
• Misrepresenting Leo Systems services, pricing, or capabilities
• Engaging in spam, unsolicited bulk messaging, or deceptive marketing
• Sharing confidential partner program details (pricing structures, internal processes) publicly
• Attempting to bypass the deal registration system
• Engaging in any activity that damages the Leo Systems brand reputation`
      },
    ]
  },
  {
    id: 'advertising',
    icon: Megaphone,
    color: 'text-amber-600 bg-amber-50',
    title: 'Advertising & Marketing Guidelines',
    content: [
      {
        subtitle: 'Approved Marketing Activities',
        text: `You are encouraged to promote Leo Systems services through:

• Personal social media posts (LinkedIn, Twitter/X, Facebook, Instagram)
• Word-of-mouth referrals and personal networking
• Email outreach to your existing contacts and network
• Speaking engagements, webinars, and workshops
• Blog posts and articles mentioning our services
• Business cards and professional materials identifying you as a Leo Systems partner`
      },
      {
        subtitle: 'Brand Usage Rules',
        text: `When referencing Leo Systems in your marketing:

• You may identify yourself as a "Leo Systems Partner" or "Leo Systems Referral Partner"
• You may NOT use our logo without prior written approval from our team
• You may NOT create paid advertisements (Google Ads, Facebook Ads, etc.) using our brand name without authorization
• You may NOT create websites that could be confused with official Leo Systems properties
• All marketing materials should accurately represent our services and capabilities

If you are unsure whether a marketing activity is permitted, contact our partner support team before proceeding.`
      },
    ]
  },
  {
    id: 'tiers',
    icon: Scale,
    color: 'text-indigo-600 bg-indigo-50',
    title: 'Tier Progression Requirements',
    content: [
      {
        subtitle: 'How Tier Upgrades Work',
        text: `Your tier is automatically upgraded based on your lifetime referred revenue (the total value of all deals you have referred that have been closed and paid):

• Referral Partner → Agency Partner: Reach $10,000 in lifetime referred revenue
• Agency Partner → Enterprise Connector: Reach $50,000 in lifetime referred revenue

Tier upgrades are processed automatically by our system. When your revenue crosses a threshold, your tier is immediately upgraded and you receive an email notification. The higher commission rate applies to all new deals from that point forward.

Important: Tier upgrades are permanent. Your tier will not be downgraded even during periods of low activity.`
      },
      {
        subtitle: 'Tier Benefits Summary',
        text: `Referral Partner:
• 10% commission on all closed deals
• Access to basic sales resources and the partner academy
• Standard email support

Agency Partner:
• 15% commission on all closed deals
• Priority support with faster response times
• Co-branded marketing materials
• Deal registration with 90-day protection

Enterprise Connector:
• 20% commission on all closed deals
• Dedicated account manager
• Custom integrations and co-development opportunities
• Joint go-to-market campaigns
• Early access to new services and features`
      },
    ]
  },
  {
    id: 'disputes',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50',
    title: 'Disputes & Escalation Process',
    content: [
      {
        subtitle: 'Raising a Dispute',
        text: `If you believe a deal was incorrectly rejected, a commission was miscalculated, or you have any other concern, you can raise a dispute by:

1. Emailing contact@leothetechguy.com with the subject line "Partner Dispute — [Your Name]"
2. Include the deal ID, a clear description of the issue, and any supporting evidence
3. Our partner operations team will acknowledge your dispute within 2 business days
4. A resolution will be provided within 5 business days of acknowledgment`
      },
      {
        subtitle: 'Escalation Path',
        text: `If you are not satisfied with the initial resolution:

• Level 1: Partner Support Team — Initial review and resolution (2-5 business days)
• Level 2: Partner Operations Manager — Escalated review (5-7 business days)
• Level 3: Head of Partnerships — Final decision (7-10 business days)

All decisions at Level 3 are final. We are committed to fair and transparent dispute resolution. Our goal is to maintain a positive, trust-based relationship with all our partners.`
      },
    ]
  },
  {
    id: 'termination',
    icon: HelpCircle,
    color: 'text-slate-600 bg-slate-50',
    title: 'Account Suspension & Termination',
    content: [
      {
        subtitle: 'Suspension',
        text: `Your partner account may be suspended if:

• You violate the Code of Conduct
• You have not registered any deals for 12 consecutive months (inactivity)
• You receive multiple client complaints

During suspension, you cannot register new deals, but existing approved deals will continue to be processed and commissions will still be paid.

To reinstate a suspended account, contact our partner support team to discuss the issue and agree on corrective actions.`
      },
      {
        subtitle: 'Voluntary Termination',
        text: `You may leave the partner program at any time by emailing contact@leothetechguy.com. Upon termination:

• Any pending commissions for closed deals will still be paid
• Active deals in the pipeline will be reassigned
• Your dashboard access will be deactivated within 7 days
• You must cease all use of Leo Systems branding and partner identification

We hope you will stay, but we respect your right to leave at any time with no penalties.`
      },
    ]
  },
];

function AccordionItem({ section }: { section: typeof RULES_SECTIONS[0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left group"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${section.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {section.title}
          </h3>
        </div>
        <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-emerald-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-8 pb-8 pt-2 border-t border-slate-50 animate-in fade-in duration-200">
          <div className="space-y-6">
            {section.content.map((item, idx) => (
              <div key={idx}>
                <h4 className="text-base font-bold text-slate-800 mb-3">{item.subtitle}</h4>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgramRulesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Program Rules & Guidelines</h2>
        <p className="text-slate-500">
          Everything you need to know about the partner program terms, policies, and expectations.
        </p>
      </div>

      {/* Quick Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Quick Overview
          </div>
          <h3 className="text-xl font-bold mb-4">Key Things to Remember</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <DollarSign className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold">Earn 10-20% commission on every closed deal</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Shield className="h-6 w-6 text-blue-400 mb-2" />
              <p className="text-sm font-semibold">90-day deal protection on all registered leads</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Clock className="h-6 w-6 text-amber-400 mb-2" />
              <p className="text-sm font-semibold">Payouts within 14 business days of client payment</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {RULES_SECTIONS.map((section) => (
          <AccordionItem key={section.id} section={section} />
        ))}
      </div>

      {/* Footer note */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <p className="text-sm text-slate-500 text-center">
          These rules were last updated on <strong>February 2026</strong>. If you have questions about any policy, 
          contact us at{' '}
          <a href="mailto:contact@leothetechguy.com" className="text-emerald-600 hover:underline font-medium">
            contact@leothetechguy.com
          </a>.
        </p>
      </div>
    </div>
  );
}
