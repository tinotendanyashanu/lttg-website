import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import { Case } from '@/models/Case';
import Link from 'next/link';
import SubmitCaseClient from '@/components/portal/case-management/SubmitCaseClient';

export default async function SubmitLeadPage() {
  const session = await getSessionWithDevBypass();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const account = await getAccountByEmail(session.user.email);
  if (!account || (!account.roles.includes('intern') && !account.roles.includes('employee') && !account.roles.includes('admin'))) {
    redirect('/portal');
  }

  const isAdmin = account.roles.includes('admin');

  async function submitLeadAction(formData: FormData, confirmDuplicate: boolean, adminOverride: boolean) {
    'use server';

    const session = await getSessionWithDevBypass();
    if (!session?.user?.email) return { error: 'Unauthorized' };

    const account = await getAccountByEmail(session.user.email);
    if (!account) return { error: 'Account not found' };

    const isAdminServer = account.roles.includes('admin');

    const businessName = formData.get('businessName') as string;
    const contactName = formData.get('contactName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const industry = formData.get('industry') as string;
    const location = formData.get('location') as string;
    const serviceInterest = formData.get('serviceInterest') as string;
    const urgencyLevel = formData.get('urgencyLevel') as string;
    const source = formData.get('source') as string;
    const notes = formData.get('notes') as string;
    const dealValueStr = formData.get('dealValue') as string;
    const dealValue = dealValueStr ? parseFloat(dealValueStr) : 0;

    if (!contactName || !email || !phone || !serviceInterest) {
      return { error: 'Missing required fields' };
    }

    await dbConnect();

    // Check for existing client
    const existingCases = await Case.find({ phone });

    if (existingCases.length > 0) {
      const activeSameServiceCase = existingCases.find(
        (c: any) => c.status !== 'closed' && c.serviceInterest === serviceInterest
      );

      if (activeSameServiceCase) {
        if (!adminOverride || !isAdminServer) {
          const serviceLabel = (serviceInterest || '').replace('_', ' ');
          return { 
            blocked: true, 
            message: `There is already an active case for ${serviceLabel} for this client.` 
          };
        }
      } else if (!confirmDuplicate) {
        const clientName = existingCases[0].businessName || existingCases[0].contactName || 'Unnamed Client';
        return {
          promptDuplicate: true,
          clientName,
          count: existingCases.length
        };
      }
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const count = await Case.countDocuments();
    const paddedNumber = String(count + 1).padStart(6, '0');
    const caseId = `CA${paddedNumber}${year}`;

    await Case.create({
      caseId,
      businessName,
      contactName,
      email,
      phone,
      industry,
      location,
      serviceInterest,
      urgencyLevel,
      source,
      notes,
      dealValue,
      status: 'new',
      ownerId: account._id,
      participants: [account._id],
      teamId: account.teamId
    });

    return { success: true };
  }

  return <SubmitCaseClient submitCaseAction={submitLeadAction} isAdmin={isAdmin} />;
}
