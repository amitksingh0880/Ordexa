// src/kafka/handler/orderCreated.ts
import { isEventProcessed, markEventProcessed } from "../utils/deduplicate";
import { insertOrderIntoCassandra } from "../utils/insert";
import { retry } from "../utils/retry";
import type { OrderCreatedEvent } from "../../../types/events";

export async function handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
  const { eventId, data, eventType, timestamp } = event;

  console.log(`📥 Handling OrderCreated event: ${eventId}`);

  // Validate event structure
  if (eventType !== "OrderCreated") {
    throw new Error(`Invalid event type: ${eventType}`);
  }
  if (!eventId || !data?.orderId || !timestamp) {
    throw new Error("Missing required fields: eventId, orderId, or timestamp");
  }
  if (!data?.userId) {
    throw new Error("userId is required in OrderCreated event");
  }

  const { userId, orderId, status, totalAmount, createdAt } = data;

  // Check for duplicate event
  try {
    const alreadyProcessed = await retry(() => isEventProcessed(eventId), {
      retries: 5,
      delay: 1000,
      factor: 2,
    });
    if (alreadyProcessed) {
      console.log(`🔁 Duplicate event detected: ${eventId}`);
      return;
    }
  } catch (error) {
    console.error(`❌ Failed to check deduplication for event ${eventId}:`, error.stack);
    throw new Error(`Deduplication check failed: ${error.message}`);
  }

  console.info(`📦 Inserting into Cassandra:`, { userId, orderId, status, totalAmount, createdAt });

  try {
    // Insert order into Cassandra
    await retry(() => insertOrderIntoCassandra({ userId, orderId, status, totalAmount, createdAt }), {
      retries: 5,
      delay: 1000,
      factor: 2,
    });

    // Mark event as processed
    await retry(() => markEventProcessed(eventId), {
      retries: 5,
      delay: 1000,
      factor: 2,
    });

    console.info(`✅ Order inserted & event marked as processed: ${orderId}`);
  } catch (error) {
    console.error(`❌ Failed to process event ${eventId}:`, error.stack);
    throw new Error(`Event processing failed: ${error.message}`);
  }
}