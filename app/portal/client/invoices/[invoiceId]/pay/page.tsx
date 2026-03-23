import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import StripePaymentForm from '@/components/stripe/StripePaymentForm';

export const dynamic = 'force-dynamic';

const PAYABLE_STATUSES = ['issued', 'sent', 'partially_paid', 'overdue'];
const SERVICE_FEE_RATE = 0.015;

async function getInvoiceForPayment(clientId: string, invoiceId: string) {
  try {
    await dbConnect();
    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const inv = await ClientInvoice.findOne({ _id: invoiceId, clientId }).lean();
    return inv ? JSON.parse(JSON.stringify(inv)) : null;
  } catch {
    return null;
  }
}

function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    redirect('/portal/client/login');
  }

  const invoice = await getInvoiceForPayment(session.user.id, invoiceId);
  if (!invoice) notFound();

  if (!PAYABLE_STATUSES.includes(invoice.status)) {
    redirect(`/portal/client/invoices/${invoiceId}`);
  }

  const amountToCharge = invoice.remainingBalance ?? invoice.amount;
  const serviceFee = Math.round(amountToCharge * SERVICE_FEE_RATE * 100) / 100;
  const totalCharged = Math.round((amountToCharge + serviceFee) * 100) / 100;
  const currency = (invoice.currency || 'USD').toLowerCase();

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: toStripeAmount(totalCharged),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      invoiceId: String(invoice._id),
      clientId: String(invoice.clientId),
      currency: invoice.currency || 'USD',
      amount: String(amountToCharge),
      serviceFee: String(serviceFee),
    },
  });

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey || !paymentIntent.client_secret) {
    throw new Error('Stripe is not configured. Please contact support.');
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/client/invoices/${invoiceId}?payment=success`;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8 px-4">
      <div>
        <Link
          href={`/portal/client/invoices/${invoiceId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <span className="material-icons-outlined text-[16px]">arrow_back</span>
          Back to Invoice
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Payment</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Invoice {invoice.invoiceNumber}
        </p>
      </div>

      {/* Invoice summary */}
      <div className="bg-gray-50 dark:bg-[#1c1c1f] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Invoice total</span>
          <span className="text-gray-700 dark:text-gray-300">{fmt(invoice.amount)}</span>
        </div>
        {(invoice.amountPaid ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Already paid</span>
            <span className="text-emerald-600 dark:text-emerald-400">−{fmt(invoice.amountPaid)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Invoice amount</span>
          <span className="text-gray-700 dark:text-gray-300">{fmt(amountToCharge)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Service fee (1.5%)
            <span className="block text-xs text-gray-400 dark:text-gray-500">Applied to all online payments</span>
          </span>
          <span className="text-gray-700 dark:text-gray-300">{fmt(serviceFee)}</span>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-sm font-semibold">
          <span className="text-gray-900 dark:text-white">Total charged</span>
          <span className="text-gray-900 dark:text-white">{fmt(totalCharged)}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white dark:bg-[#1c1c1f] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <StripePaymentForm
          clientSecret={paymentIntent.client_secret}
          publishableKey={publishableKey}
          returnUrl={returnUrl}
          amount={totalCharged}
          currency={invoice.currency || 'USD'}
        />
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Payments are processed securely by{' '}
        <span className="font-medium">Stripe</span>. Your card details are never stored on our servers.
      </p>
    </div>
  );
}
