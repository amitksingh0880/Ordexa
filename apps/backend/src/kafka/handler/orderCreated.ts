// kafka/handler/orderCreated.ts
import { isEventProcessed, markEventProcessed } from "../utils/deduplicate";
import { insertOrderIntoCassandra } from "../utils/insert";

type OrderCreatedEvent = {
  eventId: string;
  orderId: string;
  eventType: "OrderCreated";
  data: {
    userId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  timestamp: string;
};

export async function handleOrderCreated(event: OrderCreatedEvent) {
  const alreadyProcessed = await isEventProcessed(event.eventId);
  if (alreadyProcessed) {
    console.log(`⚠️ Duplicate event ${event.eventId}, skipping`);
    return;
  }

  console.log("📥 Handling OrderCreated event:", event.orderId);

  await insertOrderIntoCassandra(event.data);
  await markEventProcessed(event.eventId);
  console.log("✅ Order inserted & event marked as processed:", event.orderId);
}
