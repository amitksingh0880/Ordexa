import { paymentsHttp } from "./http";
import { PAYMENT_ENDPOINTS } from "../constants/app";

export interface ShippingMethod {
  id: string;
  label: string;
  cost: number;
  etaDays: number;
}

export interface PaymentConfig {
  razorpay: { enabled: boolean; keyId: string | null };
  shipping: { currency: string; freeThreshold: number; methods: ShippingMethod[] };
}

export interface CreateOrderPayload {
  cartId: string;
  shippingMethodId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerName: string;
  customerEmail: string;
  couponCode?: string;
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  code?: string;
  message?: string;
}

export interface CreatedOrder {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

export interface VerifyPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature?: string;
}

export const paymentsApi = {
  async getConfig(): Promise<PaymentConfig> {
    const { data } = await paymentsHttp.get<{ data: PaymentConfig }>(PAYMENT_ENDPOINTS.config);
    return data.data;
  },
  async createOrder(payload: CreateOrderPayload): Promise<CreatedOrder> {
    const { data } = await paymentsHttp.post<{ data: CreatedOrder }>(
      PAYMENT_ENDPOINTS.createOrder,
      payload,
    );
    return data.data;
  },
  async verify(payload: VerifyPayload): Promise<void> {
    await paymentsHttp.post(PAYMENT_ENDPOINTS.verify, payload);
  },
  async validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
    const { data } = await paymentsHttp.post<{ data: CouponResult }>(
      PAYMENT_ENDPOINTS.validateCoupon,
      { code, subtotal },
    );
    return data.data;
  },
};
