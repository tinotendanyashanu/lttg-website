import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import PartnerModel from '@/models/Partner';
import PayoutSettingsForm from '@/components/partner/PayoutSettingsForm';
import TierSwitcher from '@/components/partner/TierSwitcher';
import { User, CreditCard, Mail, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { Partner } from '@/types';
import Link from 'next/link';

async function getPartnerSettings(email: string) {
  await dbConnect();
  const partnerDoc = await PartnerModel.findOne({ email }).lean();
  return JSON.parse(JSON.stringify(partnerDoc)) as unknown as Partner;
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const partner = await getPartnerSettings(session.user.email);
  if (!partner) return <div>Partner not found</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your profile and payout information.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-slate-400" />
            Profile Information
          </h3>
          <p className="text-sm text-slate-500 mt-1">Your account details. Contact support to update your name or email.</p>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <User className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-slate-900 font-medium">{partner.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400 mr-3" />
                <span className="text-slate-900 font-medium">{partner.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Partner Tier</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <Award className="h-4 w-4 text-emerald-500 mr-3" />
                <span className="text-slate-900 font-medium capitalize">{partner.tier || 'Referral'} Partner</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Account Status</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                <span className="text-emerald-700 font-medium capitalize">{partner.status || 'Active'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Switching */}
      <TierSwitcher 
        currentTier={partner.tier || 'referral'} 
        isLocked={!!partner.tierLocked} 
      />

      {/* Bank Details Form */}
      <div>
        <div className="flex items-center space-x-2 mb-4 px-1">
             <CreditCard className="h-5 w-5 text-slate-400" />
             <h3 className="text-lg font-bold text-slate-900">Payout Settings</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4 px-1">Select your preferred payout method and ensure your details are complete. (Note: Changes are locked between the 2nd and 5th of each month prior to payouts)</p>
        
        <PayoutSettingsForm partner={partner} />
      </div>

      {/* Legal & Compliance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-emerald-500" />
              Legal & Compliance
            </h3>
            <p className="text-sm text-slate-500 mt-1">Your accepted agreements and compliance status.</p>
          </div>
          <Link href="/legal/affiliate-agreement" className="text-sm text-emerald-600 font-bold hover:underline" target="_blank">
            View Agreement &rarr;
          </Link>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Terms Accepted</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                <span className="text-slate-900 font-medium">Agreement Version {partner.termsVersion || '1.0'}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Date Accepted</label>
              <div className="flex items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-900 font-medium">
                  {partner.termsAcceptedAt 
                    ? new Date(partner.termsAcceptedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) 
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="p-8">
          <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">
            To deactivate your partner account, please contact support at{' '}
            <a href="mailto:contact@leothetechguy.com" className="text-emerald-600 hover:underline">contact@leothetechguy.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
