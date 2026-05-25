/**
 * AKP Payments Architecture
 * Primary: Paymob (Egypt)
 * Future-ready: Stripe, Vodafone Cash, Manual
 */

export type PaymentMethod = "paymob" | "stripe" | "vodafone_cash" | "manual";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type PaymentRelatedType = "course" | "subscription" | "booking" | "service";
export type PaymentCurrency = "EGP" | "USD";

export interface PaymentIntent {
  userId: string;
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethod;
  description: string;
  relatedType?: PaymentRelatedType;
  relatedId?: string;
  metadata?: Record<string, string>;
}

export interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  iframeId: string;
}

// ─── Paymob Integration Architecture ──────────────────────────────────────────
// Full Paymob flow requires a server-side component:
// Step 1: POST /api/payments/paymob/auth        → auth_token
// Step 2: POST /api/payments/paymob/order        → order_id
// Step 3: POST /api/payments/paymob/key          → payment_key
// Step 4: Redirect user to hosted payment iframe
//
// This file provides the client-side helpers & types.
// Server-side API routes should be added to the api-server artifact.

export const PAYMOB_IFRAME_URL = "https://accept.paymob.com/api/acceptance/iframes";

export function getPaymobIframeUrl(paymentKey: string, iframeId: string): string {
  return `${PAYMOB_IFRAME_URL}/${iframeId}?payment_token=${paymentKey}`;
}

// ─── Subscription Plans ────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: "starter" | "professional" | "enterprise";
  name: string;
  priceEGP: number;
  priceUSD: number;
  billingCycle: "monthly" | "annual";
  features: string[];
  highlighted: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceEGP: 500,
    priceUSD: 10,
    billingCycle: "monthly",
    features: [
      "Access to free courses",
      "Resource library (basic)",
      "1 consultation/month",
      "Email support",
    ],
    highlighted: false,
  },
  {
    id: "professional",
    name: "Professional",
    priceEGP: 1500,
    priceUSD: 30,
    billingCycle: "monthly",
    features: [
      "All courses (unlimited)",
      "Full resource library",
      "3 consultations/month",
      "Priority support",
      "Certificate issuance",
      "Financial tools access",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceEGP: 5000,
    priceUSD: 100,
    billingCycle: "monthly",
    features: [
      "Everything in Professional",
      "Dedicated advisor",
      "Team accounts (up to 10)",
      "Custom reporting",
      "ERP consulting sessions",
      "SLA guarantee",
    ],
    highlighted: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency: PaymentCurrency = "EGP"): string {
  if (currency === "EGP") {
    return `EGP ${amount.toLocaleString("en-EG")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function generateInvoiceNumber(userId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `AKP-${year}${month}-${rand}`;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "text-amber-600 bg-amber-50",
  completed: "text-green-600 bg-green-50",
  failed: "text-red-600 bg-red-50",
  refunded: "text-blue-600 bg-blue-50",
  cancelled: "text-gray-600 bg-gray-100",
};
