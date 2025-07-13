import { beforeEach, expect, test } from "bun:test";
import { randomUUID } from "crypto";
import type { OrderCreatedEvent } from "../events/OrderCreatedEvent";
import { handleOrderCreated } from "../../handler/orderCreated";
import { cassandraClient } from "../../utils/cassandra";

beforeEach(async () => {
  // Clear tables before each test for clean state
  await cassandraClient.execute("TRUNCATE event_log");
  await cassandraClient.execute("TRUNCATE orders_by_user");
});

test("should process order.created event without error", async () => {
  const event: OrderCreatedEvent = {
    eventId: randomUUID(),
    orderId: "order-123",
    eventType: "OrderCreated",
    data: {
      userId: randomUUID(),
      status: "Created",
      totalAmount: 120.5,
      createdAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await handleOrderCreated(event);
  } catch (err) {
    console.error("handleOrderCreated rejected:", err);
    throw err;
  }
});



test("should throw if userId is missing", async () => {
  const badEvent = {
    eventId: randomUUID(),
    orderId: "order-invalid",
    eventType: "OrderCreated",
    data: {
      // userId missing intentionally
      status: "Created",
      totalAmount: 80,
      createdAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  } as any;

  await expect(handleOrderCreated(badEvent)).rejects.toThrow(/userId/i);
});