'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session.user;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

export type QuotationLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// ── Get clients for quotation dropdown ────────────────────────────────────────

export async function getClientsForQuotation() {
  await checkAdmin();
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find(
    { roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } },
    'fullName email',
  )
    .sort({ fullName: 1 })
    .lean();
  return JSON.parse(JSON.stringify(clients));
}

// ── Get all quotations (admin) ─────────────────────────────────────────────────

export async function getAdminQuotations() {
  await checkAdmin();
  await dbConnect();
  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');

  const quotations = await Quotation.find().sort({ createdAt: -1 }).limit(500).lean();
  const clientIds = [...new Set(quotations.map((q: any) => String(q.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  return { quotations: JSON.parse(JSON.stringify(quotations)), accountMap };
}

// ── Get single quotation (admin) ───────────────────────────────────────────────

export async function getAdminQuotation(quotationId: string) {
  await checkAdmin();
  await dbConnect();
  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');

  const quotation = await Quotation.findById(quotationId).lean();
  if (!quotation) return null;

  const client = await Account.findById((quotation as any).clientId, 'fullName email').lean();
  return {
    quotation: JSON.parse(JSON.stringify(quotation)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

// ── Create quotation ───────────────────────────────────────────────────────────

export async function createAdminQuotation(data: {
  clientId: string;
  currency?: string;
  status: 'draft' | 'sent';
  description?: string;
  lineItems: QuotationLineItem[];
  message?: string;
  notes?: string;
  validUntil?: string;
}) {
  const admin = await checkAdmin();
  await dbConnect();

  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const client = await Account.findOne({ _id: data.clientId, roles: 'client' });
  if (!client) throw new Error('Client not found');
  const resolvedClientId = client.linkedClientAccountId
    ? client.linkedClientAccountId.toString()
    : data.clientId;

  const count = await Quotation.countDocuments();
  const year = new Date().getFullYear();
  const quotationNumber = `QUO-${year}-${String(count + 1).padStart(4, '0')}`;

  const amount = data.lineItems.reduce((sum, item) => sum + item.total, 0);
  const currency = data.currency || 'USD';

  const quotation = await Quotation.create({
    quotationNumber,
    clientId: resolvedClientId,
    status: data.status,
    amount,
    currency,
    description: data.description?.trim() || undefined,
    lineItems: data.lineItems,
    message: data.message?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    sentAt: data.status === 'sent' ? new Date() : undefined,
  });

  await AuditLog.create({
    entityType: 'quotation',
    entityId: quotation._id,
    action: 'quotation_created',
    performedBy: admin.id,
    details: { quotationNumber, clientId: resolvedClientId, amount, status: data.status },
    metadata: { quotationNumber, amount, currency, status: data.status },
  });

  if (data.status === 'sent') {
    const portalLink = `${getBaseUrl()}/portal/client/quotations/${quotation._id}`;
    const validUntilLabel = data.validUntil
      ? new Date(data.validUntil).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    await ClientNotification.create({
      clientId: resolvedClientId,
      type: 'system',
      title: `New Quotation: ${quotationNumber}`,
      message: `You have received a new quotation for ${currency} ${amount.toFixed(2)}. Please review and respond.`,
      actionUrl: `/portal/client/quotations/${quotation._id}`,
    });

    try {
      await sendEmail({
        to: client.email,
        subject: `Quotation ${quotationNumber} — ${currency} ${amount.toFixed(2)}`,
        html: EmailTemplates.quotationSent(
          client.fullName,
          quotationNumber,
          amount,
          currency,
          validUntilLabel,
          data.lineItems,
          data.message || null,
          data.notes || null,
          portalLink,
        ),
      });
    } catch (_) {}
  }

  revalidatePath('/admin/quotations');
  return { success: true, quotationId: quotation._id.toString(), quotationNumber };
}

// ── Send a draft quotation ─────────────────────────────────────────────────────

export async function sendAdminQuotation(quotationId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw new Error('Quotation not found');
  if (quotation.status !== 'draft') throw new Error('Only draft quotations can be sent.');

  await Quotation.findByIdAndUpdate(quotationId, { $set: { status: 'sent', sentAt: new Date() } });

  const client = await Account.findById(quotation.clientId, 'fullName email').lean();
  if (!client) throw new Error('Client not found');

  const portalLink = `${getBaseUrl()}/portal/client/quotations/${quotationId}`;
  const currency = quotation.currency || 'USD';
  const validUntilLabel = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  await ClientNotification.create({
    clientId: quotation.clientId,
    type: 'system',
    title: `New Quotation: ${quotation.quotationNumber}`,
    message: `You have received a new quotation for ${currency} ${quotation.amount.toFixed(2)}. Please review and respond.`,
    actionUrl: `/portal/client/quotations/${quotationId}`,
  });

  try {
    await sendEmail({
      to: (client as any).email,
      subject: `Quotation ${quotation.quotationNumber} — ${currency} ${quotation.amount.toFixed(2)}`,
      html: EmailTemplates.quotationSent(
        (client as any).fullName,
        quotation.quotationNumber,
        quotation.amount,
        currency,
        validUntilLabel,
        quotation.lineItems,
        quotation.message || null,
        quotation.notes || null,
        portalLink,
      ),
    });
  } catch (_) {}

  await AuditLog.create({
    entityType: 'quotation',
    entityId: quotationId,
    action: 'quotation_sent',
    performedBy: admin.id,
    details: { quotationNumber: quotation.quotationNumber },
    metadata: { quotationNumber: quotation.quotationNumber },
  });

  revalidatePath('/admin/quotations');
  return { success: true };
}

// ── Cancel / delete quotation ──────────────────────────────────────────────────

export async function cancelAdminQuotation(quotationId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const { Quotation } = await import('@/models/Quotation');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw new Error('Quotation not found');
  if (['accepted', 'rejected'].includes(quotation.status)) {
    throw new Error('Cannot cancel a quotation that has already been responded to.');
  }

  await Quotation.findByIdAndDelete(quotationId);

  await AuditLog.create({
    entityType: 'quotation',
    entityId: quotationId,
    action: 'quotation_cancelled',
    performedBy: admin.id,
    details: { quotationNumber: quotation.quotationNumber },
    metadata: { quotationNumber: quotation.quotationNumber },
  });

  revalidatePath('/admin/quotations');
  return { success: true };
}
