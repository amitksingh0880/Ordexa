// apps/backend/src/kafka/producer/outbox.poller.ts
import { PrismaClient } from "@prisma/client";
import { kafka } from "../utils/kafka";
import { gracefulShutdown } from "../utils/shutdown";

const prisma = new PrismaClient();
const topic = "order.created";
const producer = kafka.producer();
let isShuttingDown = false;

export async function startOutboxPoller() {
  await producer.connect();
  console.log("🚀 Kafka producer connected.");

  gracefulShutdown(async () => {
    console.log("👋 Shutting down outbox poller...");
    isShuttingDown = true;
    await producer.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  });

  const pollIntervalMs = 3000;

  const poll = async () => {
    if (isShuttingDown) return;

    try {
      const events = await prisma.outboxEvent.findMany({
        where: { processed: false },
        take: 10,
      });

      for (const event of events) {
        try {
          await producer.send({
            topic,
            messages: [
              {
                key: event.id,
                value: JSON.stringify({
                  eventId: event.id,
                  eventType: event.eventType,
                  data: event.payload,
                  timestamp: event.createdAt,
                }),
              },
            ],
          });

          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { processed: true },
          });

          console.log(`📤 Sent event ${event.id} to Kafka`);
        } catch (err) {
          console.error(`❌ Failed to send event ${event.id}`, err);
        }
      }
    } catch (err) {
      console.error("❌ Polling error:", err);
    }

    setTimeout(poll, pollIntervalMs);
  };

  poll();
}

startOutboxPoller().catch((err) => {
  console.error("❌ Failed to start outbox poller:", err);
  process.exit(1);
});
