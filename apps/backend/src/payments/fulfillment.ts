import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { ORDER_EVENT } from "../constants/orders";
import { confirmSale, type SaleLine } from "../services/inventory.service";
import { sendEmail } from "../notify/mailer";
import { orderConfirmationEmail } from "../notify/templates";

interface OrderLine {
  productSlug: string;
  quantity: number;
}

// Runs once after a payment is verified: decrements stock for the purchased
// lines (inventory sku == product slug), emails the customer, records the event.
export const fulfillPaidOrder = async (orderId: string): Promise<void> => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const items = (order.items as OrderLine[] | null) ?? [];
  const lines: SaleLine[] = items.map((l) => ({ sku: l.productSlug, quantity: l.quantity }));
  if (lines.length > 0) await confirmSale(lines);

  if (order.customerEmail) await sendEmail(orderConfirmationEmail(order));

  await prisma.outboxEvent.create({
    data: {
      id: randomUUID(),
      aggregateId: orderId,
      aggregateType: ORDER_EVENT.aggregateType,
      eventType: ORDER_EVENT.paidType,
      payload: { orderId },
    },
  });
};
