'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last Updated: February 19, 2026</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-12">

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing, browsing, or using the website, services, or Partner Network operated under the brand LeoTheTechGuy (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              If you do not agree with these Terms, you may not use the Service.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              These Terms apply to all visitors, clients, users, and partners worldwide.
            </p>
          </section>

          {/* 2. Description of Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Services</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              LeoTheTechGuy designs, builds, and implements structured digital systems, platforms, automation solutions, and related technology infrastructure for businesses and individuals (&quot;Services&quot;).
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">Services may include:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Website and digital presence builds</li>
              <li>Automation and operational systems</li>
              <li>Platform development</li>
              <li>Strategic technology direction</li>
              <li>Ongoing technology partnership</li>
              <li>Partner Network referral program</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              The scope of any paid project will be defined in a separate written agreement, proposal, or statement of work. In the event of conflict, the signed project agreement controls.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              If you create an account, including a Partner Dashboard account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Provide accurate information</li>
              <li>Maintain confidentiality of login credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              We reserve the right to suspend or terminate accounts for violations of these Terms.
            </p>
          </section>

          {/* 4. Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Payment Terms (Client Services)</h2>
            <p className="text-slate-600 leading-relaxed mb-3">Unless otherwise stated in a written agreement:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Invoices are due as specified in the proposal or invoice.</li>
              <li>Late payments may result in suspension of services.</li>
              <li>Deposits, milestone payments, and staged billing may be required.</li>
              <li>Fees are non-refundable once work has commenced unless otherwise agreed in writing.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Chargebacks or unauthorized payment reversals may result in immediate service suspension and legal recovery efforts.
            </p>
          </section>

          {/* 5. Scope & Project Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Scope &amp; Project Modifications</h2>
            <p className="text-slate-600 leading-relaxed mb-3">All projects are based on defined scope.</p>
            <p className="text-slate-600 leading-relaxed mb-3">Additional work outside agreed scope may:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Require a revised quote</li>
              <li>Result in timeline adjustments</li>
              <li>Require additional payment</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">Verbal changes do not modify written agreements.</p>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Intellectual Property</h2>
            <h3 className="text-lg font-bold text-slate-800 mb-2">6.1 Client Deliverables</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Upon full payment, the client receives rights to the final agreed deliverables.
            </p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">6.2 Retained Rights</h3>
            <p className="text-slate-600 leading-relaxed mb-3">LeoTheTechGuy retains ownership of:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Pre-existing tools</li>
              <li>Frameworks</li>
              <li>Templates</li>
              <li>Underlying systems</li>
              <li>General methodologies</li>
              <li>Reusable code components</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Nothing in these Terms transfers ownership of proprietary internal systems unless explicitly stated in writing.
            </p>
          </section>

          {/* 7. Confidentiality */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Confidentiality</h2>
            <p className="text-slate-600 leading-relaxed">
              Both parties agree to keep confidential any non-public business, financial, or technical information disclosed during engagement.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">This obligation survives termination of the relationship.</p>
          </section>

          {/* 8. Partner Network Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Partner Network Terms</h2>

            <h3 className="text-lg font-bold text-slate-800 mb-2">8.1 Independent Relationship</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Partners are independent contractors. Nothing creates employment, agency, or joint venture relationships. Partners are responsible for their own taxes and legal compliance.
            </p>

            <h3 className="text-lg font-bold text-slate-800 mb-2">8.2 Commission Structure</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Commission percentages and eligibility are determined by partner tier and may be updated within the Partner Dashboard. Commissions are based on finalized, collected revenue from referred clients. No commission is earned until payment is successfully received from the client.
            </p>

            <h3 className="text-lg font-bold text-slate-800 mb-2">8.3 Fraud &amp; Misconduct</h3>
            <p className="text-slate-600 leading-relaxed mb-3">Fraud includes, but is not limited to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Self-referrals</li>
              <li>Fake leads</li>
              <li>Misrepresentation of services</li>
              <li>False promises regarding pricing or scope</li>
              <li>Manipulation of tracking systems</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-4">
              Fraudulent accounts will be terminated immediately. Pending commissions may be forfeited.
            </p>

            <h3 className="text-lg font-bold text-slate-800 mb-2">8.4 Payouts</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Payouts are processed after client payment is fully received.</li>
              <li>Net-30 processing may apply.</li>
              <li>Minimum payout thresholds may apply.</li>
            </ul>
          </section>

          {/* 9. No Guarantees */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. No Guarantees</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              While we aim to deliver measurable improvement, we do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Specific revenue outcomes</li>
              <li>Business growth</li>
              <li>Platform adoption levels</li>
              <li>Operational performance increases</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Business results depend on many external factors beyond our control.
            </p>
          </section>

          {/* 10. Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE.&quot;
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              To the maximum extent permitted by law, we disclaim all warranties, express or implied, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">We do not guarantee uninterrupted or error-free operation.</p>
          </section>

          {/* 11. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              To the maximum extent permitted by applicable law, LeoTheTechGuy shall not be liable for any:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Indirect damages</li>
              <li>Incidental damages</li>
              <li>Special damages</li>
              <li>Consequential damages</li>
              <li>Punitive damages</li>
              <li>Loss of profits</li>
              <li>Loss of data</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Total liability shall not exceed the total amount paid by the client for the specific Services giving rise to the claim during the previous twelve (12) months.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Some jurisdictions may not allow certain limitations. In such cases, liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          {/* 12. Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Indemnification</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You agree to indemnify and hold harmless LeoTheTechGuy from any claims, damages, or losses arising from:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Your misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your breach of agreements with third parties</li>
            </ul>
          </section>

          {/* 13. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Termination</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We may suspend or terminate access to the Service or Partner Network:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>For violation of these Terms</li>
              <li>For fraudulent conduct</li>
              <li>For non-payment</li>
              <li>At our discretion where business risk exists</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">Termination does not relieve payment obligations.</p>
          </section>

          {/* 14. Force Majeure */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Force Majeure</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We are not liable for delays or failure to perform caused by events beyond reasonable control, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Natural disasters</li>
              <li>Internet outages</li>
              <li>Government actions</li>
              <li>War</li>
              <li>Power failures</li>
            </ul>
          </section>

          {/* 15. Governing Law & Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Governing Law &amp; Dispute Resolution</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms shall be governed by the laws of Zimbabwe, without regard to conflict of law principles.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">If you are located outside Zimbabwe, you agree that:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Disputes shall be resolved through binding arbitration or appropriate legal venue as determined by the Company.</li>
              <li>You waive the right to participate in class-action lawsuits.</li>
            </ul>
          </section>

          {/* 16. Severability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">16. Severability</h2>
            <p className="text-slate-600 leading-relaxed">
              If any provision of these Terms is found invalid, the remaining provisions remain enforceable.
            </p>
          </section>

          {/* 17. Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">17. Entire Agreement</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms constitute the entire agreement between you and LeoTheTechGuy regarding use of the Service unless superseded by a separate written agreement.
            </p>
          </section>

          {/* 18. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">18. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to update or modify these Terms at any time. Material updates will be reflected by a revised &quot;Last Updated&quot; date. Continued use of the Service constitutes acceptance of revised Terms.
            </p>
          </section>

          {/* 19. Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">19. Contact Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">For legal inquiries:</p>
            <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="font-semibold text-slate-900">
                Email:{' '}
                <a href="mailto:contact@leothetechguy.com" className="text-blue-600 hover:text-blue-800">
                  contact@leothetechguy.com
                </a>
              </p>
            </div>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-200">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
