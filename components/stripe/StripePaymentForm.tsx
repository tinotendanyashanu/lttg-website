'use client';

import { useState } from 'react';
import { loadStripe, type Stripe as StripeType } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialise loadStripe outside component to avoid recreating on re-render
let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripePromise(publishableKey: string): ReturnType<typeof loadStripe> {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface CheckoutFormProps {
  returnUrl: string;
  amount: number;
  currency: string;
}

function CheckoutForm({ returnUrl, amount, currency }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // Only reaches here on immediate failure (declined card, network error, etc.)
    // On success, Stripe redirects to return_url before this line executes.
    if (error) {
      setErrorMessage(error.message ?? 'Payment failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full py-3 text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
      >
        {isSubmitting ? 'Processing…' : `Pay ${formattedAmount}`}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  returnUrl: string;
  amount: number;
  currency: string;
}

export default function StripePaymentForm({
  clientSecret,
  publishableKey,
  returnUrl,
  amount,
  currency,
}: StripePaymentFormProps) {
  const stripePromise = getStripePromise(publishableKey);

  const appearance: Parameters<typeof Elements>[0]['options'] = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#111827',
        borderRadius: '12px',
        fontSizeBase: '14px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, ...appearance }}>
      <CheckoutForm returnUrl={returnUrl} amount={amount} currency={currency} />
    </Elements>
  );
}
