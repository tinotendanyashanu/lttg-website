import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OnboardingTour from '@/components/OnboardingTour';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import { Partner } from '@/types';
import DashboardShell from '@/components/partner/DashboardShell';
import { CURRENT_TERMS_VERSION } from '@/lib/constants';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/partner/login');
  }

  await dbConnect();
  const partnerDoc = await PartnerModel.findOne({ email: session.user.email }).lean();
  const partner = JSON.parse(JSON.stringify(partnerDoc)) as unknown as Partner;

  if (!partner) {
    redirect('/partner/signup');
  }

  // Legal & Compliance: Block dashboard if terms not accepted or outdated
  if (!partner.termsAccepted || partner.termsVersion !== CURRENT_TERMS_VERSION) {
    redirect('/partner/accept-terms');
  }

  // Email Verification check
  if (!partner.emailVerified) {
    redirect('/partner/verify-email');
  }

  return (
    <>
      <OnboardingTour
        userHasCompleted={partner.hasCompletedOnboarding || false}
        partnerType={partner.partnerType || 'partner'}
      />
      <DashboardShell user={partner} partnerType={partner.partnerType || 'partner'}>
        {children}
      </DashboardShell>
    </>
  );
}
