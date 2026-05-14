'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last Updated: May 14, 2026</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-12">

          {/* Intro */}
          <section>
            <p className="text-slate-600 leading-relaxed">
              At LeoTheTechGuy (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, disclose, and safeguard your information when you visit our website, use our services, or participate in our Partner Network.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              This policy is designed to comply with global data protection standards, including the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA)</strong>, and other applicable privacy laws worldwide.
            </p>
          </section>

          {/* 1. Who We Are */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="text-blue-600" />
              1. Who We Are
            </h2>
            <p className="text-slate-600 leading-relaxed">
              LeoTheTechGuy operates as a technology services brand providing digital systems, platforms, automation solutions, and a Partner Network referral program.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              For purposes of data protection laws, we are the data controller of your personal data unless otherwise stated.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="text-blue-600" />
              2. Information We Collect
            </h2>

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
            <p className="text-slate-600 leading-relaxed mb-3">This may include: Name, email address, phone number, company name, billing information, and bank details (for partner payouts).</p>

            <h3 className="text-lg font-bold text-slate-800 mb-2 mt-6">B. Automatically Collected Information</h3>
            <p className="text-slate-600 leading-relaxed mb-3">
              When you access our website, we may automatically collect technical data such as IP address, browser type, device type, operating system, and interaction data. This helps us improve performance, security, and user experience.
            </p>

            <h3 className="text-lg font-bold text-slate-800 mb-2 mt-6">C. Cookies & Tracking Technologies</h3>
            <p className="text-slate-600 leading-relaxed">
              We use cookies to enable website functionality, analyze traffic, and track referral links. You may disable cookies through your browser settings, though some features may not function properly.
            </p>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="text-blue-600" />
              3. How We Use Your Information
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">We use your data to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Provide and manage services</li>
              <li>Process payments and partner commissions</li>
              <li>Manage user accounts and respond to inquiries</li>
              <li>Send service-related communications</li>
              <li>Detect fraud and comply with legal obligations</li>
            </ul>
            <p className="text-slate-900 font-bold bg-blue-50 p-4 rounded-xl border border-blue-100 inline-block">
              We do not sell your personal data.
            </p>
          </section>

          {/* 4. Legal Bases for Processing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Legal Bases for Processing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              If you are located in the EEA, UK, or similar jurisdictions, we process personal data based on: Consent, Performance of a contract, Legal obligation, or Legitimate business interests.
            </p>
          </section>

          {/* 5. Data Sharing & Disclosure */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing & Disclosure</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We may share your data with trusted third-party providers such as:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
              <li>Payment processors (Stripe)</li>
              <li>Hosting providers and Email service providers</li>
              <li>Legal or regulatory authorities (when required)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              All third-party providers are required to maintain appropriate security and confidentiality.
            </p>
          </section>

          {/* 6. Data Retention & Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="text-blue-600" />
              6. Your Global Privacy Rights
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Depending on your jurisdiction, you have the right to:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
              <li className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm"><strong>Access:</strong> Request a copy of your data.</li>
              <li className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm"><strong>Rectification:</strong> Correct inaccurate information.</li>
              <li className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm"><strong>Deletion:</strong> Request that we erase your data.</li>
              <li className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm"><strong>Portability:</strong> Move your data to another service.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-6">
              To exercise these rights, including data deletion, please visit our <Link href="/data-deletion" className="text-blue-600 font-medium">Data Deletion page</Link> or contact us at the email below.
            </p>
          </section>

          {/* 7. International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. International Data Transfers</h2>
            <p className="text-slate-600 leading-relaxed">
              Because we operate globally, your data may be processed in countries outside your jurisdiction. We implement safeguards such as standard contractual clauses to ensure your data remains protected.
            </p>
          </section>

          {/* 8. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard technical and organizational measures to protect personal data. However, no system is 100% secure, and transmission of data is at your own risk.
            </p>
          </section>

          {/* 9. Contact Us */}
          <section className="bg-slate-900 text-white p-8 rounded-[2rem]">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              If you have questions regarding this Privacy Policy or your data:
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Email</p>
                <a href="mailto:leo@leothetechguy.com" className="text-xl font-medium hover:text-blue-400 transition-colors">
                  leo@leothetechguy.com
                </a>
              </div>
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
