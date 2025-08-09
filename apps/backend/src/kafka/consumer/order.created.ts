import { Kafka } from 'kafkajs';
import { cassandra, initCassandra } from '../utils/cassandra';


const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'ordexa-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({
  groupId: process.env.CONSUMER_GROUP || 'ordexa-consumers',
});

export async function startOrderCreatedConsumer() {
  await initCassandra();
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_OUTBOX_TOPIC || 'order.created',
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value?.toString() || '{}');

        // Example: insert into Cassandra read model
        await cassandra.execute(
          'INSERT INTO orders_by_customer (customer_id, order_id, status) VALUES (?, ?, ?)',
          [payload.customerId, payload.id, payload.status],
          { prepare: true }
        );

        console.log(`[Consumer] Processed order.created: ${payload.id}`);
      } catch (err) {
        console.error(`[Consumer] Error processing message: ${err}`);
        // TODO: Optionally send to DLQ
      }
    },
  });
}
