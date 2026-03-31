'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';

async function checkClient() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') throw new Error('Unauthorized');
  return session.user;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

// ── Get client's quotations ────────────────────────────────────────────────────

export async function getClientQuotations() {
  const user = await checkClient();
  await dbConnect();
  const { Quotation } = await import('@/models/Quotation');

  const quotations = await Quotation.find({ clientId: user.id, status: { $ne: 'draft' } })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(quotations));
}

// ── Get single quotation (client) ──────────────────────────────────────────────

export async function getClientQuotation(quotationId: string) {
  const user = await checkClient();
  await dbConnect();
  const { Quotation } = await import('@/models/Quotation');

  const quotation = await Quotation.findOne({ _id: quotationId, clientId: user.id }).lean();
  if (!quotation) return null;
  return JSON.parse(JSON.stringify(quotation));
}

// ── Respond to a quotation (accept or reject) ─────────────────────────────────
// On acceptance, automatically creates an invoice.

export async function respondToQuotation(
  quotationId: string,
  response: 'accepted' | 'rejected',
) {
  const user = await checkClient();
  await dbConnect();

  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const quotation = await Quotation.findOne({ _id: quotationId, clientId: user.id });
  if (!quotation) throw new Error('Quotation not found.');
  if (quotation.status !== 'sent') {
    throw new Error('This quotation can no longer be responded to.');
  }

  const now = new Date();

  if (response === 'rejected') {
    quotation.status = 'rejected';
    quotation.rejectedAt = now;
    await quotation.save();

    // Notify admin via email
    try {
      const client = await Account.findById(user.id, 'fullName email').lean();
      await sendEmail({
        to: 'contact@leothetechguy.com',
        subject: `Quotation ${quotation.quotationNumber} Rejected`,
        html: EmailTemplates.quotationRejectedAdmin(
          (client as any)?.fullName || user.email || 'Client',
          quotation.quotationNumber,
          quotation.currency || 'USD',
          quotation.amount,
        ),
      });
    } catch (_) {}

    revalidatePath('/portal/client/quotations');
    revalidatePath(`/portal/client/quotations/${quotationId}`);
    return { success: true, response: 'rejected' };
  }

  // ── Accept: create invoice automatically ──────────────────────────────────
  const count = await ClientInvoice.countDocuments();
  const year = now.getFullYear();
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  const currency = quotation.currency || 'USD';

  let usdAmount: number | undefined;
  let exchangeRateUsed: number | undefined;
  try {
    const { toUSD } = await import('@/lib/services/exchangeRates');
    const usdResult = await toUSD(quotation.amount, currency);
    if (usdResult) {
      usdAmount = usdResult.usdAmount;
      exchangeRateUsed = usdResult.exchangeRateUsed;
    }
  } catch (_) {}

  const invoice = await ClientInvoice.create({
    invoiceNumber,
    clientId: user.id,
    amount: quotation.amount,
    currency,
    status: 'issued',
    description: quotation.description || `Auto-generated from quotation ${quotation.quotationNumber}`,
    lineItems: quotation.lineItems,
    issuedAt: now,
    notes: quotation.notes || undefined,
    amountPaid: 0,
    depositPaid: 0,
    remainingBalance: quotation.amount,
    usdAmount,
    exchangeRateUsed,
  });

  // Update quotation
  quotation.status = 'accepted';
  quotation.acceptedAt = now;
  quotation.convertedInvoiceId = invoice._id;
  await quotation.save();

  const invoiceLink = `${getBaseUrl()}/portal/client/invoices/${invoice._id}`;

  // Notify client of new invoice
  await ClientNotification.create({
    clientId: user.id,
    type: 'invoice_alert',
    title: `Invoice Created: ${invoiceNumber}`,
    message: `Your quotation ${quotation.quotationNumber} was accepted. Invoice ${invoiceNumber} for ${currency} ${quotation.amount.toFixed(2)} has been created.`,
    actionUrl: `/portal/client/invoices/${invoice._id}`,
  });

  // Email client with the invoice
  try {
    const client = await Account.findById(user.id, 'fullName email').lean();
    if (client) {
      await sendEmail({
        to: (client as any).email,
        subject: `Invoice ${invoiceNumber} — Quotation Accepted`,
        html: EmailTemplates.quotationAcceptedInvoice(
          (client as any).fullName,
          quotation.quotationNumber,
          invoiceNumber,
          quotation.amount,
          currency,
          quotation.lineItems,
          quotation.notes || null,
          invoiceLink,
        ),
      });

      // Notify admin
      await sendEmail({
        to: 'contact@leothetechguy.com',
        subject: `Quotation ${quotation.quotationNumber} Accepted — Invoice ${invoiceNumber} Created`,
        html: EmailTemplates.quotationAcceptedAdmin(
          (client as any).fullName,
          quotation.quotationNumber,
          invoiceNumber,
          currency,
          quotation.amount,
        ),
      });
    }
  } catch (_) {}

  await AuditLog.create({
    entityType: 'quotation',
    entityId: quotationId,
    action: 'quotation_accepted',
    performedBy: user.id,
    details: { quotationNumber: quotation.quotationNumber, invoiceNumber },
    metadata: { quotationNumber: quotation.quotationNumber, invoiceId: invoice._id.toString() },
  });

  revalidatePath('/portal/client/quotations');
  revalidatePath(`/portal/client/quotations/${quotationId}`);
  revalidatePath('/portal/client/invoices');
  revalidatePath('/admin/quotations');

  return { success: true, response: 'accepted', invoiceId: invoice._id.toString() };
}
