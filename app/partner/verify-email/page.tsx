import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ResendButton from './ResendButton';

export default async function VerifyEmailPromptPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/partner/login');
  }

  await dbConnect();
  const partner = await PartnerModel.findOne({ email: session.user.email }).lean();

  if (!partner) {
    redirect('/partner/login');
  }

  // If already verified, allow them to enter the dashboard
  if (partner.emailVerified) {
    redirect('/partner/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-600 mb-8">
          We&apos;ve sent a verification link to <span className="font-semibold text-slate-800">{partner.email}</span>. 
          Please click the link to verify your account and access your dashboard.
        </p>

        <div className="space-y-4">
          <ResendButton />
          <p className="text-sm text-slate-500 mt-4">
            If you didn&apos;t receive the email, please check your spam folder or contact support if the issue persists.
          </p>
          <div className="pt-4 mt-6 border-t border-slate-100">
            {/* For now just a sign out link if they are stuck */}
            <Link href="/api/auth/signout" className="text-emerald-600 font-medium hover:text-emerald-700 text-sm">
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
