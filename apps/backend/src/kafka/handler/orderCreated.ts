import { insertOrderIntoCassandra } from "../utils/insert";
import { insertProcessedEvent } from "../utils/insert"; // You need to implement this similarly

export async function handleOrderCreated(event: any) {
  const { eventId, eventType, data, timestamp } = event;

  // Accept orderId either from event.orderId or data.orderId
  const orderId = event.orderId ?? data?.orderId;
  const userId = data?.userId;
  const createdAt = data?.createdAt;

  if (eventType !== "OrderCreated") {
    throw new Error(`Invalid event type: ${eventType}`);
  }
  if (!eventId || !orderId || !userId || !createdAt) {
    throw new Error("Missing required fields: eventId, orderId, userId, or createdAt");
  }

  const orderData = {
    userId,
    orderId,
    status: data.status || "Created",
    totalAmount: data.totalAmount ?? 0,
    createdAt,
    updatedAt: data.updatedAt || createdAt,
    currency: data.currency || null,
    description: data.description || null,
  };

  // Continue with Cassandra insert and processed event marking
  await insertOrderIntoCassandra(orderData);
  await insertProcessedEvent({ eventId, processedAt: new Date().toISOString() });
}

