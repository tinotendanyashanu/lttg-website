/**
 * Internal payment recording utility for the Stripe webhook.
 * This is intentionally NOT a server action and has NO auth check —
 * callers (the webhook handler) are responsible for verifying the
 * request is legitimate (via Stripe signature verification) before calling this.
 */

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';

export async function recordPaymentFromWebhook(
  invoiceId: string,
  payload: { amount: number; method: string; notes?: string },
) {
  await dbConnect();

  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) throw new Error(`Invoice not found: ${invoiceId}`);

  // Idempotency guard — if already paid or cancelled, silently succeed
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return { success: true, newStatus: invoice.status, alreadyProcessed: true };
  }

  if (payload.amount <= 0) throw new Error('Payment amount must be greater than zero.');

  const remaining = invoice.remainingBalance ?? invoice.amount - (invoice.amountPaid ?? 0);
  if (payload.amount > remaining + 0.001) {
    throw new Error(
      `Payment amount (${payload.amount}) exceeds remaining balance (${remaining.toFixed(2)}).`,
    );
  }

  const newAmountPaid = (invoice.amountPaid ?? 0) + payload.amount;
  const newRemainingBalance = invoice.amount - newAmountPaid;
  const isFullyPaid = newRemainingBalance <= 0.001;
  const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

  invoice.amountPaid = newAmountPaid;
  invoice.remainingBalance = Math.max(0, newRemainingBalance);
  invoice.status = newStatus;
  if (isFullyPaid && !invoice.paidAt) invoice.paidAt = new Date();

  // Back-fill USD amount if missing
  if (!invoice.usdAmount) {
    try {
      const { toUSD } = await import('@/lib/services/exchangeRates');
      const usdResult = await toUSD(invoice.amount, invoice.currency || 'USD');
      if (usdResult) {
        invoice.usdAmount = usdResult.usdAmount;
        invoice.exchangeRateUsed = usdResult.exchangeRateUsed;
      }
    } catch (_) {}
  }

  invoice.paymentHistory.push({
    amount: payload.amount,
    currency: invoice.currency || 'USD',
    method: payload.method,
    notes: payload.notes?.trim() || undefined,
    recordedAt: new Date(),
  });

  await invoice.save();

  // Send receipt email to client
  if (isFullyPaid) {
    try {
      const { Account } = await import('@/models/Account');
      const { sendEmail, EmailTemplates } = await import('@/lib/email');
      const account = await Account.findById(invoice.clientId, 'fullName email').lean();
      if (account?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leothetechguy.com';
        const portalLink = `${appUrl}/portal/client/invoices/${invoiceId}`;
        const paidDateLabel = new Date(invoice.paidAt!).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        });
        const serviceFee = Math.round(invoice.amount * 0.015 * 100) / 100;
        await sendEmail({
          to: account.email,
          subject: `Receipt — ${invoice.invoiceNumber} (Paid)`,
          html: EmailTemplates.paymentReceived(
            account.fullName || 'Valued Client',
            invoice.invoiceNumber,
            invoice.amount,
            serviceFee,
            invoice.currency || 'USD',
            paidDateLabel,
            invoice.lineItems || [],
            payload.method,
            portalLink,
          ),
        });
      }
    } catch (_) {}
  }

  // Log to case activity timeline if linked
  if (invoice.caseId) {
    try {
      const { ActivityLog } = await import('@/models/ActivityLog');
      await ActivityLog.create({
        caseId: invoice.caseId,
        actionType: 'payment_received',
        newValue: `${invoice.currency} ${payload.amount.toFixed(2)} via ${payload.method}`,
      });
    } catch (_) {}
  }

  // In-app notification for the client
  await ClientNotification.create({
    clientId: invoice.clientId,
    type: 'payment_received',
    title: `Payment Received — ${invoice.invoiceNumber}`,
    message: isFullyPaid
      ? `Your invoice ${invoice.invoiceNumber} has been fully paid. Thank you!`
      : `A payment of ${invoice.currency} ${payload.amount.toFixed(2)} was received on invoice ${invoice.invoiceNumber}. Remaining: ${invoice.currency} ${invoice.remainingBalance.toFixed(2)}.`,
    actionUrl: `/portal/client/invoices/${invoiceId}`,
  });

  await AuditLog.create({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'payment_recorded',
    performedBy: 'stripe-webhook',
    details: { invoiceNumber: invoice.invoiceNumber, amount: payload.amount, method: payload.method },
    metadata: { invoiceNumber: invoice.invoiceNumber, newStatus, remainingBalance: invoice.remainingBalance },
  });

  // On full payment, automatically spin up the client's project (idempotent,
  // fire-and-forget — never blocks or fails the payment recording).
  if (isFullyPaid) {
    try {
      const { runProjectOnboarding } = await import('@/lib/services/project-onboarding');
      runProjectOnboarding(invoiceId).catch(() => {});
    } catch (_) {}
  }

  revalidatePath('/admin/invoices');
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath('/portal/client/invoices');
  revalidatePath(`/portal/client/invoices/${invoiceId}`);

  return { success: true, newStatus, remainingBalance: invoice.remainingBalance };
}
