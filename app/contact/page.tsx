'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Twitter, Youtube, Send, Loader2, CheckCircle, AlertCircle, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInitiative, setShowCustomInitiative] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    let initiative = formData.get('initiative');
    if (initiative === 'other') {
      initiative = formData.get('custom_initiative');
    }

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      project: formData.get('project'),
      initiative: initiative,
      timeline: formData.get('timeline'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/project-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Let&apos;s Talk
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Share your goals and I&apos;ll respond with clarity. Every engagement begins with a conversation.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Form */}
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-slate-200/60">
            
            {success ? (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h2>
                <p className="text-lg text-slate-600 mb-8">
                  Thanks for reaching out. I&apos;ll get back to you shortly. <br/>
                  In the meantime, check out my content!
                </p>
                
                <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
                  <a href="https://youtube.com/@LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-[#FF0000] text-white rounded-xl font-semibold hover:bg-[#D90000] transition-all shadow-lg shadow-red-500/20 group transform hover:-translate-y-1">
                    <Youtube className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Subscribe on YouTube
                  </a>
                  <a href="https://x.com/LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-slate-900 transition-all shadow-lg shadow-black/20 group transform hover:-translate-y-1">
                    <Twitter className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Follow on X
                  </a>
                  <a href="https://instagram.com/Leothetechguy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/20 group transform hover:-translate-y-1">
                    <Instagram className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Follow on Instagram
                  </a>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 mb-8">Send a Message</h2>
                
                {error && (
                  <div className="mb-6 p-4 rounded-xl flex items-start bg-red-50 text-red-800 border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                      <input type="text" id="name" name="name" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input type="email" id="email" name="email" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-2">What do you want to build?</label>
                    <input type="text" id="project" name="project" required className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all" placeholder="Web App, AI Tool, Automation..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="initiative" className="block text-sm font-medium text-slate-700 mb-2">Initiative Type</label>
                      <select 
                        id="initiative" 
                        name="initiative" 
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                        onChange={(e) => setShowCustomInitiative(e.target.value === 'other')}
                      >
                        <option value="">What type of initiative?</option>
                        <option value="focused">Focused Project</option>
                        <option value="growth">Growth Initiative</option>
                        <option value="upgrade">System Upgrade</option>
                        <option value="partnership">Long-Term Partnership</option>
                        <option value="enterprise">Enterprise-Level Transformation</option>
                        <option value="other">Other</option>
                      </select>
                      {showCustomInitiative && (
                        <input 
                          type="text" 
                          name="custom_initiative" 
                          placeholder="Please specify..." 
                          className="mt-3 w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all animate-in fade-in slide-in-from-top-2"
                        />
                      )}
                    </div>
                    <div>
                      <label htmlFor="timeline" className="block text-sm font-medium text-slate-700 mb-2">Timeline</label>
                      <select id="timeline" name="timeline" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all">
                        <option value="">When do you need it?</option>
                        <option value="asap">ASAP</option>
                        <option value="1month">Within 1 month</option>
                        <option value="3months">1-3 months</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea id="message" name="message" required rows={4} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all resize-none" placeholder="Tell me more about your project..."></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-[#0071e3] rounded-full shadow-lg shadow-blue-500/20 hover:bg-[#0077ED] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>

                </form>
              </>
            )}
          </div>

          {/* Direct Contact Info */}
          <div className="space-y-12 lg:pt-12">
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Direct Contact</h3>
              <div className="space-y-6">
                <a href="mailto:contact@leothetechguy.com" className="flex items-center group">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-[#0071e3] transition-colors">
                    <Mail className="w-5 h-5 text-[#0071e3] group-hover:text-white transition-colors" />
                  </div> 
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                    <p className="text-lg text-slate-900 font-medium">contact@leothetechguy.com</p>
                  </div>
                </a>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Location</p>
                    <p className="text-lg text-slate-900 font-semibold">Warsaw, Poland<br />Serving clients worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Socials</h3>
              <div className="flex gap-4">
                <a href="https://x.com/LeoTheTechGuy" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-black hover:border-black hover:text-white text-slate-400 transition-all duration-300" aria-label="Follow on X">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/Leothetechguy" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:via-pink-500 hover:to-purple-600 hover:text-white text-slate-400 transition-all duration-300" aria-label="Follow on Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://facebook.com/Leothetechguy" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white text-slate-400 transition-all duration-300" aria-label="Follow on Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.youtube.com/@LeoTheTechGuy" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white text-slate-400 transition-all duration-300" aria-label="Follow on YouTube">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Before you message...</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">How fast can you start?</h3>
              <p className="text-slate-600">I usually book 2-3 weeks in advance. Message me to check current availability.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
