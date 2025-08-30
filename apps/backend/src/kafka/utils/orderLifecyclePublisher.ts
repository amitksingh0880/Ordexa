import { producer } from "../producer";
import { v4 as uuidv4 } from "uuid";

interface OrderLifecycleEvent {
  eventType: string;
  data: Record<string, any>;
}

export async function publishOrderLifecycleEvent(event: OrderLifecycleEvent) {
  const payload = {
    eventId: uuidv4(),
    eventType: event.eventType,
    data: event.data,
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic: "order-lifecycle",
    messages: [
      {
        key: payload.data.orderId,
        value: JSON.stringify(payload),
      },
    ],
  });

  console.log(`📤 Published event: ${payload.eventType} for order ${payload.data.orderId}`);
}
