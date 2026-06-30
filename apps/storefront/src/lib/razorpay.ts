import { SHOP } from "../constants/shop";

export interface RazorpaySuccess {
  paymentId: string;
}

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
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

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as
  | string
  | undefined;

// No key configured → run the self-contained mock gateway.
export const RAZORPAY_IS_MOCK = !RAZORPAY_KEY_ID;

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

interface PaymentRequest {
  amount: number;
  currency: string;
  name: string;
  email: string;
}

// Opens the real Razorpay hosted checkout when a key is configured.
export async function openRealRazorpay(req: PaymentRequest): Promise<RazorpaySuccess> {
  const ready = await loadRazorpayScript();
  if (!ready || !window.Razorpay) throw new Error("Razorpay is unavailable");

  return new Promise<RazorpaySuccess>((resolve, reject) => {
    const instance = new window.Razorpay!({
      key: RAZORPAY_KEY_ID,
      amount: Math.round(req.amount * 100),
      currency: req.currency,
      name: SHOP.payment.company,
      description: SHOP.payment.description,
      prefill: { name: req.name, email: req.email },
      theme: { color: "#0a0a0a" },
      handler: (response: RazorpayHandlerResponse) =>
        resolve({ paymentId: response.razorpay_payment_id }),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    instance.open();
  });
}
