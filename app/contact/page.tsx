'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Linkedin, Github, MessageCircle, Send, Loader2, CheckCircle, AlertCircle, Youtube } from 'lucide-react';
import { submitContactForm, ContactState } from '../actions';

const initialState: ContactState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white bg-[#0071e3] rounded-full shadow-lg shadow-blue-500/20 hover:bg-[#0077ED] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
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
  );
}

export default function Contact() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Let’s Talk
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-normal">
            Have a project in mind? Want to collaborate? Need guidance? Or just want to discuss an idea? I’m open to it. I reply fast, and I’m easy to talk to.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Form */}
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-slate-200/60">
            
            {state.success ? (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h2>
                <p className="text-lg text-slate-600 mb-8">
                  Thanks for reaching out. I'll get back to you shortly. <br/>
                  In the meantime, check out my content!
                </p>
                
                <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
                  <a href="https://youtube.com/@LeoTheTechGuy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-[#FF0000] text-white rounded-xl font-semibold hover:bg-[#D90000] transition-all shadow-lg shadow-red-500/20 group transform hover:-translate-y-1">
                    <Youtube className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Subscribe on YouTube
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-[#0077B5] text-white rounded-xl font-semibold hover:bg-[#006396] transition-all shadow-lg shadow-blue-500/20 group transform hover:-translate-y-1">
                    <Linkedin className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Connect on LinkedIn
                  </a>
                   <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-6 py-4 bg-[#24292e] text-white rounded-xl font-semibold hover:bg-[#1b1f23] transition-all shadow-lg shadow-gray-500/20 group transform hover:-translate-y-1">
                    <Github className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Follow on GitHub
                  </a>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 mb-8">Send a Message</h2>
                
                {state.message && (
                  <div className={`mb-6 p-4 rounded-xl flex items-start ${state.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {state.success ? <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />}
                    <p>{state.message}</p>
                  </div>
                )}

                <form action={formAction} className="space-y-6">
                  
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
                      <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-2">Budget (optional)</label>
                      <select id="budget" name="budget" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all">
                        <option value="">Select a range</option>
                        <option value="small">&lt; $1k</option>
                        <option value="medium">$1k - $5k</option>
                        <option value="large">$5k - $10k</option>
                        <option value="enterprise">$10k+</option>
                      </select>
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

                  <SubmitButton />

                </form>
              </>
            )}
          </div>

          {/* Direct Contact Info */}
          <div className="space-y-12 lg:pt-12">
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Direct Contact</h3>
              <div className="space-y-6">
                <a href="mailto:tinotendanyash@gmail.com" className="flex items-center group">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-[#0071e3] transition-colors">
                    <Mail className="w-5 h-5 text-[#0071e3] group-hover:text-white transition-colors" />
                  </div> 
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                    <p className="text-lg text-slate-900 font-medium">admin@LeoTheTechGuy.com</p>
                  </div>
                </a>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Location</p>
                    <p className="text-lg text-slate-900 font-semibold">Binary</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Socials</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-[#0077B5] hover:border-[#0077B5] hover:text-white text-slate-400 transition-all duration-300">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-black hover:border-black hover:text-white text-slate-400 transition-all duration-300">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] hover:text-white text-slate-400 transition-all duration-300">
                  <MessageCircle className="w-6 h-6" />
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
              <h3 className="font-bold text-slate-900 mb-2">What is your typical budget range?</h3>
              <p className="text-slate-600">Most projects start at $5k. Small tools can be less, large platforms are more.</p>
            </div>
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
