import Stripe from 'stripe';

// Lazy singleton — only initialised on first call, not at module load time.
// This prevents the build from failing if STRIPE_SECRET_KEY is not set as a
// build-time env var (it is only needed at request time).
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set. Add it to your environment.');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return _stripe;
}
