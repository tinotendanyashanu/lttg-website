/**
 * Exchange Rate Service
 *
 * Fetches and caches USD conversion rates using open.er-api.com (free, no key required).
 * Rates are cached in-process for 1 hour to avoid hammering the API.
 *
 * Supported currencies: USD, EUR, GBP, PLN, ZAR, CAD, AUD, and any other code
 * returned by the API.
 */

interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const API_URL = 'https://open.er-api.com/v6/latest/USD';

// Module-level cache (survives across requests in the same Node.js process)
let _cache: RateCache | null = null;

async function fetchRates(): Promise<Record<string, number>> {
  const res = await fetch(API_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success' || !data.rates) {
    throw new Error('Exchange rate API returned unexpected data');
  }
  // data.rates is { USD: 1, EUR: 0.92, PLN: 4.05, ... }
  return data.rates as Record<string, number>;
}

async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.rates;
  }
  const rates = await fetchRates();
  _cache = { rates, fetchedAt: now };
  return rates;
}

/**
 * Convert `amount` in `fromCurrency` to USD.
 * Returns `{ usdAmount, exchangeRateUsed }`.
 * If `fromCurrency` is already USD, rate = 1.
 * If the rate cannot be fetched, returns null (caller should handle gracefully).
 */
export async function toUSD(
  amount: number,
  fromCurrency: string,
): Promise<{ usdAmount: number; exchangeRateUsed: number } | null> {
  if (!amount || amount <= 0) return null;
  const currency = fromCurrency?.toUpperCase() ?? 'USD';
  if (currency === 'USD') {
    return { usdAmount: amount, exchangeRateUsed: 1 };
  }

  try {
    const rates = await getRates();
    const rate = rates[currency];
    if (!rate) return null;
    // rates are "how many X per 1 USD", so: amount_in_USD = amount / rate
    const usdAmount = Math.round((amount / rate) * 100) / 100;
    const exchangeRateUsed = Math.round((1 / rate) * 1_000_000) / 1_000_000;
    return { usdAmount, exchangeRateUsed };
  } catch (err) {
    console.error('[exchangeRates] Failed to fetch rates:', err);
    return null;
  }
}
