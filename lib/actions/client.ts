'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

async function getClientSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    throw new Error('Unauthorized');
  }
  return session;
}

// ─── Onboarding / Password Setup ──────────────────────────────────────────────

export async function setupClientPassword(prevState: unknown, formData: FormData) {
  const token = formData.get('token');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!token || typeof token !== 'string') return { message: 'Invalid token.' };
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { message: 'Password must be at least 8 characters.' };
  }
  if (password !== confirmPassword) return { message: 'Passwords do not match.' };

  await dbConnect();
  const { PasswordSetupToken } = await import('@/models/PasswordSetupToken');
  const { Account } = await import('@/models/Account');

  const tokenDoc = await PasswordSetupToken.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return { message: 'Invalid or expired token. Please request a new invitation.' };
  }

  const account = await Account.findById(tokenDoc.accountId);
  if (!account) return { message: 'Account not found.' };

  const passwordHash = await bcrypt.hash(password, 12);
  await Account.updateOne(
    { _id: account._id },
    { $set: { passwordHash, isActive: true, passwordSetupRequired: false } }
  );
  await PasswordSetupToken.updateOne(
    { _id: tokenDoc._id },
    { $set: { used: true } }
  );

  try {
    await sendEmail({
      to: account.email,
      subject: 'Your Client Portal is Ready',
      html: EmailTemplates.clientPasswordSetupConfirmation(account.fullName),
    });
  } catch (_) {}

  return { success: true };
}

