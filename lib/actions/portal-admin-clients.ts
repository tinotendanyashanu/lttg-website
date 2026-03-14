'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { ActivityLog } from '@/models/ActivityLog';
import Lead from '@/models/Lead';
import { createClientAccount } from '@/lib/actions/client';
import { Account } from '@/models/Account';
import { PasswordSetupToken } from '@/models/PasswordSetupToken';
import { sendEmail, EmailTemplates } from '@/lib/email';
import crypto from 'crypto';

export async function getAdminClients() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  // We fetch leads as proxy for clients in this system
  const clients = await Lead.find()
    .populate('accountId', 'email fullName')
    .sort({ createdAt: -1 })
    .lean();

  return { success: true, clients: JSON.parse(JSON.stringify(clients)) };
}

export async function updateAdminClient(clientId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const client = await Lead.findByIdAndUpdate(clientId, { $set: data }, { new: true });
  if (!client) throw new Error('Client not found');

  await ActivityLog.create({
    caseId: client._id, // Using caseId field for polymorphic logging conceptually
    actorAccountId: account._id,
    actionType: 'client_updated',
  });

  return { success: true };
}

export async function archiveAdminClient(clientId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const client = await Lead.findByIdAndUpdate(clientId, { status: 'closed' }, { new: true });
  if (!client) throw new Error('Client not found');

  await ActivityLog.create({
    caseId: client._id,
    actorAccountId: account._id,
    actionType: 'client_archived',
  });

  return { success: true };
}

export async function createAdminClient(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  const allowedRoles = ['admin', 'employee', 'partner'];
  if (!account || !account.roles.some((r: string) => allowedRoles.includes(r))) {
    throw new Error('Unauthorized');
  }

  const client = await Lead.create({
    ...data,
    status: data.status || 'new',
  });

  await ActivityLog.create({
    caseId: client._id,
    actorAccountId: account._id,
    actionType: 'client_created',
    newValue: client.businessName,
  });

  // Create a portal account for the client and send them a welcome email with login details
  if (data.clientEmail) {
    try {
      await createClientAccount({
        fullName: data.contactName || data.businessName || 'Client',
        email: data.clientEmail,
        phone: data.phone,
        companyName: data.businessName,
      });
    } catch (err: any) {
      // If a portal account with this email already exists, skip silently
      if (!err?.message?.includes('already exists')) {
        console.error('Failed to create portal account for client:', err);
      }
    }
  }

  return { success: true, client: JSON.parse(JSON.stringify(client)) };
}

async function requireAdmin() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');
  return account;
}

async function generatePortalSetupLink(accountId: string, email: string): Promise<string> {
  // Invalidate any existing unused tokens for this account
  await PasswordSetupToken.updateMany(
    { accountId, used: false },
    { $set: { used: true } }
  );
  const token = crypto.randomBytes(48).toString('hex');
  await PasswordSetupToken.create({
    accountId,
    email,
    token,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
  return `${baseUrl}/portal/setup-password?token=${token}`;
}

export async function resetClientPortalPassword(clientId: string) {
  await dbConnect();
  const admin = await requireAdmin();

  const lead = await Lead.findById(clientId).populate('accountId').lean() as any;
  if (!lead) throw new Error('Client not found');
  if (!lead.accountId) throw new Error('This client has no portal account.');

  const account = await Account.findById(lead.accountId._id ?? lead.accountId);
  if (!account) throw new Error('Portal account not found');

  const setupLink = await generatePortalSetupLink(account._id.toString(), account.email);

  await sendEmail({
    to: account.email,
    subject: 'Reset Your Client Portal Password',
    html: EmailTemplates.clientWelcome(account.fullName, setupLink, account.email),
  });

  await ActivityLog.create({
    actorAccountId: admin._id,
    actionType: 'password_reset_by_admin',
    newValue: `Portal password reset link sent to client: ${account.email}`,
  });

  return { success: true };
}

export async function resendClientPortalInvite(clientId: string) {
  await dbConnect();
  const admin = await requireAdmin();

  const lead = await Lead.findById(clientId).populate('accountId').lean() as any;
  if (!lead) throw new Error('Client not found');
  if (!lead.accountId) throw new Error('This client has no portal account.');

  const account = await Account.findById(lead.accountId._id ?? lead.accountId);
  if (!account) throw new Error('Portal account not found');

  const setupLink = await generatePortalSetupLink(account._id.toString(), account.email);

  await sendEmail({
    to: account.email,
    subject: 'Your Client Portal Invitation',
    html: EmailTemplates.clientWelcome(account.fullName, setupLink, account.email),
  });

  await ActivityLog.create({
    actorAccountId: admin._id,
    actionType: 'client_updated',
    newValue: `Portal invite resent to: ${account.email}`,
  });

  return { success: true };
}

export async function createPortalAccountForClient(clientId: string) {
  await dbConnect();
  const admin = await requireAdmin();

  const lead = await Lead.findById(clientId).lean() as any;
  if (!lead) throw new Error('Client not found');
  if (lead.accountId) throw new Error('This client already has a portal account.');

  const email = lead.clientEmail || lead.email;
  if (!email) throw new Error('Client has no email address on record.');

  const result = await createClientAccount({
    fullName: lead.contactName || lead.clientName || lead.businessName || 'Client',
    email,
    phone: lead.phone || lead.clientPhone,
    companyName: lead.businessName,
  });

  // Link the new account back to the lead
  await Lead.findByIdAndUpdate(clientId, { $set: { accountId: result.accountId } });

  await ActivityLog.create({
    actorAccountId: admin._id,
    actionType: 'client_created',
    newValue: `Portal account created for client: ${email}`,
  });

  return { success: true, accountId: result.accountId };
}

export async function toggleClientPortalStatus(clientId: string) {
  await dbConnect();
  const admin = await requireAdmin();

  const lead = await Lead.findById(clientId).populate('accountId').lean() as any;
  if (!lead) throw new Error('Client not found');
  if (!lead.accountId) throw new Error('This client has no portal account.');

  const accountId = lead.accountId._id ?? lead.accountId;
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Portal account not found');

  const newStatus = !account.isActive;
  await Account.findByIdAndUpdate(accountId, { $set: { isActive: newStatus } });

  await ActivityLog.create({
    actorAccountId: admin._id,
    actionType: 'user_updated',
    newValue: `Client portal ${newStatus ? 'activated' : 'suspended'}: ${account.email}`,
  });

  return { success: true, isActive: newStatus };
}
