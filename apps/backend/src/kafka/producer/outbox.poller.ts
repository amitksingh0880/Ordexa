import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'ordexa-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

export async function startOutboxPoller() {
  await producer.connect();
  console.log('[Kafka Producer] Connected');

  setInterval(async () => {
    const events = await prisma.outboxEvent.findMany({
      where: { status: 'pending' },
      take: Number(process.env.POLLER_BATCH_SIZE) || 100,
    });

    for (const event of events) {
      try {
        await producer.send({
          topic: event.topic,
          messages: [{ key: event.key, value: JSON.stringify(event.payload) }],
        });

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'sent', updatedAt: new Date() },
        });

        console.log(`[Outbox] Sent event ${event.id} to ${event.topic}`);
      } catch (err) {
        console.error('[Outbox] Send error:', err);
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'error', retries: { increment: 1 } },
        });
      }
    }
  }, Number(process.env.POLLER_POLL_INTERVAL_MS) || 1000);
}
