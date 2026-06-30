import { SHOP } from "../constants/shop";

export interface RazorpayResult {
  paymentId: string;
  orderId: string;
  signature: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export function makePaymentId(): string {
  return `pay_${Math.random().toString(16).slice(2, 16)}`;
}

interface CheckoutOptions {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  email: string;
}

// Opens the hosted checkout for a server-created order and resolves with the
// signed handler response, which the backend then verifies.
export async function openRazorpayCheckout(opts: CheckoutOptions): Promise<RazorpayResult> {
  const ready = await loadRazorpayScript();
  if (!ready || !window.Razorpay) throw new Error("Razorpay is unavailable");

  return new Promise<RazorpayResult>((resolve, reject) => {
    const instance = new window.Razorpay!({
      key: opts.keyId,
      order_id: opts.razorpayOrderId,
      amount: Math.round(opts.amount * 100),
      currency: opts.currency,
      name: SHOP.payment.company,
      description: SHOP.payment.description,
      prefill: { name: opts.name, email: opts.email },
      theme: { color: "#0a0a0a" },
      handler: (response: RazorpayHandlerResponse) =>
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        }),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    instance.open();
  });
}
