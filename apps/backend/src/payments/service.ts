import { createHmac } from "node:crypto";
import { prisma } from "../lib/prisma";
import { config } from "../config/env";
import { razorpay } from "./razorpay";
import { OrderStatus, PaymentStatus, PAYMENT_METHOD } from "../constants/orders";
import { fulfillPaidOrder } from "./fulfillment";
import type { CreatePaymentOrderInput, VerifyPaymentInput } from "./schemas";

export class EmptyCartError extends Error {}
export class OrderNotFoundError extends Error {}
export class SignatureError extends Error {}

const PAISE = 100;

const resolveShipping = (subtotal: number, methodId: string) => {
  const method =
    config.shipping.methods.find((m) => m.id === methodId) ?? config.shipping.methods[0];
  const cost = subtotal >= config.shipping.freeThreshold ? 0 : method.cost;
  return { method, cost };
};

export interface PaymentOrderResult {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

export const createPaymentOrder = async (
  userId: string,
  input: CreatePaymentOrderInput,
): Promise<PaymentOrderResult> => {
  const lines = await prisma.cartItem.findMany({ where: { cartId: input.cartId } });
  if (lines.length === 0) throw new EmptyCartError("Cart is empty");

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const { method, cost } = resolveShipping(subtotal, input.shippingMethodId);
  const total = subtotal + cost;
  const currency = config.shipping.currency;

  const order = await prisma.order.create({
    data: {
      userId,
      status: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Unpaid,
      paymentMethod: PAYMENT_METHOD.razorpay,
      totalAmount: total,
      currency,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      shippingMethod: method.id,
      shippingCost: cost,
      shippingAddress: input.shippingAddress,
      items: lines.map((l) => ({
        productSlug: l.productSlug,
        name: l.name,
        price: l.price,
        finish: l.finish,
        quantity: l.quantity,
      })),
    },
  });

  if (razorpay) {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * PAISE),
      currency,
      receipt: order.id,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });
    return {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: total,
      currency,
      keyId: config.payments.razorpay.keyId,
      mock: false,
    };
  }

  const mockOrderId = `order_mock_${order.id}`;
  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: mockOrderId },
  });
  return { orderId: order.id, razorpayOrderId: mockOrderId, amount: total, currency, keyId: null, mock: true };
};

const isSignatureValid = (input: VerifyPaymentInput): boolean => {
  if (!razorpay) return true; // mock gateway: nothing to verify
  if (!input.signature) return false;
  const expected = createHmac("sha256", config.payments.razorpay.keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return expected === input.signature;
};

export const verifyPayment = async (userId: string, input: VerifyPaymentInput) => {
  const order = await prisma.order.findFirst({ where: { id: input.orderId, userId } });
  if (!order) throw new OrderNotFoundError("Order not found");
  if (order.paymentStatus === PaymentStatus.Paid) return order;

  if (!isSignatureValid(input)) throw new SignatureError("Payment signature mismatch");

  const paid = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PaymentStatus.Paid,
      paymentId: input.razorpayPaymentId,
      status: OrderStatus.Confirmed,
    },
  });

  await fulfillPaidOrder(paid.id);
  await prisma.cartItem.deleteMany({ where: { cartId: order.userId } });
  return paid;
};
