'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, Mail, Trash2, Clock, ShieldAlert } from 'lucide-react';

export default function DataDeletion() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Data Deletion Policy</h1>
        <p className="text-slate-500 mb-12">Last Updated: May 14, 2026</p>

        <div className="prose prose-slate prose-lg max-w-none space-y-12">
          <section>
            <p className="text-slate-600 leading-relaxed">
              At LeoTheTechGuy, we respect your right to privacy and are committed to giving you control over your personal data. In compliance with global data protection regulations including <strong>GDPR</strong> (General Data Protection Regulation), <strong>CCPA</strong> (California Consumer Privacy Act), and others, we provide a clear process for you to request the deletion of your personal information.
            </p>
          </section>

          <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Trash2 className="text-red-500" />
              How to Request Data Deletion
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              You can request the deletion of your account and all associated personal data at any time. To initiate this process, please follow the steps below:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">Send an Email</h4>
                  <p className="text-slate-600">Email us at <a href="mailto:leo@leothetechguy.com" className="text-blue-600 font-medium">leo@leothetechguy.com</a> with the subject line &quot;Data Deletion Request&quot;.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Verify Identity</h4>
                  <p className="text-slate-600">For your security, we will ask you to verify your identity from the email address associated with your account.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Confirmation</h4>
                  <p className="text-slate-600">Once verified, we will process your request and confirm via email once the deletion is complete.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-slate-100 p-6 rounded-xl">
              <Clock className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Timeline</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Most requests are processed within 7 business days. Under GDPR, we may take up to 30 days for complex requests, but we always aim for speed.
              </p>
            </div>
            <div className="border border-slate-100 p-6 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">What is Deleted?</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We remove your name, email, contact details, and account preferences. Anonymous usage data may be retained for analytical purposes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Exceptions to Deletion</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In certain cases, we may be legally required to retain specific information. These exceptions include:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Financial Records:</strong> Transaction history and invoices must be kept for tax and audit purposes as required by law.</li>
              <li><strong>Legal Obligations:</strong> Compliance with local and international laws or to defend legal claims.</li>
              <li><strong>Security:</strong> Data necessary to detect and prevent fraudulent or illegal activity.</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm mb-6">
              Have questions about your data? Read our <Link href="/privacy" className="text-blue-600 font-medium">Privacy Policy</Link>.
            </p>
            <Link href="/" className="inline-flex items-center text-slate-900 font-medium hover:text-blue-600 transition-colors">
              Return to Home
            </Link>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
