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

// ── Get clients for invoice dropdown ──────────────────────────────────────────

export async function getClientsForInvoice() {
  await checkAdmin();
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find({ roles: 'client', isActive: true }, 'fullName email').sort({ fullName: 1 }).lean();
  return JSON.parse(JSON.stringify(clients));
}

// ── Get all invoices with client names (admin) ────────────────────────────────

export async function getAdminInvoices() {
  await checkAdmin();
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoices = await ClientInvoice.find().sort({ createdAt: -1 }).limit(500).lean();
  const clientIds = [...new Set(invoices.map((inv: any) => String(inv.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  return { invoices: JSON.parse(JSON.stringify(invoices)), accountMap };
}

// ── Get single invoice (admin, any client) ────────────────────────────────────

export async function getAdminInvoice(invoiceId: string) {
  await checkAdmin();
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoice = await ClientInvoice.findById(invoiceId).lean();
  if (!invoice) return null;

  const client = await Account.findById((invoice as any).clientId, 'fullName email').lean();

  return {
    invoice: JSON.parse(JSON.stringify(invoice)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

// ── Create invoice ─────────────────────────────────────────────────────────────

export type LineItem = { description: string; quantity: number; unitPrice: number; total: number };

export async function createAdminInvoice(data: {
  clientId: string;
  caseId?: string;
  currency?: string;
  status: 'draft' | 'issued' | 'sent';
  description?: string;
  lineItems: LineItem[];
  issuedAt?: string;
  dueAt?: string;
  notes?: string;
}) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  // Verify client exists
  const client = await Account.findOne({ _id: data.clientId, roles: 'client' });
  if (!client) throw new Error('Client not found');

  // Generate invoice number
  const count = await ClientInvoice.countDocuments();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

  const amount = data.lineItems.reduce((sum, item) => sum + item.total, 0);
  const currency = data.currency || 'USD';

  const invoice = await ClientInvoice.create({
    invoiceNumber,
    clientId: data.clientId,
    caseId: data.caseId || undefined,
    amount,
    currency,
    status: data.status,
    description: data.description?.trim() || undefined,
    lineItems: data.lineItems,
    issuedAt: data.status !== 'draft' ? (data.issuedAt ? new Date(data.issuedAt) : new Date()) : undefined,
    dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    notes: data.notes?.trim() || undefined,
  });

  // Audit trail
  await AuditLog.create({
    entityType: 'invoice',
    entityId: invoice._id,
    action: 'invoice_created',
    performedBy: admin.id,
    details: { invoiceNumber, clientId: data.clientId, amount, status: data.status },
    metadata: { invoiceNumber, amount, currency, status: data.status },
  });

  const portalLink = `${getBaseUrl()}/portal/client/invoices/${invoice._id}`;

  // Notify client if not a draft
  if (data.status === 'issued' || data.status === 'sent') {
    const dueLabel = data.dueAt ? new Date(data.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

    // In-app notification
    await ClientNotification.create({
      clientId: data.clientId,
      type: 'invoice_alert',
      title: `New Invoice: ${invoiceNumber}`,
      message: `A new invoice for ${currency} ${amount.toFixed(2)} has been issued to your account.${dueLabel ? ` Due: ${dueLabel}.` : ''}`,
      actionUrl: `/portal/client/invoices/${invoice._id}`,
    });

    // Email notification
    try {
      await sendEmail({
        to: client.email,
        subject: `Invoice ${invoiceNumber} — ${currency} ${amount.toFixed(2)}`,
        html: EmailTemplates.invoiceIssued(
          client.fullName,
          invoiceNumber,
          amount,
          currency,
          dueLabel,
          data.lineItems,
          data.notes || null,
          portalLink,
        ),
      });
    } catch (_) {
      // Email failure is non-blocking
    }
  }

  revalidatePath('/admin/invoices');
  revalidatePath(`/portal/client/invoices`);
  return { success: true, invoiceId: invoice._id.toString(), invoiceNumber };
}

// ── Update invoice status ─────────────────────────────────────────────────────

export async function updateAdminInvoiceStatus(
  invoiceId: string,
  newStatus: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  sendNotification = true,
) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'paid' && !invoice.paidAt) updates.paidAt = new Date();
  if ((newStatus === 'issued' || newStatus === 'sent') && !invoice.issuedAt) updates.issuedAt = new Date();

  await ClientInvoice.findByIdAndUpdate(invoiceId, { $set: updates });

  await AuditLog.create({
    entityType: 'invoice',
    entityId: invoiceId,
    action: `invoice_status_${newStatus}`,
    performedBy: admin.id,
    details: { invoiceId, newStatus, previousStatus: invoice.status },
    metadata: { invoiceNumber: invoice.invoiceNumber, newStatus },
  });

  const client = await Account.findById(invoice.clientId, 'fullName email').lean();

  if (client && sendNotification) {
    const portalLink = `${getBaseUrl()}/portal/client/invoices/${invoiceId}`;
    const currency = invoice.currency || 'USD';

    await ClientNotification.create({
      clientId: invoice.clientId,
      type: 'invoice_alert',
      title: `Invoice ${invoice.invoiceNumber} — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `Invoice ${invoice.invoiceNumber} for ${currency} ${invoice.amount.toFixed(2)} is now ${newStatus}.`,
      actionUrl: `/portal/client/invoices/${invoiceId}`,
    });

    try {
      await sendEmail({
        to: (client as any).email,
        subject: `Invoice ${invoice.invoiceNumber} — Status Update`,
        html: EmailTemplates.invoiceStatusUpdate(
          (client as any).fullName,
          invoice.invoiceNumber,
          newStatus,
          portalLink,
        ),
      });
    } catch (_) {}
  }

  revalidatePath('/admin/invoices');
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath('/portal/client/invoices');
  return { success: true };
}

// ── Send invoice reminder email ───────────────────────────────────────────────

export async function sendInvoiceReminder(invoiceId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    throw new Error('Cannot send reminder for a paid or cancelled invoice.');
  }

  const client = await Account.findById(invoice.clientId, 'fullName email').lean();
  if (!client) throw new Error('Client not found');

  const portalLink = `${getBaseUrl()}/portal/client/invoices/${invoiceId}`;
  const currency = invoice.currency || 'USD';
  const dueLabel = invoice.dueAt
    ? new Date(invoice.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  await sendEmail({
    to: (client as any).email,
    subject: `Reminder: Invoice ${invoice.invoiceNumber} — ${currency} ${invoice.amount.toFixed(2)}`,
    html: EmailTemplates.invoiceReminder(
      (client as any).fullName,
      invoice.invoiceNumber,
      invoice.amount,
      currency,
      dueLabel,
      portalLink,
    ),
  });

  await ClientNotification.create({
    clientId: invoice.clientId,
    type: 'invoice_alert',
    title: `Payment Reminder: ${invoice.invoiceNumber}`,
    message: `A payment reminder has been sent for invoice ${invoice.invoiceNumber} (${currency} ${invoice.amount.toFixed(2)}).`,
    actionUrl: `/portal/client/invoices/${invoiceId}`,
  });

  await AuditLog.create({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'invoice_reminder_sent',
    performedBy: admin.id,
    details: { invoiceNumber: invoice.invoiceNumber },
    metadata: { invoiceNumber: invoice.invoiceNumber },
  });

  revalidatePath(`/admin/invoices/${invoiceId}`);
  return { success: true };
}

// ── Delete (cancel) invoice ───────────────────────────────────────────────────

export async function deleteAdminInvoice(invoiceId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'paid') throw new Error('Cannot delete a paid invoice. Cancel it instead.');

  await ClientInvoice.findByIdAndUpdate(invoiceId, { $set: { status: 'cancelled' } });

  await AuditLog.create({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'invoice_cancelled',
    performedBy: admin.id,
    details: { invoiceNumber: invoice.invoiceNumber },
    metadata: { invoiceNumber: invoice.invoiceNumber },
  });

  revalidatePath('/admin/invoices');
  return { success: true };
}
