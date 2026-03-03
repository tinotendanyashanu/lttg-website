import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Link from 'next/link';

export default async function SubmitLeadPage() {
  const session = await getSessionWithDevBypass();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('intern')) {
    redirect('/portal');
  }

  async function submitLead(formData: FormData) {
    'use server';

    const session = await getSessionWithDevBypass();
    if (!session?.user?.email) return redirect('/login');

    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('intern')) return redirect('/portal');

    const businessName = formData.get('businessName') as string;
    const contactName = formData.get('contactName') as string;
    const phone = formData.get('phone') as string;
    const serviceInterest = formData.get('serviceInterest') as string;
    const notes = formData.get('notes') as string;

    if (!businessName || !contactName || !phone || !serviceInterest) {
      throw new Error('Missing required fields');
    }

    await dbConnect();
    await Lead.create({
      accountId: account._id,
      businessName,
      contactName,
      phone,
      serviceInterest,
      notes,
      status: 'new'
    });

    redirect('/portal');
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8 relative">
        <Link 
          href="/portal" 
          className="inline-flex items-center text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
          &larr; Back to Portal
        </Link>
        <div className="relative group">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl" />
          <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-neutral-400 mb-8">
              Submit New Lead
            </h1>
            
            <form action={submitLead} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-neutral-300 mb-2">Business Name</label>
                  <input 
                    type="text" 
                    id="businessName" 
                    name="businessName" 
                    required 
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                    placeholder="E.g., Acme Corp"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-neutral-300 mb-2">Contact Name</label>
                    <input 
                      type="text" 
                      id="contactName" 
                      name="contactName" 
                      required 
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      required 
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceInterest" className="block text-sm font-medium text-neutral-300 mb-2">Service Interest</label>
                  <select 
                    id="serviceInterest" 
                    name="serviceInterest" 
                    required 
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner cursor-pointer"
                  >
                    <option value="" className="bg-neutral-900">Select a service...</option>
                    <option value="software_development" className="bg-neutral-900">Software Development</option>
                    <option value="cloud_infrastructure" className="bg-neutral-900">Cloud Infrastructure</option>
                    <option value="design" className="bg-neutral-900">UI/UX Design</option>
                    <option value="consulting" className="bg-neutral-900">Consulting</option>
                    <option value="other" className="bg-neutral-900">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-neutral-300 mb-2">Notes (Optional)</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    rows={4}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner"
                    placeholder="Any additional details about this lead..."
                  ></textarea>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Submit Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
