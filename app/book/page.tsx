'use client';

import React, { useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, Video, CheckCircle } from 'lucide-react';

export default function BookMeeting() {
  // Initialize Cal.com API
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "secret" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Book a Meeting
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Let's discuss your project, idea, or challenge. Book a 15-20 minute call and we'll explore how I can help bring your vision to life.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="w-6 h-6 text-[#0071e3]" />,
              title: "15-20 Minutes",
              desc: "Quick, focused conversation about your project"
            },
            {
              icon: <Video className="w-6 h-6 text-[#10B981]" />,
              title: "Video Call",
              desc: "Face-to-face discussion via Google Meet"
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
              title: "No Commitment",
              desc: "Free consultation with no strings attached"
            }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="mb-4 p-3 bg-white rounded-xl w-max shadow-sm">{item.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cal.com Embed */}
      <section className="pb-24 px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="p-8 lg:p-12" style={{ minHeight: '800px' }}>
            <Cal 
              namespace="secret"
              calLink="leothetechguy/secret"
              style={{ width: "100%", height: "100%", overflow: "scroll" }}
              config={{ layout: "month_view" }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Common Questions</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">What happens after I book?</h3>
            <p className="text-slate-600">You'll receive a calendar invitation with a Google Meet link. I'll also send you a confirmation email with prep questions.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">Do I need to prepare anything?</h3>
            <p className="text-slate-600">Just come with a clear idea of what you want to build or discuss. The more specific, the better our conversation will be.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2">Can I reschedule or cancel?</h3>
            <p className="text-slate-600">Absolutely! You can reschedule or cancel anytime through the calendar invite or the confirmation email.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