export async function createClientAccount(data: {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
}) {
  await dbConnect();
  const { Account } = await import('@/models/Account');

  const existing = await Account.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('An account with this email already exists.');

  const tempHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

  const account = await Account.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    passwordHash: tempHash,
    roles: ['client'],
    phoneNumber: data.phone,
    clientProfile: { companyName: data.companyName },
    isActive: false,
    passwordSetupRequired: true,
  });

  const token = crypto.randomBytes(48).toString('hex');
  const { PasswordSetupToken } = await import('@/models/PasswordSetupToken');
  await PasswordSetupToken.create({
    accountId: account._id,
    email: account.email,
    token,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
  const setupLink = `${baseUrl}/portal/setup-password?token=${token}`;

  await sendEmail({
    to: account.email,
    subject: 'Welcome to Your LeoTheTechGuy Client Portal',
    html: EmailTemplates.clientWelcome(account.fullName, setupLink),
  });

  return { success: true, accountId: account._id.toString() };
}

// ─── Dashboard Data ────────────────────────────────────────────────────────────

export async function getClientDashboardData() {
  const session = await getClientSession();
  await dbConnect();

  const { ClientCase } = await import('@/models/ClientCase');
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientNotification } = await import('@/models/ClientNotification');

  const clientId = session.user.id;

  const [activeCases, openTickets, unpaidInvoices, unreadMessages, unreadNotifications, recentActivity] =
    await Promise.all([
      ClientCase.find({ clientId, status: { $nin: ['resolved', 'closed'] } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      SupportTicket.countDocuments({
        clientId,
        status: { $in: ['open', 'in_progress', 'waiting_client'] },
      }),
      ClientInvoice.find({ clientId, status: { $in: ['issued', 'sent', 'overdue'] } })
        .sort({ dueAt: 1 })
        .limit(3)
        .lean(),
      MessageThread.countDocuments({ clientId, unreadByClient: { $gt: 0 } }),
      ClientNotification.countDocuments({ clientId, read: false }),
      ClientNotification.find({ clientId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

  return {
    activeCases: JSON.parse(JSON.stringify(activeCases)),
    openTickets,
    unpaidInvoices: JSON.parse(JSON.stringify(unpaidInvoices)),
    unreadMessages,
    unreadNotifications,
    recentActivity: JSON.parse(JSON.stringify(recentActivity)),
  };
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export async function getClientCases() {
  const session = await getClientSession();
  await dbConnect();
  const { ClientCase } = await import('@/models/ClientCase');
  const cases = await ClientCase.find({ clientId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(cases));
}

export async function getClientCase(caseId: string) {
  const session = await getClientSession();
  await dbConnect();
  const { ClientCase } = await import('@/models/ClientCase');
  const clientCase = await ClientCase.findOne({
    _id: caseId,
    clientId: session.user.id,
  }).lean();
  if (!clientCase) return null;
  return JSON.parse(JSON.stringify(clientCase));
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export async function getClientEvidence(caseId?: string) {
  const session = await getClientSession();
  await dbConnect();
  const { ClientEvidence } = await import('@/models/ClientEvidence');
  const query: Record<string, unknown> = { clientId: session.user.id };
  if (caseId) query.caseId = caseId;
  const evidence = await ClientEvidence.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(evidence));
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function getClientTickets() {
  const session = await getClientSession();
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const tickets = await SupportTicket.find({ clientId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(tickets));
}

export async function createSupportTicket(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  const subject = formData.get('subject') as string;
  const description = formData.get('description') as string;
  const priority = (formData.get('priority') as string) || 'medium';
  const category = (formData.get('category') as string) || 'general';
  const caseId = formData.get('caseId') as string | null;

  if (!subject || !description) {
    return { error: 'Subject and description are required.' };
  }

  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');

  const count = await SupportTicket.countDocuments();
  const ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;

  await SupportTicket.create({
    ticketId,
    clientId: session.user.id,
    subject,
    description,
    priority,
    category,
    caseId: caseId || undefined,
    status: 'open',
  });

  revalidatePath('/portal/client/tickets');
  return { success: true, ticketId };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessageThreads() {
  const session = await getClientSession();
  await dbConnect();
  const { MessageThread } = await import('@/models/MessageThread');
  const threads = await MessageThread.find({ clientId: session.user.id })
    .sort({ lastMessageAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(threads));
}

export async function getThreadMessages(threadId: string) {
  const session = await getClientSession();
  await dbConnect();
  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');

  const thread = await MessageThread.findOne({
    _id: threadId,
    clientId: session.user.id,
  });
  if (!thread) return null;

  const messages = await ClientMessage.find({ threadId }).sort({ createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(messages));
}

export async function sendClientMessage(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  const threadId = formData.get('threadId') as string;
  const content = formData.get('content') as string;
  if (!content?.trim()) return { error: 'Message cannot be empty.' };

  await dbConnect();
  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');
  const { Account } = await import('@/models/Account');

  const thread = await MessageThread.findOne({
    _id: threadId,
    clientId: session.user.id,
  });
  if (!thread) return { error: 'Thread not found.' };

  const account = await Account.findById(session.user.id).lean();
  const senderName =
    (account as any)?.fullName || session.user.name || 'Client';

  await ClientMessage.create({
    threadId,
    senderId: session.user.id,
    senderName,
    senderRole: 'client',
    content: content.trim(),
    readBy: [session.user.id],
  });

  await MessageThread.updateOne(
    { _id: threadId },
    {
      $set: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 80),
      },
      $inc: { unreadByTeam: 1 },
    }
  );

  revalidatePath(`/portal/client/messages/${threadId}`);
  return { success: true };
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getClientInvoices() {
  const session = await getClientSession();
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const invoices = await ClientInvoice.find({ clientId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(invoices));
}

export async function getClientInvoice(invoiceId: string) {
  const session = await getClientSession();
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const invoice = await ClientInvoice.findOne({
    _id: invoiceId,
    clientId: session.user.id,
  }).lean();
  if (!invoice) return null;
  return JSON.parse(JSON.stringify(invoice));
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function getClientContracts() {
  const session = await getClientSession();
  await dbConnect();
  const { ClientContract } = await import('@/models/ClientContract');
  const contracts = await ClientContract.find({ clientId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(contracts));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getClientNotifications() {
  const session = await getClientSession();
  await dbConnect();
  const { ClientNotification } = await import('@/models/ClientNotification');
  const notifications = await ClientNotification.find({ clientId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return JSON.parse(JSON.stringify(notifications));
}

export async function markNotificationRead(notificationId: string) {
  const session = await getClientSession();
  await dbConnect();
  const { ClientNotification } = await import('@/models/ClientNotification');
  await ClientNotification.updateOne(
    { _id: notificationId, clientId: session.user.id },
    { $set: { read: true } }
  );
  revalidatePath('/portal/client/notifications');
}

export async function markAllNotificationsRead() {
  const session = await getClientSession();
  await dbConnect();
  const { ClientNotification } = await import('@/models/ClientNotification');
  await ClientNotification.updateMany(
    { clientId: session.user.id, read: false },
    { $set: { read: true } }
  );
  revalidatePath('/portal/client/notifications');
}

// ─── Profile / Settings ───────────────────────────────────────────────────────

export async function getClientProfile() {
  const session = await getClientSession();
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const account = await Account.findById(session.user.id).lean();
  if (!account) return null;
  return JSON.parse(JSON.stringify(account));
}

export async function updateClientProfile(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  await dbConnect();
  const { Account } = await import('@/models/Account');

  await Account.updateOne(
    { _id: session.user.id },
    {
      $set: {
        name: formData.get('name'),
        'clientProfile.phone': formData.get('phone'),
      },
    }
  );

  revalidatePath('/portal/client/settings/profile');
  return { success: true };
}

export async function updateClientCompany(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  await dbConnect();
  const { Account } = await import('@/models/Account');

  await Account.updateOne(
    { _id: session.user.id },
    {
      $set: {
        'clientProfile.companyName': formData.get('companyName'),
        'clientProfile.companyAddress': formData.get('companyAddress'),
        'clientProfile.phone': formData.get('phone'),
        'clientProfile.website': formData.get('website'),
        'clientProfile.industry': formData.get('industry'),
        'clientProfile.companySize': formData.get('companySize'),
        'clientProfile.notes': formData.get('notes'),
      },
    }
  );

  revalidatePath('/portal/client/settings/company');
  return { success: true };
}

export async function updateClientPassword(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) return { error: 'Passwords do not match.' };
  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  await dbConnect();
  const { Account } = await import('@/models/Account');
  const account = await Account.findById(session.user.id);
  if (!account) return { error: 'Account not found.' };

  const valid = await bcrypt.compare(currentPassword, account.passwordHash);
  if (!valid) return { error: 'Current password is incorrect.' };

  const newHash = await bcrypt.hash(newPassword, 12);
  await Account.updateOne({ _id: session.user.id }, { $set: { passwordHash: newHash } });

  return { success: true };
}
