import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const PAYABLE_STATUSES = ['issued', 'sent', 'partially_paid', 'overdue'];

/** Convert a display amount to Stripe's smallest currency unit (e.g. cents). */
function toStripeAmount(amount: number, currency: string): number {
  // All supported currencies (USD, ZAR, EUR, GBP, PLN) use 2 decimal places.
  return Math.round(amount * 100);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'client') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let invoiceId: string;
  try {
    const body = await req.json();
    invoiceId = body?.invoiceId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!invoiceId || typeof invoiceId !== 'string') {
    return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
  }

  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  // SECURITY: query with both _id AND clientId — prevents horizontal privilege escalation
  const invoice = await ClientInvoice.findOne({
    _id: invoiceId,
    clientId: session.user.id,
  }).lean();

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (!PAYABLE_STATUSES.includes(invoice.status)) {
    return NextResponse.json(
      { error: `Invoice cannot be paid in its current status: ${invoice.status}` },
      { status: 422 },
    );
  }

  // Amount always comes from the database — never from client input
  const amountToCharge = invoice.remainingBalance ?? invoice.amount;
  const currency = (invoice.currency || 'USD').toLowerCase();

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: toStripeAmount(amountToCharge, currency),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      invoiceId: String(invoice._id),
      clientId: String(invoice.clientId),
      currency: invoice.currency || 'USD',
      amount: String(amountToCharge),
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
