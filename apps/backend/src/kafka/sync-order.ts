import { connectConsumer, consumer } from "./consumer";
import { cassandra } from "../lib/cassandra";

// Define a new table for deduplication (one-time setup)
/*
CREATE TABLE IF NOT EXISTS event_log (
  event_id UUID PRIMARY KEY,
  created_at TIMESTAMP
);
*/

async function isDuplicate(eventId: string): Promise<boolean> {
  const query = `SELECT event_id FROM event_log WHERE event_id = ?`;
  const result = await cassandra.execute(query, [eventId], { prepare: true });
  return result.rowLength > 0;
}

async function markEventProcessed(eventId: string) {
  const query = `INSERT INTO event_log (event_id, created_at) VALUES (?, ?)`;
  await cassandra.execute(query, [eventId, new Date()], { prepare: true });
}

async function writeToCassandra(event: any) {
  const { userId, status, totalAmount, createdAt } = event.data;
  const query = `
    INSERT INTO orders_by_user (user_id, order_id, status, total_amount, created_at)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    event.orderId,
    status,
    totalAmount,
    new Date(createdAt),
  ];
  await cassandra.execute(query, params, { prepare: true });
}

async function handleEvent(event: any) {
  const { eventId } = event;
  if (await isDuplicate(eventId)) {
    console.log(`⚠️ Duplicate event: ${eventId} — Skipping`);
    return;
  }

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await writeToCassandra(event);
      await markEventProcessed(eventId);
      console.log(`✅ Order ${event.orderId} synced & logged`);
      return;
    } catch (err) {
      attempts++;
      console.error(`❌ Sync failed [${attempts}/${maxAttempts}]`, err);
      await new Promise(res => setTimeout(res, 500 * attempts)); // backoff
    }
  }

  console.error(`💥 Failed after ${maxAttempts} attempts: ${eventId}`);
}

export async function startOrderSyncConsumer() {
  await connectConsumer();

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const raw = message.value?.toString();
        if (!raw) return;

        const event = JSON.parse(raw);
        console.log(`📥 Received: ${event.eventType} → ${event.orderId}`);
        await handleEvent(event);
      } catch (err) {
        console.error("🔥 Failed to process Kafka message:", err);
      }
    },
  });
}

startOrderSyncConsumer();
