// src/kafka/utils/eventMapper.ts
import { randomUUID } from "crypto";
import type { OrderCreatedEvent } from "../../../types/events";

interface OrderCreatedRequest {
  userId: string;
  totalAmount: number;
  status: string;
}

export function createOrderCreatedEvent(request: OrderCreatedRequest): OrderCreatedEvent {
  const orderId = randomUUID();
  const timestamp = new Date().toISOString();
  return {
    eventId: randomUUID(),
    orderId,
    eventType: "OrderCreated",
    data: {
      userId: request.userId,
      status: request.status,
      totalAmount: request.totalAmount,
      createdAt: timestamp,
    },
    timestamp,
  };
}