/**
 * 50+ WorkReady — Stripe Product & Price Configuration
 * All pricing is defined here for centralized access.
 */

export const PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: "50+ WorkReady Premium — Monthly",
    description: "Unlock Bonus Interview Scripts, exclusive content, and all future premium features.",
    priceId: "price_monthly", // Will be replaced by real Stripe price ID at runtime
    amount: 799, // $7.99/month in cents
    currency: "usd",
    interval: "month" as const,
    type: "subscription" as const,
  },
  PREMIUM_LIFETIME: {
    name: "50+ WorkReady Premium — Lifetime Access",
    description: "One-time payment for lifetime access to all premium content.",
    priceId: "price_lifetime",
    amount: 2999, // $29.99 one-time in cents
    currency: "usd",
    interval: null,
    type: "one_time" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
