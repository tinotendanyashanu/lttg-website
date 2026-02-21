'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { completeOnboarding } from '@/lib/actions/partner'; 

const standardSteps = [
  {
    title: "Welcome to your Partner Dashboard",
    description: "This is your command center. Track your referrals, earnings, and progress all in one place.",
    target: "/partner/dashboard", 
  },
  {
    title: "Track Your Deals",
    description: "Register new leads and monitor their status in real-time under the 'Recent Deals' section.",
    target: "/partner/dashboard/deals", 
  },
  {
    title: "Partner Academy",
    description: "Level up your skills and unlock higher commission tiers by completing courses in the Academy.",
    target: "/partner/dashboard/academy",
  },
  {
    title: "Commission & Payouts",
    description: "View your earnings breakdown and payout history in the Earnings tab.",
    target: "/partner/dashboard/earnings",
  }
];

const creatorSteps = [
  {
    title: "Welcome Content Creator",
    description: "Your dashboard is optimized for content-driven growth. Track clicks, leads, and commissions.",
    target: "/partner/dashboard", 
  },
  {
    title: "Get Your Link",
    description: "Copy your unique referral link from the Overview page and start sharing it with your audience.",
    target: "/partner/dashboard", 
  },
  {
    title: "Track Leads",
    description: "See exactly who signed up through your link in the Leads tab.",
    target: "/partner/dashboard/leads", 
  },
  {
    title: "Academy & Resources",
    description: "Learn how to optimize your content for conversion in our Creator Academy.",
    target: "/partner/dashboard/academy", 
  }
];

export default function OnboardingTour({ userHasCompleted, partnerType = 'standard' }: { userHasCompleted: boolean, partnerType?: 'standard' | 'creator' }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const steps = partnerType === 'creator' ? creatorSteps : standardSteps;

  useEffect(() => {
    setMounted(true);
    if (userHasCompleted) {
        localStorage.removeItem('tour_step');
        localStorage.removeItem('tour_active');
        return;
    }

    const savedStep = localStorage.getItem('tour_step');
    const isActive = localStorage.getItem('tour_active');

    if (savedStep) {
        setCurrentStep(parseInt(savedStep));
        setIsVisible(true);
    } else if (!isActive) {
        // Start tour if not explicitly dismissed/completed
        const timer = setTimeout(() => {
            setIsVisible(true);
            localStorage.setItem('tour_active', 'true');
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [userHasCompleted]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem('tour_step', nextStep.toString());
      router.push(steps[nextStep].target);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsVisible(false);
    localStorage.removeItem('tour_step');
    localStorage.removeItem('tour_active');
    await completeOnboarding();
  };
  
  const handleDismiss = () => {
      setIsVisible(false);
      localStorage.removeItem('tour_step');
      localStorage.removeItem('tour_active');
      // We don't mark as complete on server, so it might reappear next session 
      // or we can mark complete if dismiss counts as "done"
      completeOnboarding(); 
  };

  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-100 w-full max-w-[360px] md:max-w-sm"
        >
          <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative">
            {/* Elegant top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-indigo-500" />
            
            <div className="p-6">
              <button 
                onClick={handleDismiss}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-1"
                aria-label="Dismiss tour"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="mb-3">
                <span className="text-xs font-bold tracking-widest text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-md">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 pr-6">
                {steps[currentStep].title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {steps[currentStep].description}
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep 
                          ? 'w-5 bg-purple-600' 
                          : 'w-1.5 bg-slate-200'
                      }`} 
                    />
                  ))}
                </div>
                
                <button 
                  onClick={handleNext}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 active:scale-95 group"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep === steps.length - 1 ? (
                    <Check className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
