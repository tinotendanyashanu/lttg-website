export interface PartnerProgress {
  courseId: string;
  completedLessons: string[];
  progressPercentage: number;
  isCompleted: boolean;
  examScore?: number;
  examAttempts?: number;
}

export interface Partner {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
  role: 'partner' | 'admin';
  partnerType: 'standard' | 'creator';
  tier: 'referral' | 'agency' | 'enterprise' | 'creator';
  referralCode?: string;
  status: 'active' | 'suspended' | 'pending';
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    sortCode?: string;
    iban?: string;
  };
  stats: {
    totalReferredRevenue: number;
    totalCommissionEarned: number;
    pendingCommission: number;
    paidCommission: number;
    paidDealsSinceLastPayout: number;
    referralClicks: number;
    referralLeads: number;
  };
  hasReceivedAcademyBonus: boolean;
  hasCompletedOnboarding: boolean;
  partnerProgress: PartnerProgress[];
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  _id: string;
  partnerId: string;
  clientName: string;
  estimatedValue: number;
  finalValue?: number;
  commissionRate: number;
  commissionAmount?: number;
  dealStatus: 'registered' | 'under_review' | 'approved' | 'closed' | 'rejected';
  paymentStatus: 'pending' | 'received' | 'commission_paid';
  paymentMethod?: 'cash' | 'bank_transfer' | 'stripe' | 'other';
  serviceType: 'SME' | 'Startup' | 'Enterprise' | 'Individual';
  notes?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  title: string;
  slug: string;
  content: string;
  duration: string;
  videoUrl?: string;
  imageUrls?: string[];
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'sales' | 'marketing' | 'product' | 'technical';
  targetAudience: ('standard' | 'creator' | 'all')[];
  lessons: Lesson[];
  exam?: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    passingScore: number;
  };
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  _id: string;
  partnerId: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  method: 'bank_transfer' | 'manual';
  reference?: string;
  processedAt?: string;
  dealIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
