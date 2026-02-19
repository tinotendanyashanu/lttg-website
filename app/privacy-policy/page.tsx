'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last Updated: February 19, 2026</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-12">

          {/* Intro */}
          <p className="text-slate-600 leading-relaxed">
            At LeoTheTechGuy (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you visit our website, use our services, or participate in our Partner Network.
          </p>
          <p className="text-slate-600 leading-relaxed -mt-8">This policy applies to users worldwide.</p>

          {/* 1. Who We Are */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Who We Are</h2>
            <p className="text-slate-600 leading-relaxed">
              LeoTheTechGuy operates as a technology services brand providing digital systems, platforms, automation solutions, and a Partner Network referral program.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              For purposes of data protection laws, we are the data controller of your personal data unless otherwise stated.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-bold text-slate-800 mb-2">A. Information You Provide Directly</h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              We may collect personal data that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Register for the Partner Network</li>
              <li>Submit a contact form</li>
              <li>Book a consultation</li>
              <li>Subscribe to newsletters</li>
              <li>Download resources</li>
              <li>Enter into a service agreement</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-3">This may include:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-6">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name</li>
              <li>Billing information</li>
              <li>Bank details (for partner payouts)</li>
              <li>Tax identification numbers (if required for payouts)</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-800 mb-2">B. Automatically Collected Information</h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              When you access our website, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Operating system</li>
              <li>Pages visited</li>
              <li>Time spent on pages</li>
              <li>Referring website</li>
              <li>Interaction data</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-6">
              This helps us improve performance, security, and user experience.
            </p>

            <h3 className="text-lg font-bold text-slate-800 mb-2">C. Cookies &amp; Tracking Technologies</h3>
            <p className="text-slate-600 leading-relaxed mb-3">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Enable website functionality</li>
              <li>Analyze traffic</li>
              <li>Track referral links (for Partner Network)</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              You may disable cookies through your browser settings. However, some features may not function properly. Where required by applicable law, we obtain consent before placing non-essential cookies.
            </p>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We use your data to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Provide and manage services</li>
              <li>Process payments and partner commissions</li>
              <li>Manage user accounts</li>
              <li>Respond to inquiries</li>
              <li>Send service-related communications</li>
              <li>Improve our website and offerings</li>
              <li>Detect fraud or misuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-slate-600 leading-relaxed font-medium">We do not sell your personal data.</p>
          </section>

          {/* 4. Legal Bases for Processing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Legal Bases for Processing (Where Applicable)</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              If you are located in the European Economic Area (EEA), UK, or similar jurisdictions, we process personal data based on:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Your consent</li>
              <li>Performance of a contract</li>
              <li>Legal obligation</li>
              <li>Legitimate business interests</li>
            </ul>
          </section>

          {/* 5. Partner Network Data */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Partner Network Data</h2>
            <p className="text-slate-600 leading-relaxed mb-3">If you join our Partner Network, we may collect:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Payment details</li>
              <li>Commission tracking data</li>
              <li>Referral link performance data</li>
              <li>Transaction history</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mb-3">This information is used strictly to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Calculate commissions</li>
              <li>Prevent fraud</li>
              <li>Process payouts</li>
              <li>Maintain financial compliance</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Sensitive financial information is stored securely and is not shared with third-party marketers.
            </p>
          </section>

          {/* 6. Data Sharing & Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Sharing &amp; Disclosure</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We may share your data with:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Payment processors</li>
              <li>Hosting providers</li>
              <li>Email service providers</li>
              <li>Analytics providers</li>
              <li>Legal or regulatory authorities (when required)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              All third-party providers are required to maintain appropriate security and confidentiality. We do not sell or rent personal information.
            </p>
          </section>

          {/* 7. International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. International Data Transfers</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Because we operate globally, your data may be processed in countries outside your jurisdiction.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">Where required by law, we implement safeguards such as:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Standard contractual clauses</li>
              <li>Secure data processing agreements</li>
              <li>Industry-standard encryption practices</li>
            </ul>
          </section>

          {/* 8. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We retain personal data only as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Fulfill contractual obligations</li>
              <li>Comply with legal requirements</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Partner financial records may be retained for tax and compliance purposes.
            </p>
          </section>

          {/* 9. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement commercially reasonable technical and organizational measures to protect personal data. However, no system is 100% secure. Transmission of data is at your own risk.
            </p>
          </section>

          {/* 10. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Restrict processing</li>
              <li>Object to processing</li>
              <li>Withdraw consent</li>
              <li>Request data portability</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              To exercise these rights, contact us at the email below. We may require identity verification before processing requests.
            </p>
          </section>

          {/* 11. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware of such collection, we will take steps to delete the data.
            </p>
          </section>

          {/* 12. Business Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Business Transfers</h2>
            <p className="text-slate-600 leading-relaxed">
              If LeoTheTechGuy is involved in a merger, acquisition, restructuring, or sale of assets, personal data may be transferred as part of that transaction. Users will be notified where required by law.
            </p>
          </section>

          {/* 13. Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Third-Party Links</h2>
            <p className="text-slate-600 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their policies.
            </p>
          </section>

          {/* 14. Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. The &quot;Last Updated&quot; date will reflect the most recent changes. Continued use of the Service after updates constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* 15. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              If you have questions regarding this Privacy Policy or your data:
            </p>
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
