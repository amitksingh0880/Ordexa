// src/kafka/tests/handler/orderCreated.test.ts
import { beforeAll, beforeEach, afterAll, expect, test } from "bun:test";
import { randomUUID } from "crypto";
import { handleOrderCreated } from "../../handler/orderCreated";
import { cassandraClient, connectCassandra } from "../../utils/cassandra";
import type { OrderCreatedEvent } from "../../../../types/events";

// Connect once before all tests
beforeAll(async () => {
  await connectCassandra();
});

// Clean up after all tests
afterAll(async () => {
  await cassandraClient.shutdown();
});

// Reset DB state before each test
beforeEach(async () => {
  await cassandraClient.execute("TRUNCATE event_log");
  await cassandraClient.execute("TRUNCATE orders_by_user");
});

test("should process order.created event without error", async () => {
  const event: OrderCreatedEvent = {
    eventId: randomUUID(),
    orderId: randomUUID(),
    eventType: "OrderCreated",
    data: {
      userId: "123e4567-e89b-12d3-a456-426614174002",
      status: "Created",
      totalAmount: 1500,
      createdAt: "2025-07-27T15:30:00.000Z",
    },
    timestamp: "2025-07-27T15:30:00.000Z",
  };

  await expect(handleOrderCreated(event)).resolves.toBeUndefined();
});

test("should skip processing if event is already in event_log", async () => {
  const eventId = randomUUID();

  // Insert dummy event into event_log
  await cassandraClient.execute(
    "INSERT INTO event_log (event_id) VALUES (?)",
    [Types.u.fromString(eventId)],
    { prepare: true }
  );

  const event: OrderCreatedEvent = {
    eventId,
    orderId: "order-67890",
    eventType: "OrderCreated",
    data: {
      userId: "123e4567-e89b-12d3-a456-426614174003",
      orderId: "order-67890",
      status: "Created",
      totalAmount: 49.99,
      createdAt: "2025-07-27T15:35:00.000Z",
    },
    timestamp: "2025-07-27T15:35:00.000Z",
  };

  await expect(handleOrderCreated(event)).resolves.toBeUndefined();
});

test("should throw if userId is missing", async () => {
  const badEvent: OrderCreatedEvent = {
    eventId: randomUUID(),
    orderId: "order-11111",
    eventType: "OrderCreated",
    data: {
      orderId: "order-11111",
      status: "Created",
      totalAmount: 80.0,
      createdAt: "2025-07-27T15:40:00.000Z",
    },
    timestamp: "2025-07-27T15:40:00.000Z",
  };

  await expect(handleOrderCreated(badEvent)).rejects.toThrow(/userId/i);
});