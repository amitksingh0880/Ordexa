import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { runOrderOrchestration } from "../orchestration/orderOrchestrator";
import { isTemporalEnabled } from "../temporal/client";
import { INVENTORY_DEFAULTS, ORDER_EVENT, OrderStatus } from "../constants/orders";

export interface CreateOrderInput {
  tenantId: string;
  userId: string;
  totalAmount: number;
  status?: string;
  description?: string;
  sku?: string;
  quantity?: number;
}

export interface CreateOrderResult {
  id: string;
  status: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const orderId = randomUUID();
    const sku = input.sku ?? INVENTORY_DEFAULTS.sku;
    const quantity = input.quantity ?? INVENTORY_DEFAULTS.quantity;
    const now = new Date();

    // Persist the order (Pending) plus an outbox/audit record atomically.
    await prisma.$transaction([
      prisma.order.create({
        data: {
          id: orderId,
          tenantId: input.tenantId,
          userId: input.userId,
          status: OrderStatus.Pending,
          totalAmount: input.totalAmount,
          description: input.description,
          sku,
          quantity,
        },
      }),
      prisma.outboxEvent.create({
        data: {
          id: randomUUID(),
          aggregateId: orderId,
          aggregateType: ORDER_EVENT.aggregateType,
          eventType: ORDER_EVENT.createdType,
          payload: {
            userId: input.userId,
            totalAmount: input.totalAmount,
            sku,
            quantity,
            createdAt: now,
          },
        },
      }),
    ]);

    // Drive the inventory saga. Temporal path returns immediately (worker
    // finishes asynchronously); in-process path runs to completion and throws
    // on terminal failure (e.g. out of stock), which the handler maps to 409.
    await runOrderOrchestration({
      orderId,
      userId: input.userId,
      sku,
      quantity,
      totalAmount: input.totalAmount,
    });

    return {
      id: orderId,
      status: isTemporalEnabled() ? OrderStatus.Pending : OrderStatus.Confirmed,
    };
  }
}
