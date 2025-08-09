// apps/backend/src/kafka/consumer/order.created.ts
import { kafka } from "../utils/kafka";
import { insertOrderIntoCassandra } from "../utils/insert";
import { isEventProcessed, markEventProcessed } from "../utils/deduplicate";

const topic = "order.created";
const groupId = "order-consumer-group";

export async function startConsumer() {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  console.log("📡 Connected to Kafka as consumer");

  await consumer.subscribe({ topic, fromBeginning: false });
  console.log(`📥 Subscribed to topic: ${topic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());
        console.log("📥 Received event:", event);

        const { eventId, data } = event;

        const alreadyProcessed = await isEventProcessed(eventId);
        if (alreadyProcessed) {
          console.log(`⚠️  Duplicate event skipped: ${eventId}`);
          return;
        }

        console.log(`📦 Inserting into Cassandra:`, data);
        let cassandraInsertSuccess = false;
        try {
          await insertOrderIntoCassandra({
            orderId: data.orderId,
            userId: data.userId,
            status: data.status,
            totalAmount: data.totalAmount,
            createdAt: data.createdAt,
          });
          cassandraInsertSuccess = true;
        } catch (insertErr) {
          console.error(`❌ Failed to insert order ${data.orderId} into Cassandra:`, insertErr);
          // Optionally, send alert/notification here for manual intervention
        }

        await markEventProcessed(eventId);
        if (cassandraInsertSuccess) {
          console.log(`✅ Inserted order ${data.orderId} into Cassandra & marked as processed`);
        } else {
          console.warn(`⚠️  Marked event ${eventId} as processed despite Cassandra insertion failure. Manual intervention may be required.`);
        }
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    },
  });
}

startConsumer().catch((err) => {
  console.error("❌ Consumer startup error:", err);
});
