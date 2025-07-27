import { insertOrderIntoCassandra } from "../utils/insert";
import { isEventProcessed, markEventProcessed } from "../utils/deduplicate";
import type { OrderCreatedEvent } from "../../../types/events";
import { retry } from "../utils/retry";

export async function handleOrderCreated(event: OrderCreatedEvent) {
  const eventId = event.eventId;

  console.log(`📥 Handling OrderCreated event: ${eventId}`);

  try {
    const alreadyProcessed = await isEventProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`🔁 Duplicate event detected: ${eventId}`);
      return;
    }

    await retry(() => insertOrderIntoCassandra(event.data), {
      retries: 5,
      delay: 1000,
      factor: 2
    });

    await retry(() => markEventProcessed(eventId), {
      retries: 5,
      delay: 1000,
      factor: 2
    });

    console.log(`✅ Order inserted & event marked as processed: ${event.data.orderId}`);
  } catch (error) {
    console.error(`❌ Failed to process event ${eventId}:`, error);
    throw error;
  }
}
