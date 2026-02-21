import { CURRENT_TERMS_VERSION } from '@/lib/constants';

export const metadata = {
  title: `Affiliate Agreement (${CURRENT_TERMS_VERSION}) — Leo Systems`,
  description: 'Read the full Affiliate Agreement governing the Leo Systems partner program.',
};

export default function AffiliateAgreementPage() {
  const effectiveDate = 'February 21, 2026';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Affiliate Agreement</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs uppercase">
              {CURRENT_TERMS_VERSION}
            </span>
            <span>Effective: {effectiveDate}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-slate prose-lg max-w-none">

          <p>
            This Affiliate Agreement (&quot;Agreement&quot;) is entered into between Leo Systems (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) 
            and you (&quot;Affiliate&quot;, &quot;Partner&quot;, &quot;you&quot;) upon your acceptance during registration or re-acceptance.
          </p>

          <h2>1. Definitions</h2>
          <p>
            <strong>&quot;Affiliate Program&quot;</strong> means the referral and partner program operated by Leo Systems.<br />
            <strong>&quot;Commission&quot;</strong> means the monetary compensation paid to you for qualifying referrals.<br />
            <strong>&quot;Referral&quot;</strong> means a prospective client who engages Leo Systems services through your unique referral link or code.<br />
            <strong>&quot;Dashboard&quot;</strong> means the partner portal at leosystems.ai where you manage your account, deals, and payouts.
          </p>

          <h2>2. Enrollment &amp; Eligibility</h2>
          <ul>
            <li>You must be at least 18 years of age and legally able to enter contracts.</li>
            <li>Enrollment is subject to review and approval by Leo Systems.</li>
            <li>We reserve the right to reject or terminate any application at our sole discretion.</li>
            <li>You must provide accurate and truthful information during registration.</li>
          </ul>

          <h2>3. Affiliate Obligations</h2>
          <ul>
            <li>You agree to promote Leo Systems services ethically and in compliance with all applicable laws.</li>
            <li>You shall not engage in misleading, deceptive, or fraudulent marketing practices.</li>
            <li>You shall not use spam, unsolicited communications, or any method that could damage our reputation.</li>
            <li>You are responsible for disclosing your affiliate relationship where required by law.</li>
            <li>Self-referrals are prohibited unless explicitly authorized in writing.</li>
          </ul>

          <h2>4. Commission Structure</h2>
          <ul>
            <li>Commission rates are determined by your tier level (Referral, Agency, Enterprise, Creator).</li>
            <li>Commissions are calculated on the final deal value after client payment is confirmed.</li>
            <li>A 14-day hold period applies from the date of client payment before commissions are approved.</li>
            <li>Leo Systems reserves the right to modify commission rates with 30 days&apos; written notice.</li>
            <li>Academy bonus eligibility and amounts are set at the Company&apos;s sole discretion.</li>
          </ul>

          <h2>5. Payment Terms</h2>
          <ul>
            <li>Payouts are processed on a monthly cycle, subject to a minimum balance threshold.</li>
            <li>You must provide valid banking or payment information to receive payouts.</li>
            <li>Leo Systems is not responsible for delays caused by incorrect payment details.</li>
            <li>All payments are made in USD unless otherwise agreed.</li>
            <li>You are responsible for any tax obligations arising from commissions received.</li>
          </ul>

          <h2>6. Refunds &amp; Chargebacks</h2>
          <ul>
            <li>If a referred client receives a refund, the associated commission will be reversed.</li>
            <li>If the commission has already been paid out, a debt balance will be recorded against your account.</li>
            <li>Debt balances will be deducted from future commission payments.</li>
          </ul>

          <h2>7. Prohibited Activities</h2>
          <p>The following activities are strictly prohibited and may result in immediate termination:</p>
          <ul>
            <li>Submitting fraudulent or duplicate referrals.</li>
            <li>Using paid advertising that bids on Leo Systems brand terms without authorization.</li>
            <li>Creating fake accounts or manipulating referral tracking.</li>
            <li>Referring yourself, employees, or entities you control.</li>
            <li>Any activity that constitutes fraud, deception, or misrepresentation.</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <ul>
            <li>Leo Systems grants you a limited, non-exclusive, revocable license to use approved marketing materials.</li>
            <li>You may not modify, alter, or misrepresent Leo Systems branding or trademarks.</li>
            <li>All intellectual property remains the sole property of Leo Systems.</li>
          </ul>

          <h2>9. Confidentiality</h2>
          <p>
            You agree to keep confidential any non-public information shared through the partner program, 
            including commission rates, internal tools, client data, and business strategies.
          </p>

          <h2>10. Data Protection</h2>
          <ul>
            <li>You agree to comply with applicable data protection laws (including GDPR and POPIA where applicable).</li>
            <li>You shall not share, sell, or misuse any personal data obtained through your referrals.</li>
            <li>Leo Systems processes partner data in accordance with our Privacy Policy.</li>
          </ul>

          <h2>11. Term &amp; Termination</h2>
          <ul>
            <li>This Agreement is effective upon acceptance and continues until terminated by either party.</li>
            <li>Either party may terminate with 30 days&apos; written notice.</li>
            <li>Leo Systems may terminate immediately for breach of this Agreement.</li>
            <li>Upon termination, pending approved commissions will be paid per the standard cycle.</li>
            <li>Unpaid pending commissions below the payout threshold will be forfeited.</li>
          </ul>

          <h2>12. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Leo Systems shall not be liable for any indirect, 
            incidental, or consequential damages arising from your participation in the Affiliate Program. 
            Our total liability shall not exceed the total commissions paid to you in the preceding 12 months.
          </p>

          <h2>13. Modifications</h2>
          <p>
            Leo Systems reserves the right to modify this Agreement at any time. Material changes will be 
            communicated to you via email or through the Dashboard. Continued participation after notification 
            constitutes acceptance. If re-acceptance is required, you will be prompted upon login.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            This Agreement shall be governed by the laws of the United Kingdom. Any disputes shall be 
            resolved through binding arbitration in London, UK.
          </p>

          <h2>15. Entire Agreement</h2>
          <p>
            This Agreement, together with any linked policies (Privacy Policy, Acceptable Use Policy), 
            constitutes the entire agreement between you and Leo Systems regarding the Affiliate Program 
            and supersedes all prior agreements.
          </p>

          <hr />

          <p className="text-sm text-slate-500">
            By accepting this Agreement, you acknowledge that you have read, understood, and agree to be 
            bound by all terms and conditions stated herein. Your acceptance is recorded with a timestamp 
            and IP address for legal compliance purposes.
          </p>

          <p className="text-sm text-slate-400 mt-4">
            Document Version: {CURRENT_TERMS_VERSION} | Last Updated: {effectiveDate}
          </p>
        </div>
      </div>
    </div>
  );
}
