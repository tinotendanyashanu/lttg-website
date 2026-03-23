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
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ amount?: string }>;
}) {
  const { invoiceId } = await params;
  const { amount: customAmount } = await searchParams;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    redirect('/portal/client/login');
  }

  const invoice = await getInvoiceForPayment(session.user.id, invoiceId);
  if (!invoice) notFound();

  if (!PAYABLE_STATUSES.includes(invoice.status)) {
    redirect(`/portal/client/invoices/${invoiceId}`);
  }

  // Check if eligible for installment payments (first payment + no deposit)
  const isFirstPayment = (invoice.amountPaid ?? 0) === 0;
  const hasNoDeposit = (invoice.depositPaid ?? 0) === 0;
  const canDoInstallments = isFirstPayment && hasNoDeposit;

  // Determine amount to charge
  let amountToCharge = invoice.remainingBalance ?? invoice.amount;

  // If custom amount provided and eligible for installments, validate and use it
  if (customAmount && canDoInstallments) {
    const customAmountNum = parseFloat(customAmount);
    if (!isNaN(customAmountNum) && customAmountNum > 0 && customAmountNum <= amountToCharge) {
      amountToCharge = customAmountNum;
    }
  }
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
      isInstallment: String(amountToCharge < (invoice.remainingBalance ?? invoice.amount) && canDoInstallments),
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

      {/* Installment Payment Option */}
      {canDoInstallments && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[20px] mt-0.5">info</span>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Pay in Installments</p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                You can make a partial payment now and pay the rest later.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">How much would you like to pay?</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                max={invoice.remainingBalance ?? invoice.amount}
                step="0.01"
                defaultValue={(amountToCharge / 100 * 100).toFixed(2)}
                id="customAmount"
                placeholder="Custom amount"
                className="flex-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#1c1c1f] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('customAmount') as HTMLInputElement;
                  if (input?.value) {
                    const amount = parseFloat(input.value);
                    if (amount > 0 && amount <= (invoice.remainingBalance ?? invoice.amount)) {
                      window.location.href = `?amount=${amount}`;
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Apply
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Min: {fmt(0.01)} · Max: {fmt(invoice.remainingBalance ?? invoice.amount)}
            </p>
          </div>
        </div>
      )}

      {/* Invoice summary */}
      <div className="bg-gray-50 dark:bg-[#1c1c1f] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Invoice total</span>
          <span className="text-gray-700 dark:text-gray-300">{fmt(invoice.amount)}</span>
        </div>
        {(invoice.depositPaid ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Deposit paid</span>
            <span className="text-blue-600 dark:text-blue-400">−{fmt(invoice.depositPaid)}</span>
          </div>
        )}
        {(invoice.amountPaid ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Already paid</span>
            <span className="text-emerald-600 dark:text-emerald-400">−{fmt(invoice.amountPaid)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {amountToCharge < (invoice.remainingBalance ?? invoice.amount) && canDoInstallments ? 'Payment today' : 'Amount due'}
          </span>
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
