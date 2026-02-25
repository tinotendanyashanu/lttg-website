'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerPartner } from '@/lib/actions/auth';
import Link from 'next/link';
import { useState } from 'react';

const initialState = {
  message: '',
  errors: {},
};

export default function SignupPage() {
  const [state, dispatch] = useActionState(registerPartner, initialState);
  const [partnerType, setPartnerType] = useState('partner');

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
       {/* Left Side - Form */}
       <div className="flex items-center justify-center p-8 bg-white text-slate-900">
        <div className="w-full max-w-sm">
          <Link href="/partner" className="text-slate-400 text-sm hover:text-slate-900 transition-colors mb-8 block">&larr; Back to Partner Home</Link>
          <h1 className="text-3xl font-bold mb-2">Apply for Partnership</h1>
          <p className="text-slate-500 mb-8">Join the network and start earning. Applications are reviewed within 48 hours.</p>
          
          <form action={dispatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Leo Tech"
              />
              {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Partner Type</label>
              <div className="grid grid-cols-1 gap-3">
                <label className="relative flex items-start p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input 
                    type="radio" 
                    name="partnerType" 
                    value="partner" 
                    checked={partnerType === 'partner'}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500" 
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Partner (Manual Referral)</span>
                    <span className="block text-xs text-slate-500 mt-0.5">For Individuals, consultants, agencies, and businesses referring clients directly.</span>
                  </div>
                </label>
                <label className="relative flex items-start p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input 
                    type="radio" 
                    name="partnerType" 
                    value="influencer" 
                    checked={partnerType === 'influencer'}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500" 
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Influencer</span>
                    <span className="block text-xs text-slate-500 mt-0.5">For creators, YouTubers, and social media influencers using referral links.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g. Poland"
                />
                {state?.errors?.country && <p className="text-red-500 text-xs mt-1">{state.errors.country}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="you@company.com"
                />
                {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                minLength={6}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
              {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
            </div>

            {partnerType === 'influencer' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Creator Details (Optional)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Platform</label>
                  <select 
                    name="primaryPlatform" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select Platform</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="blog">Blog / Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profile URL</label>
                  <input 
                    type="url" 
                    name="profileUrl" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="https://"
                  />
                  {state?.errors?.profileUrl && <p className="text-red-500 text-xs mt-1">{state.errors.profileUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Audience Size</label>
                  <select 
                    name="audienceSize" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select Size</option>
                    <option value="under_1k">Under 1,000</option>
                    <option value="1k_10k">1,000 - 10,000</option>
                    <option value="10k_50k">10,000 - 50,000</option>
                    <option value="50k_100k">50,000 - 100,000</option>
                    <option value="over_100k">Over 100,000</option>
                  </select>
                </div>
              </div>
            )}


            {/* Error Message */}
            {state?.message && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
                    {state.message}
                </div>
            )}

            {/* Terms & Conditions Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  value="true"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600 leading-snug">
                  I have read and agree to the{' '}
                  <a
                    href="/legal/affiliate-agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                  >
                    Affiliate Agreement (v1.0)
                  </a>
                </span>
              </label>
              {state?.errors?.termsAccepted && <p className="text-red-500 text-xs mt-1">{state.errors.termsAccepted}</p>}
            </div>

            <SignupButton />
            
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account? <Link href="/partner/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Log in</Link>
            </p>
          </form>
        </div>
      </div>

       {/* Right Side - Vector Visual */}
       <div className="hidden md:flex flex-col items-center justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract Vector Background */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full" viewBox="0 0 800 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Background gradient circles */}
            <circle cx="400" cy="450" r="350" fill="url(#radialGlow)" opacity="0.3" />
            <circle cx="650" cy="200" r="200" fill="url(#radialGlow2)" opacity="0.15" />
            <circle cx="150" cy="700" r="180" fill="url(#radialGlow2)" opacity="0.1" />

            {/* Grid pattern */}
            <g opacity="0.06" stroke="#10b981" strokeWidth="0.5">
              {[...Array(20)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 45} x2="800" y2={i * 45} />
              ))}
              {[...Array(18)].map((_, i) => (
                <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="900" />
              ))}
            </g>

            {/* Floating geometric shapes */}
            <g opacity="0.12">
              <rect x="100" y="120" width="60" height="60" rx="12" stroke="#34d399" strokeWidth="1.5" transform="rotate(15 130 150)" />
              <rect x="600" y="650" width="80" height="80" rx="16" stroke="#6ee7b7" strokeWidth="1.5" transform="rotate(-20 640 690)" />
              <circle cx="680" cy="350" r="30" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="120" cy="500" r="20" stroke="#6ee7b7" strokeWidth="1" />
              <polygon points="350,80 370,120 330,120" stroke="#34d399" strokeWidth="1.5" fill="none" />
              <polygon points="700,500 730,560 670,560" stroke="#6ee7b7" strokeWidth="1.5" fill="none" />
            </g>

            {/* Central partnership illustration */}
            <g transform="translate(400, 360)">
              {/* Connection lines */}
              <g opacity="0.2" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4">
                <line x1="-120" y1="-60" x2="0" y2="-120" />
                <line x1="120" y1="-60" x2="0" y2="-120" />
                <line x1="-120" y1="-60" x2="120" y2="-60" />
                <line x1="-120" y1="-60" x2="-60" y2="60" />
                <line x1="120" y1="-60" x2="60" y2="60" />
                <line x1="-60" y1="60" x2="60" y2="60" />
              </g>

              {/* Network nodes */}
              <g>
                {/* Top node - main */}
                <circle cx="0" cy="-120" r="28" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                <circle cx="0" cy="-120" r="14" fill="#10b981" opacity="0.3" />
                <path d="M-6,-126 L0,-114 L6,-126" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Left node */}
                <circle cx="-120" cy="-60" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <rect x="-130" y="-66" width="20" height="12" rx="3" fill="#10b981" opacity="0.3" />

                {/* Right node */}
                <circle cx="120" cy="-60" r="22" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <circle cx="120" cy="-60" r="8" fill="#10b981" opacity="0.3" />

                {/* Bottom left */}
                <circle cx="-60" cy="60" r="18" fill="#064e3b" stroke="#6ee7b7" strokeWidth="1.5" />
                
                {/* Bottom right */}
                <circle cx="60" cy="60" r="18" fill="#064e3b" stroke="#6ee7b7" strokeWidth="1.5" />
              </g>

              {/* Handshake icon in center */}
              <g transform="translate(0, -20)">
                <circle cx="0" cy="0" r="40" fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <path d="M-14,-6 C-14,-6 -8,-12 0,-12 C8,-12 14,-6 14,-6" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M-14,6 C-14,6 -8,12 0,12 C8,12 14,6 14,6" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <line x1="-14" y1="-6" x2="-14" y2="6" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="-6" x2="14" y2="6" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Pulse rings */}
              <circle cx="0" cy="-20" r="55" stroke="#10b981" strokeWidth="0.5" opacity="0.15" />
              <circle cx="0" cy="-20" r="75" stroke="#10b981" strokeWidth="0.5" opacity="0.08" />
            </g>

            {/* Floating particles */}
            <g opacity="0.3">
              <circle cx="200" cy="200" r="3" fill="#34d399" />
              <circle cx="550" cy="150" r="2" fill="#6ee7b7" />
              <circle cx="650" cy="450" r="2.5" fill="#34d399" />
              <circle cx="180" cy="650" r="2" fill="#6ee7b7" />
              <circle cx="450" cy="750" r="3" fill="#34d399" />
              <circle cx="300" cy="300" r="1.5" fill="#6ee7b7" />
              <circle cx="500" cy="550" r="2" fill="#34d399" />
              <circle cx="350" cy="600" r="1.5" fill="#6ee7b7" />
            </g>

            {/* Gradients */}
            <defs>
              <radialGradient id="radialGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="radialGlow2" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-md mt-auto">
          <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-md">Build with us.</h2>
          <ul className="space-y-4">
            <li className="flex items-center text-emerald-100 drop-shadow-sm">
                <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-4 text-white font-bold shadow-lg">1</span>
                Submit your application
            </li>
            <li className="flex items-center text-emerald-100 drop-shadow-sm">
                <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-4 text-white font-bold shadow-lg">2</span>
                Get approved within 48h
            </li>
            <li className="flex items-center text-emerald-100 drop-shadow-sm">
                <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-4 text-white font-bold shadow-lg">3</span>
                Access dashboard & resources
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting Application...' : 'Submit Application'}
    </button>
  );
}
