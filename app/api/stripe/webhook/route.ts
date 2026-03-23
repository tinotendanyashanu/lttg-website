import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import stripeClient from '@/lib/stripe';
import { recordPaymentFromWebhook } from '@/lib/actions/invoice-payment-internal';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  // CRITICAL: Must use raw body (text) for signature verification — NOT req.json()
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return new NextResponse(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { invoiceId, amount } = paymentIntent.metadata;

    if (!invoiceId || !amount) {
      console.error('[Stripe Webhook] Missing metadata on PaymentIntent:', paymentIntent.id);
      // Return 200 so Stripe doesn't keep retrying a fundamentally broken event
      return new NextResponse(null, { status: 200 });
    }

    try {
      const result = await recordPaymentFromWebhook(invoiceId, {
        amount: parseFloat(amount),
        method: 'stripe',
        notes: `Stripe PaymentIntent: ${paymentIntent.id}`,
      });
      console.log(`[Stripe Webhook] Payment recorded for invoice ${invoiceId}:`, result.newStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Stripe Webhook] Failed to record payment:', message);
      // Return 500 so Stripe retries
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  // Return 200 for all other event types — prevents Stripe from retrying
  return new NextResponse(null, { status: 200 });
}
