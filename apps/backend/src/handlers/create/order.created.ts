// apps/backend/handler/create/createOrder.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createOrder({
  userId,
  status,
  totalAmount,
}: {
  userId: string;
  status: string;
  totalAmount: number;
}) {
  const order = await prisma.order.create({
    data: {
      userId,
      status,
      totalAmount,
    },
  });

  await prisma.outboxEvent.create({
    data: {
      aggregateId: order.id,
      aggregateType: "Order",
      eventType: "OrderCreated",
      payload: {
        orderId: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
    },
  });

  return order;
}
