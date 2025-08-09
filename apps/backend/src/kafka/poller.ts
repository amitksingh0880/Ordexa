import { connectProducer, producer } from "./producer";
import { prisma } from "../lib/prisma";
import { setTimeout } from "node:timers/promises";

const POLL_INTERVAL_MS = 3000;
const MAX_RETRIES = 3;



function getTopicName(eventType: string): string {
  switch (eventType.toLowerCase()) {
    case "ordercreated":
      return "order.created";
    // add more mappings if needed
    default:
      return `order.${eventType.toLowerCase()}`;
  }
}


async function publishEventWithRetry(event: any, topic: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await producer.send({
        topic,
        messages: [
          {
            key: event.aggregateId,
            value: JSON.stringify({
              eventId: event.id,
              orderId: event.aggregateId,
              eventType: event.eventType,
              data: event.payload,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { processed: true },
      });

      console.log(`✅ [${topic}] Sent & marked as processed: ${event.id}`);
      return;
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} failed for ${event.id}`, err);
      await setTimeout(500 * attempt); // simple backoff
    }
  }

  console.error(`❌ Failed to publish after ${MAX_RETRIES} attempts: ${event.id}`);
}

async function pollOutbox() {
  try {
    const events = await prisma.outboxEvent.findMany({
      where: { processed: false },
      take: 10,
    });

    if (events.length === 0) return;

    for (const event of events) {
      const topic = getTopicName(event.eventType);
      await publishEventWithRetry(event, topic);
    }
  } catch (err) {
    console.error("❌ Error during outbox polling", err);
  }
}

async function main() {
  await connectProducer();

  console.log("📦 Outbox Kafka Poller running...");
  setInterval(pollOutbox, POLL_INTERVAL_MS);
}

main();
