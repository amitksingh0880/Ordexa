// import { insertOrderIntoCassandra } from "../utils/insert";
// import { insertProcessedEvent } from "../utils/insert"; // You need to implement this similarly

// export async function handleOrderCreated(event: any) {
//   const { eventId, eventType, data, timestamp } = event;

//   // Accept orderId either from event.orderId or data.orderId
//   const orderId = event.orderId ?? data?.orderId;
//   const userId = data?.userId;
//   const createdAt = data?.createdAt;

//   if (eventType !== "OrderCreated") {
//     throw new Error(`Invalid event type: ${eventType}`);
//   }
//   if (!eventId || !orderId || !userId || !createdAt) {
//     throw new Error("Missing required fields: eventId, orderId, userId, or createdAt");
//   }

//   const orderData = {
//     userId,
//     orderId,
//     status: data.status || "Created",
//     totalAmount: data.totalAmount ?? 0,
//     createdAt,
//     updatedAt: data.updatedAt || createdAt,
//     currency: data.currency || null,
//     description: data.description || null,
//   };

//   // Continue with Cassandra insert and processed event marking
//   await insertOrderIntoCassandra(orderData);
//   await insertProcessedEvent({ eventId, processedAt: new Date().toISOString() });
// }



import { insertOrderIntoCassandra, insertProcessedEvent } from "../utils/insert";
import { OrderStateMachine } from "../../state-machine/order.state-machine";
import { publishOrderLifecycleEvent } from "../utils/orderLifecyclePublisher";
import type { OrderState } from "../../state-machine/order.types";

export async function handleOrderCreated(event: any) {
  const { eventId, eventType, data, timestamp } = event;

  const orderId = event.orderId ?? data?.orderId;
  const userId = data?.userId;
  const createdAt = data?.createdAt;

  if (eventType !== "OrderCreated") {
    throw new Error(`Invalid event type: ${eventType}`);
  }
  if (!eventId || !orderId || !userId || !createdAt) {
    throw new Error("Missing required fields: eventId, orderId, userId, or createdAt");
  }

  const initialStatus: OrderState = data.status || "Created";
  const sm = new OrderStateMachine(initialStatus);

  let nextStatus: OrderState;

  try {
    nextStatus = sm.transition("CONFIRM_ORDER");
  } catch (e) {
    console.error(`Failed state transition:`, e);
    throw e;
  }

  const orderData = {
    userId,
    orderId,
    status: nextStatus,
    totalAmount: data.totalAmount ?? 0,
    createdAt,
    updatedAt: data.updatedAt || createdAt,
    currency: data.currency || null,
    description: data.description || null,
  };

  await insertOrderIntoCassandra(orderData);
  await insertProcessedEvent({ eventId, processedAt: new Date().toISOString() });

  // ✅ Publish Kafka Event
  await publishOrderLifecycleEvent({
    eventType: "OrderConfirmed",
    data: orderData,
  });

  console.log(`✅ Order ${orderId} transitioned to ${nextStatus}`);
}
